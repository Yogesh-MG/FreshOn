use image::GenericImageView;

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
        let mut buf: Vec<u16> = vec![0; size as usize];
        GetDefaultPrinterW(buf.as_mut_ptr(), &mut size);
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
        OpenPrinterW(name_wide.as_ptr() as *mut _, &mut hprinter, std::ptr::null_mut());
        let doc_name: Vec<u16> = OsStr::new("Image Print Test").encode_wide().chain(Some(0)).collect();
        let data_type: Vec<u16> = OsStr::new("RAW").encode_wide().chain(Some(0)).collect();
        let doc_info = DOC_INFO_1W { pDocName: doc_name.as_ptr() as *mut _, pOutputFile: std::ptr::null_mut(), pDatatype: data_type.as_ptr() as *mut _ };
        StartDocPrinterW(hprinter, 1, &doc_info as *const _ as *mut _);
        StartPagePrinter(hprinter);
        let mut written: DWORD = 0;
        WritePrinter(hprinter, data.as_ptr() as *mut _, data.len() as DWORD, &mut written);
        EndPagePrinter(hprinter);
        EndDocPrinter(hprinter);
        ClosePrinter(hprinter);
        Ok(())
    }
}

fn main() {
    let img_path = "receipt_preview.png";
    let img = image::open(img_path).expect("Failed to open receipt_preview.png. Run the preview generator first!");
    let (w, h_total) = img.dimensions();
    let bw = w / 8;
    
    let mut data = vec![0x1B, 0x40]; // Init
    
    let chunk_h = 500;
    let mut current_y = 0;
    
    let gray = img.to_luma8();

    while current_y < h_total {
        let h = if current_y + chunk_h > h_total { h_total - current_y } else { chunk_h };
        
        // GS v 0 Header for this chunk
        data.extend_from_slice(&[0x1D, 0x76, 0x30, 0x00, (bw % 256) as u8, (bw / 256) as u8, (h % 256) as u8, (h / 256) as u8]);
        
        for y in 0..h {
            for xb in 0..bw {
                let mut byte = 0u8;
                for bit in 0..8 {
                    let px = xb * 8 + bit;
                    let py = current_y + y;
                    if gray.get_pixel(px, py)[0] < 128 {
                        byte |= 1 << (7 - bit);
                    }
                }
                data.push(byte);
            }
        }
        current_y += h;
    }
    
    for _ in 0..8 { data.push(b'\n'); }
    data.extend_from_slice(b"\x1D\x56\x00"); // Cut

    #[cfg(windows)]
    {
        let printer = get_default_printer_name().unwrap();
        println!("Printing in chunks to: {}", printer);
        send_raw_to_printer(&printer, &data).unwrap();
        println!("Done!");
    }
}
