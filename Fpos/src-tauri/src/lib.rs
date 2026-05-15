use image::{GenericImageView, RgbImage, Rgb};
use rusttype::{Font, Scale, point};
use std::path::Path;

#[cfg(windows)]
use winapi::shared::minwindef::DWORD;
#[cfg(windows)]
use winapi::um::winspool::{
    ClosePrinter, EndDocPrinter, EndPagePrinter, GetDefaultPrinterW, OpenPrinterW,
    StartDocPrinterW, StartPagePrinter, WritePrinter, DOC_INFO_1W,
};

// ── Windows Printer Plumbing ───────────────────────────────────────────
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
        let doc_name: Vec<u16> = OsStr::new("POS Receipt").encode_wide().chain(Some(0)).collect();
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

// ── Graphics Engine Constants ──────────────────────────────────────────
const PAPER_WIDTH: u32 = 576;

// ── Raster Primitives ──────────────────────────────────────────────────
fn draw_rect_with_grid(img: &mut RgbImage, cy: &mut u32, off: u32, len: u32, h: u32, grid: Vec<u32>) {
    for y in 0..h {
        let py = *cy + y;
        if py >= img.height() { break; }
        for x in 0..PAPER_WIDTH {
            let in_main = x >= off && x < (off + len);
            let is_grid = grid.iter().any(|&gx| x == gx || x == gx + 1);
            if in_main || is_grid {
                img.put_pixel(x, py, Rgb([0, 0, 0]));
            }
        }
    }
    *cy += h;
}

fn get_image_bits_bold(path: &str, target_width: u32) -> Result<RgbImage, String> {
    let img = image::open(Path::new(path)).map_err(|e| e.to_string())?;
    let (ow, oh) = img.dimensions();
    let target_height = (oh * target_width) / ow;
    let resized = img.resize(target_width, target_height, image::imageops::FilterType::Nearest);
    let (w, h) = resized.dimensions();
    let gray = resized.to_luma8();
    
    let mut bold_img = RgbImage::new(w, h);
    for p in bold_img.pixels_mut() { *p = Rgb([255, 255, 255]); }
    
    for y in 0..h {
        for x in 0..w {
            if gray.get_pixel(x, y)[0] < 200 {
                for dy in -1i32..=1 {
                    for dx in -1i32..=1 {
                        let nx = x as i32 + dx;
                        let ny = y as i32 + dy;
                        if nx >= 0 && nx < w as i32 && ny >= 0 && ny < h as i32 {
                            bold_img.put_pixel(nx as u32, ny as u32, Rgb([0, 0, 0]));
                        }
                    }
                }
            }
        }
    }
    Ok(bold_img)
}

// ── Text Rendering Helpers ─────────────────────────────────────────────
fn wrap_text(t: &str, f: &Font, s: Scale, max_w: f32) -> Vec<String> {
    let mut lines = Vec::new();
    let mut cur = String::new();
    for w in t.split_whitespace() {
        let test = if cur.is_empty() { w.to_string() } else { format!("{} {}", cur, w) };
        let tw = f.layout(&test, s, point(0.0, 0.0)).last()
            .map(|g| g.pixel_bounding_box().map(|bb| bb.max.x).unwrap_or(0)).unwrap_or(0) as f32;
        if tw > max_w && !cur.is_empty() {
            lines.push(cur);
            cur = w.to_string();
        } else {
            cur = test;
        }
    }
    if !cur.is_empty() { lines.push(cur); }
    if lines.is_empty() { lines.push(" ".to_string()); }
    lines
}

fn flush_txt(
    img: &mut RgbImage,
    f: &Font,
    t: &mut String,
    y: &mut u32,
    bold: bool,
    sh: f32,
    sw: f32,
    al: u8,
) {
    if t.is_empty() { return; }
    let s = Scale { x: 20.0 * sw, y: 20.0 * sh };
    let vm = f.v_metrics(s);
    let parts: Vec<&str> = t.split('|').collect();

    if parts.len() > 1 {
        // Table logic
        let is_gst_sub = parts.len() == 6;
        let is_gst_main = parts.len() == 4 && (t.contains("Value") || t.contains("CGST"));
        let is_payment = t.contains("Payment") || (parts.len() == 2 && !t.contains("Item Name"));
        
        let bounds = if is_gst_sub {
            vec![0, 120, 200, 280, 360, 440, 576]
        } else if is_gst_main {
            vec![0, 120, 280, 440, 576]
        } else if is_payment {
            vec![0, 320, 576]
        } else {
            vec![0, 48, 280, 360, 460, 576]
        };

        let mut max_lines = 1;
        let mut wrapped: Vec<Vec<String>> = Vec::new();
        for (idx, part) in parts.iter().enumerate() {
            if idx >= bounds.len() - 1 { break; }
            let lines = wrap_text(part.trim(), f, s, (bounds[idx+1] - bounds[idx]) as f32 - 10.0);
            if lines.len() > max_lines { max_lines = lines.len(); }
            wrapped.push(lines);
        }

        let row_y = *y;
        let line_h = (25.0 * sh) as u32;
        let total_h = max_lines as u32 * line_h;

        // Draw vertical lines
        for &vx in &bounds {
            for vy in row_y..(row_y + total_h) {
                if vy < img.height() {
                    if vx < PAPER_WIDTH { img.put_pixel(vx, vy, Rgb([0, 0, 0])); }
                    if vx + 1 < PAPER_WIDTH { img.put_pixel(vx + 1, vy, Rgb([0, 0, 0])); }
                }
            }
        }

        for line_idx in 0..max_lines {
            for (idx, lines) in wrapped.iter().enumerate() {
                if line_idx >= lines.len() { continue; }
                let p_off = bounds[idx] as f32;
                let p_w = (bounds[idx+1] - bounds[idx]) as f32;
                let gls: Vec<_> = f.layout(&lines[line_idx], s, point(0.0, 0.0)).collect();
                let tw = gls.last().map(|g| g.pixel_bounding_box().map(|bb| bb.max.x).unwrap_or(0)).unwrap_or(0) as f32;
                let tx = p_off + (p_w - tw) / 2.0;
                let ly = row_y + (line_idx as u32 * line_h);
                for g in gls {
                    if let Some(bb) = g.pixel_bounding_box() {
                        g.draw(|x, gy, v| {
                            if v > 0.4 || (bold && v > 0.2) {
                                let px = (x as i32 + bb.min.x) as f32 + tx;
                                let py = (gy as i32 + bb.min.y) as f32 + ly as f32 + vm.ascent;
                                if px >= 0.0 && px < PAPER_WIDTH as f32 && py < img.height() as f32 {
                                    img.put_pixel(px as u32, py as u32, Rgb([0, 0, 0]));
                                }
                            }
                        });
                    }
                }
            }
        }
        *y += total_h;
    } else {
        // Regular line
        let clean_t = t.replace('|', " ");
        let gls: Vec<_> = f.layout(&clean_t, s, point(0.0, 0.0)).collect();
        let tw = gls.last().map(|g| g.pixel_bounding_box().map(|bb| bb.max.x).unwrap_or(0)).unwrap_or(0) as f32;
        let off = match al {
            1 => (PAPER_WIDTH as f32 - tw) / 2.0,
            2 => PAPER_WIDTH as f32 - tw - 10.0,
            _ => 10.0,
        };
        for g in gls {
            if let Some(bb) = g.pixel_bounding_box() {
                g.draw(|x, gy, v| {
                    if v > 0.4 || (bold && v > 0.2) {
                        let px = (x as i32 + bb.min.x) as f32 + off;
                        let py = (gy as i32 + bb.min.y) as f32 + *y as f32 + vm.ascent;
                        if px >= 0.0 && px < PAPER_WIDTH as f32 && py < img.height() as f32 {
                            img.put_pixel(px as u32, py as u32, Rgb([0, 0, 0]));
                        }
                    }
                });
            }
        }
    }
    t.clear();
}



// ── Tauri Commands ─────────────────────────────────────────────────────
#[tauri::command]
fn open_cash_drawer() -> Result<(), String> {
    #[cfg(windows)]
    {
        let printer_name = get_default_printer_name()?;
        let pulse: Vec<u8> = vec![27, 112, 0, 25, 250];
        send_raw_to_printer(&printer_name, &pulse)?;
        Ok(())
    }
    #[cfg(not(windows))]
    {
        println!("Cash drawer: not implemented");
        Ok(())
    }
}

#[tauri::command]
fn print_receipt(
    printer_name: String,
    content: String,
    include_logo: bool,
    is_pride: bool,
) -> Result<(), String> {
    #[cfg(windows)]
    {
        let target = if printer_name.is_empty() {
            get_default_printer_name()?
        } else {
            printer_name
        };

        // 1. Prepare Graphics Surface
        let mut img = RgbImage::new(PAPER_WIDTH, 8000);
        for p in img.pixels_mut() { *p = Rgb([255, 255, 255]); }
        let mut cy = 10u32;

        let font_path = r#"C:\Windows\Fonts\consola.ttf"#;
        let font_data = std::fs::read(font_path).map_err(|e| format!("Font err: {}", e))?;
        let font = Font::try_from_vec(font_data).ok_or("Error Font parse")?;

        // 2. Render Header Images
        if include_logo {
            let logo_path = r#"C:\dev\Freshon.in\Fpos\public\logo.png"#;
            if let Ok(logo) = get_image_bits_bold(logo_path, 380) {
                let lx = (PAPER_WIDTH - logo.width()) / 2;
                for y in 0..logo.height() {
                    let py = cy + y;
                    if py >= img.height() { break; }
                    for x in 0..logo.width() {
                        if logo.get_pixel(x, y)[0] < 128 {
                            let px = lx + x;
                            if px < PAPER_WIDTH {
                                img.put_pixel(px, py, Rgb([0, 0, 0]));
                            }
                        }
                    }
                }
                cy += logo.height() + 10;
            }
        }

        if is_pride {
            let pride_path = r#"C:\dev\Freshon.in\Fpos\public\PRIDE.png"#;
            if let Ok(pride) = get_image_bits_bold(pride_path, 180) {
                let px = (PAPER_WIDTH - pride.width()) / 2;
                for y in 0..pride.height() {
                    let py = cy + y;
                    if py >= img.height() { break; }
                    for x in 0..pride.width() {
                        if pride.get_pixel(x, y)[0] < 128 {
                            let px = px + x;
                            if px < PAPER_WIDTH {
                                img.put_pixel(px, py, Rgb([0, 0, 0]));
                            }
                        }
                    }
                }
                cy += pride.height() + 10;
            }
        }

        // 3. Render Tagged Content
        let mut bold = false;
        let mut sh = 1.0f32;
        let sw = 1.0f32; 
        let mut al = 0u8;
        let mut txt = String::new();

        let mut current_pos = 0;
        let content_str = &content;

        while current_pos < content_str.len() {
            let remaining = &content_str[current_pos..];

            if remaining.starts_with("[C]") { flush_txt(&mut img, &font, &mut txt, &mut cy, bold, sh, sw, al); al = 1; current_pos += 3; continue; }
            if remaining.starts_with("[c]") { flush_txt(&mut img, &font, &mut txt, &mut cy, bold, sh, sw, al); al = 0; current_pos += 3; continue; }
            if remaining.starts_with("[R]") { flush_txt(&mut img, &font, &mut txt, &mut cy, bold, sh, sw, al); al = 2; current_pos += 3; continue; }
            if remaining.starts_with("[r]") { flush_txt(&mut img, &font, &mut txt, &mut cy, bold, sh, sw, al); al = 0; current_pos += 3; continue; }
            if remaining.starts_with("[B]") { flush_txt(&mut img, &font, &mut txt, &mut cy, bold, sh, sw, al); bold = true; current_pos += 3; continue; }
            if remaining.starts_with("[b]") { flush_txt(&mut img, &font, &mut txt, &mut cy, bold, sh, sw, al); bold = false; current_pos += 3; continue; }
            if remaining.starts_with("[H]") { flush_txt(&mut img, &font, &mut txt, &mut cy, bold, sh, sw, al); sh = 2.0; current_pos += 3; continue; }
            if remaining.starts_with("[h]") { flush_txt(&mut img, &font, &mut txt, &mut cy, bold, sh, sw, al); sh = 1.0; current_pos += 3; continue; }
            
            if remaining.starts_with("[HR]") {
                flush_txt(&mut img, &font, &mut txt, &mut cy, bold, sh, sw, al);
                draw_rect_with_grid(&mut img, &mut cy, 0, PAPER_WIDTH, 2, vec![]);
                current_pos += 4; continue;
            }
            if remaining.starts_with("[HR3]") {
                flush_txt(&mut img, &font, &mut txt, &mut cy, bold, sh, sw, al);
                draw_rect_with_grid(&mut img, &mut cy, 0, PAPER_WIDTH, 3, vec![]);
                current_pos += 5; continue;
            }

            if remaining.starts_with("[BAR]") {
                flush_txt(&mut img, &font, &mut txt, &mut cy, bold, sh, sw, al);
                current_pos += 5;
                if let Some(end) = content_str[current_pos..].find("[bar]") {
                    // Simple barcode placeholder in raster
                    draw_rect_with_grid(&mut img, &mut cy, 100, 376, 60, vec![]);
                    current_pos += end + 5;
                }
                continue;
            }

            if remaining.starts_with('\n') {
                flush_txt(&mut img, &font, &mut txt, &mut cy, bold, sh, sw, al);
                cy += (25.0 * sh) as u32;
                current_pos += 1;
                continue;
            }

            let ch = content_str[current_pos..].chars().next().unwrap();
            txt.push(ch);
            current_pos += ch.len_utf8();
        }
        flush_txt(&mut img, &font, &mut txt, &mut cy, bold, sh, sw, al);

        // 4. Footer Image
        let footer_path = r#"C:\dev\Freshon.in\Fpos\public\kannada_footer.png"#;
        if std::path::Path::new(footer_path).exists() {
            if let Ok(footer) = get_image_bits_bold(footer_path, 576) {
                for y in 0..footer.height() {
                    let py = cy + y;
                    if py >= img.height() { break; }
                    for x in 0..footer.width() {
                        if footer.get_pixel(x, y)[0] < 128 {
                            if x < PAPER_WIDTH {
                                img.put_pixel(x, py, Rgb([0, 0, 0]));
                            }
                        }
                    }
                }
                cy += footer.height() + 10;
            }
        }

        // 5. Final Crop and Convert to ESC/POS Chunks
        // We print in chunks of 500 rows to avoid printer buffer issues
        let mut print_data = vec![0x1B, 0x40]; // ESC @ (Init)
        
        let chunk_h = 500;
        let mut current_y = 0;
        
        while current_y < cy {
            let h = if current_y + chunk_h > cy { cy - current_y } else { chunk_h };
            let bw = PAPER_WIDTH / 8;
            
            // GS v 0 Header for this chunk
            print_data.extend_from_slice(&[0x1D, 0x76, 0x30, 0x00, (bw % 256) as u8, (bw / 256) as u8, (h % 256) as u8, (h / 256) as u8]);
            
            for y in 0..h {
                for xb in 0..bw {
                    let mut byte = 0u8;
                    for bit in 0..8 {
                        let px = xb * 8 + bit;
                        let py = current_y + y;
                        if py < img.height() && img.get_pixel(px, py)[0] < 128 {
                            byte |= 1 << (7 - bit);
                        }
                    }
                    print_data.push(byte);
                }
            }
            current_y += h;
        }

        for _ in 0..8 { print_data.push(b'\n'); }
        print_data.extend_from_slice(b"\x1D\x56\x00"); // Cut

        send_raw_to_printer(&target, &print_data)?;
        Ok(())
    }
    #[cfg(not(windows))]
    {
        println!("Print simulated.");
        Ok(())
    }
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![open_cash_drawer, print_receipt])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}