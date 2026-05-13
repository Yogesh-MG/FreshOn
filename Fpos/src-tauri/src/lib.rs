
use image::{GenericImageView};
use std::path::Path;

#[cfg(windows)]
use winapi::shared::minwindef::DWORD;
#[cfg(windows)]
use winapi::um::winspool::{
    ClosePrinter, EndDocPrinter, EndPagePrinter, GetDefaultPrinterW, OpenPrinterW,
    StartDocPrinterW, StartPagePrinter, WritePrinter, DOC_INFO_1W,
};

#[cfg(windows)]
fn get_default_printer_name() -> Result<String, String> {
    unsafe {
        let mut size: DWORD = 0;
        GetDefaultPrinterW(std::ptr::null_mut(), &mut size);
        if size == 0 {
            return Err("No default printer configured".to_string());
        }
        let mut buf: Vec<u16> = vec![0; size as usize];
        if GetDefaultPrinterW(buf.as_mut_ptr(), &mut size) == 0 {
            return Err("Failed to get default printer name".to_string());
        }
        let len = buf.iter().position(|&c| c == 0).unwrap_or(buf.len());
        Ok(String::from_utf16_lossy(&buf[..len]))
    }
}

#[cfg(windows)]
fn send_raw_to_printer(printer_name: &str, data: &[u8]) -> Result<(), String> {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;

    unsafe {
        let name_wide: Vec<u16> = OsStr::new(printer_name).encode_wide().chain(Some(0)).collect();
        let mut hprinter: winapi::um::winnt::HANDLE = std::ptr::null_mut();

        if OpenPrinterW(name_wide.as_ptr() as *mut _, &mut hprinter, std::ptr::null_mut()) == 0 {
            return Err(format!("Failed to open printer: {}", printer_name));
        }

        let doc_name: Vec<u16> = OsStr::new("POS Command").encode_wide().chain(Some(0)).collect();
        let data_type: Vec<u16> = OsStr::new("RAW").encode_wide().chain(Some(0)).collect();

        let doc_info = DOC_INFO_1W {
            pDocName: doc_name.as_ptr() as *mut _,
            pOutputFile: std::ptr::null_mut(),
            pDatatype: data_type.as_ptr() as *mut _,
        };

        if StartDocPrinterW(hprinter, 1, &doc_info as *const _ as *mut _) == 0 {
            ClosePrinter(hprinter);
            return Err("Failed to start print document".to_string());
        }

        if StartPagePrinter(hprinter) == 0 {
            EndDocPrinter(hprinter);
            ClosePrinter(hprinter);
            return Err("Failed to start print page".to_string());
        }

        let mut written: DWORD = 0;
        let data_len = data.len() as DWORD;
        if WritePrinter(hprinter, data.as_ptr() as *mut _, data_len, &mut written) == 0 {
            EndPagePrinter(hprinter);
            EndDocPrinter(hprinter);
            ClosePrinter(hprinter);
            return Err("Failed to write to printer".to_string());
        }

        EndPagePrinter(hprinter);
        EndDocPrinter(hprinter);
        ClosePrinter(hprinter);
        Ok(())
    }
}

#[cfg(windows)]
fn get_image_bits(path: &str, target_width: u32) -> Result<Vec<u8>, String> {
    let img = image::open(Path::new(path))
        .map_err(|e| format!("Failed to open image: {}", e))?;
    
    // Maintain Aspect Ratio
    let (orig_w, orig_h) = img.dimensions();
    let target_height = (orig_h * target_width) / orig_w;
    let resized = img.resize(target_width, target_height, image::imageops::FilterType::Nearest);
    let (width, height) = resized.dimensions();
    
    // CENTER THE LOGO on 576-dot paper
    let paper_width = 576; // 80mm printer (Tenax TP-80)
    let left_padding_dots = (paper_width - width) / 2;
    let width_bytes = paper_width / 8; // 72 bytes
    let gray = resized.to_luma8();
    
    let mut data = Vec::new();
    let xl = (width_bytes % 256) as u8;
    let xh = (width_bytes / 256) as u8;
    let yl = (height % 256) as u8;
    let yh = (height / 256) as u8;
    
    // GS v 0 m xL xH yL yH
    data.extend_from_slice(&[0x1D, 0x76, 0x30, 0, xl, xh, yl, yh]);
    
    for y in 0..height {
        for x_byte in 0..width_bytes {
            let mut byte = 0u8;
            for bit in 0..8 {
                let current_dot = x_byte * 8 + bit;
                if current_dot >= left_padding_dots && current_dot < left_padding_dots + width {
                    let img_x = current_dot - left_padding_dots;
                    if gray.get_pixel(img_x, y)[0] < 240 { // ULTRA-BOLD
                        byte |= 1 << (7 - bit);
                    }
                }
            }
            data.push(byte);
        }
    }
    Ok(data)
}

#[tauri::command]
fn open_cash_drawer() -> Result<(), String> {
    #[cfg(windows)]
    {
        let printer_name = get_default_printer_name()?;
        let drawer_pulse: Vec<u8> = vec![27, 112, 0, 25, 250];
        send_raw_to_printer(&printer_name, &drawer_pulse)?;
        Ok(())
    }
    #[cfg(not(windows))]
    {
        println!("Cash drawer pulse not implemented on this platform");
        Ok(())
    }
}

#[tauri::command]
fn print_receipt(printer_name: String, content: String, include_logo: bool, is_pride: bool) -> Result<(), String> {
    #[cfg(windows)]
    {
        let target = if printer_name.is_empty() {
            get_default_printer_name()?
        } else {
            printer_name
        };

        let mut data: Vec<u8> = Vec::new();
        
        // Initialize printer
        data.extend_from_slice(b"\x1B\x40");
        
        // Set code page to PC437 (safest for ASCII + line chars)
        data.extend_from_slice(b"\x1B\x74\x00");
        
        // Set character spacing to 0
        data.extend_from_slice(b"\x1B\x20\x00");

        // 1. Main Logo
        if include_logo {
            // Center the logo
            data.extend_from_slice(b"\x1B\x61\x01");
            let logo_path = r#"C:\dev\Freshon.in\Fpos\public\logo.png"#;
            match get_image_bits(logo_path, 320) {
                Ok(logo_bits) => {
                    data.extend_from_slice(&logo_bits);
                    data.push(b'\n');
                },
                Err(e) => println!("LOGO ERROR: {}", e),
            }
        }

        // 2. PRIDE Seal Image
        if is_pride {
            data.extend_from_slice(b"\x1B\x61\x01");
            let pride_path = r#"C:\dev\Freshon.in\Fpos\public\PRIDE.png"#;
            match get_image_bits(pride_path, 180) {
                Ok(pride_bits) => {
                    data.extend_from_slice(&pride_bits);
                    data.extend_from_slice(b"\n");
                },
                Err(e) => println!("PRIDE ERROR: {}", e),
            }
        }
        
        // Reset to left after images
        data.extend_from_slice(b"\x1B\x61\x00");

        // ── Tag parser ──────────────────────────────────────────────
        // Track current alignment so we can restore it after [HR]
        // because the raster GS v 0 command doesn't preserve alignment.
        let mut current_align: u8 = 0x00; // 0=left, 1=center, 2=right

        let mut current_pos = 0;
        let content_str = &content;

        while current_pos < content_str.len() {
            let remaining = &content_str[current_pos..];

            // ── Barcode ──
            if remaining.starts_with("[BAR]") {
                current_pos += 5;
                let rest = &content_str[current_pos..];
                if let Some(end_idx) = rest.find("[bar]") {
                    let barcode_data = &rest[..end_idx];
                    // GS k m n d1...dn  (CODE128 = type 73)
                    data.extend_from_slice(&[0x1D, 0x6B, 73, barcode_data.len() as u8]);
                    data.extend_from_slice(barcode_data.as_bytes());
                    current_pos += end_idx + 5;
                    
                    if current_pos < content_str.len() && content_str[current_pos..].starts_with('\n') {
                        current_pos += 1;
                    }
                    continue;
                }
            }

            // ── QR Code ──
            if remaining.starts_with("[QR]") {
                current_pos += 4;
                let rest = &content_str[current_pos..];
                if let Some(end_idx) = rest.find("[qr]") {
                    let qr_data = &rest[..end_idx];
                    let qr_len = qr_data.len() + 3;
                    let p_l = (qr_len % 256) as u8;
                    let p_h = (qr_len / 256) as u8;
                    // Set QR size (module size = 3)
                    data.extend_from_slice(&[0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x03]);
                    // Set error correction level M
                    data.extend_from_slice(&[0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x30]);
                    // Store QR data
                    data.extend_from_slice(&[0x1D, 0x28, 0x6B, p_l, p_h, 0x31, 0x50, 0x30]);
                    data.extend_from_slice(qr_data.as_bytes());
                    // Print QR
                    data.extend_from_slice(&[0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30]);
                    current_pos += end_idx + 4;
                    
                    if current_pos < content_str.len() && content_str[current_pos..].starts_with('\n') {
                        current_pos += 1;
                    }
                    continue;
                }
            }

            // ── Alignment tags ── (track state for post-HR restore)
            if remaining.starts_with("[C]") {
                current_align = 0x01;
                data.extend_from_slice(b"\x1B\x61\x01");
                current_pos += 3;
                continue;
            }
            if remaining.starts_with("[c]") {
                current_align = 0x00;
                data.extend_from_slice(b"\x1B\x61\x00");
                current_pos += 3;
                continue;
            }
            if remaining.starts_with("[R]") {
                current_align = 0x02;
                data.extend_from_slice(b"\x1B\x61\x02");
                current_pos += 3;
                continue;
            }
            if remaining.starts_with("[r]") {
                current_align = 0x00;
                data.extend_from_slice(b"\x1B\x61\x00");
                current_pos += 3;
                continue;
            }
            if remaining.starts_with("[L]") || remaining.starts_with("[l]") {
                current_align = 0x00;
                data.extend_from_slice(b"\x1B\x61\x00");
                current_pos += 3;
                continue;
            }

            // ── Bold ──
            if remaining.starts_with("[B]") {
                data.extend_from_slice(b"\x1B\x45\x01");
                current_pos += 3;
                continue;
            }
            if remaining.starts_with("[b]") {
                data.extend_from_slice(b"\x1B\x45\x00");
                current_pos += 3;
                continue;
            }

            // ── Font size ──
            if remaining.starts_with("[S]") {
                data.extend_from_slice(b"\x1B\x4D\x01"); // Font B (smaller)
                current_pos += 3;
                continue;
            }
            if remaining.starts_with("[s]") {
                data.extend_from_slice(b"\x1B\x4D\x00"); // Font A (normal)
                current_pos += 3;
                continue;
            }

            // ── Horizontal Rule ──
            // KEY FIX: after GS v 0 raster line, re-emit alignment + newline
            if remaining.starts_with("[HR]") {
                // 80mm = 576 dots wide = 72 bytes per row, 2 rows tall
                data.extend_from_slice(&[0x1D, 0x76, 0x30, 0x00, 0x48, 0x00, 0x02, 0x00]);
                for _ in 0..144 { data.push(0xFF); } // 72 bytes × 2 rows
                // CRITICAL: restore alignment after raster graphic
                data.extend_from_slice(&[0x1B, 0x61, current_align]); // restore alignment
                current_pos += 4;
                
                // Skip next newline if it follows immediately to remove the 1x gap
                if current_pos < content_str.len() && content_str[current_pos..].starts_with('\n') {
                    current_pos += 1;
                }
                continue;
            }

            // ── Newline — re-emit alignment after each line feed ──
            if remaining.starts_with('\n') {
                data.push(b'\n');
                data.extend_from_slice(&[0x1B, 0x61, current_align]);
                current_pos += 1;
                continue;
            }

            // ── Normal UTF-8 character ──
            let ch = content_str[current_pos..].chars().next().unwrap();
            let mut buf = [0u8; 4];
            let encoded = ch.encode_utf8(&mut buf);
            data.extend_from_slice(encoded.as_bytes());
            current_pos += ch.len_utf8();
        }

        // 3. Kannada Footer Image
        let footer_path = r#"C:\dev\Freshon.in\Fpos\public\kannada_footer.png"#;
        if std::path::Path::new(footer_path).exists() {
            data.extend_from_slice(b"\x1B\x61\x01"); // Center
            match get_image_bits(footer_path, 576) { // Full width 576
                Ok(footer_bits) => {
                    data.extend_from_slice(&footer_bits);
                    data.push(b'\n');
                },
                Err(e) => println!("FOOTER ERROR: {}", e),
            }
        }

        // Feed and cut
        for _ in 0..8 { data.push(b'\n'); }
        data.extend_from_slice(b"\x1D\x56\x00");

        send_raw_to_printer(&target, &data)?;
        Ok(())
    }
    #[cfg(not(windows))]
    {
        println!("Print receipt: {}", content);
        Ok(())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_printer_v2::init())
        .invoke_handler(tauri::generate_handler![open_cash_drawer, print_receipt])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
