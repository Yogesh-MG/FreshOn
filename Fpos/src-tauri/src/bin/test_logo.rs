use image::{GenericImageView};
use std::path::Path;
use std::fs::File;
use std::io::Write;

fn main() {
    let logo_path = r#"C:\dev\Freshon.in\Fpos\public\logo.png"#;
    println!("Loading Main LOGO: {}", logo_path);
    
    let img = image::open(std::path::Path::new(logo_path)).expect("Failed to open main logo");
    let target_width = 384; 
    let resized = img.resize(target_width, img.height(), image::imageops::FilterType::Nearest);
    let (width, height) = resized.dimensions();
    let gray = resized.to_luma8();
    
    let mut data = Vec::new();
    data.extend_from_slice(b"\x1B\x40"); // HARD RESET
    data.extend_from_slice(b"\x1B\x33\x08"); // Set line spacing to 8 dots
    
    let nl = (width % 256) as u8;
    let nh = (width / 256) as u8;
    
    // 8-dot stripes
    for y_stripe in 0..(height / 8) {
        data.extend_from_slice(&[0x1B, 0x2A, 0, nl, nh]); // m=0 (8-dot single density)
        for x in 0..width {
            let mut byte = 0u8;
            for bit in 0..8 {
                let y = y_stripe * 8 + bit;
                if y < height {
                    let pixel = gray.get_pixel(x, y);
                    // Use a high threshold (200) to make it BOLD SOLID BLACK
                    if pixel[0] < 200 { 
                        byte |= 1 << (7 - bit);
                    }
                }
            }
            data.push(byte);
        }
        data.push(b'\n'); // End stripe
    }
    
    data.extend_from_slice(b"\x1B\x32"); // Reset line spacing
    data.push(b'\n');
    data.push(b'\n');
    data.extend_from_slice(b"\x1D\x56\x00"); // Cut

    let mut out = std::fs::File::create("test_logo.bin").unwrap();
    use std::io::Write;
    out.write_all(&data).unwrap();
    println!("SUCCESS: Created REAL-LOGO test_logo.bin ({} bytes)", data.len());
}
