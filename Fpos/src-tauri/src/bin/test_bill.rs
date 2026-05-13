use image::{GenericImageView};
use std::path::Path;
use std::fs::File;
use std::io::Write;

fn get_image_bits(path: &str, target_width: u32) -> Vec<u8> {
    if !Path::new(path).exists() { return Vec::new(); }
    let img = image::open(Path::new(path)).expect("Failed to open image");
    let (orig_w, orig_h) = img.dimensions();
    let target_height = (orig_h * target_width) / orig_w;
    let resized = img.resize(target_width, target_height, image::imageops::FilterType::Nearest);
    let (width, height) = resized.dimensions();
    let total_width = 384;
    let left_padding_dots = (total_width - width) / 2;
    let width_bytes = total_width / 8;
    let gray = resized.to_luma8();
    let mut data = Vec::new();
    let xl = (width_bytes % 256) as u8;
    let xh = (width_bytes / 256) as u8;
    let yl = (height % 256) as u8;
    let yh = (height / 256) as u8;
    data.extend_from_slice(&[0x1D, 0x76, 0x30, 0, xl, xh, yl, yh]);
    for y in 0..height {
        for x_byte in 0..width_bytes {
            let mut byte = 0u8;
            for bit in 0..8 {
                let current_dot = x_byte * 8 + bit;
                if current_dot >= left_padding_dots && current_dot < left_padding_dots + width {
                    let img_x = current_dot - left_padding_dots;
                    if gray.get_pixel(img_x, y)[0] < 240 { byte |= 1 << (7 - bit); }
                }
            }
            data.push(byte);
        }
    }
    data
}

fn main() {
    let mut data = Vec::new();
    data.extend_from_slice(b"\x1B\x40"); // RESET
    
    // 1. Title
    data.extend_from_slice(b"\x1B\x61\x01"); // Center
    data.extend_from_slice(b"\x1B\x21\x10"); // Double Height
    data.extend_from_slice(b"TAX INVOICE\n");
    data.extend_from_slice(b"\x1B\x21\x00"); // Normal size
    data.extend_from_slice(b"------------------------------------------\n");

    // 2. Logo (Centered)
    data.extend_from_slice(&get_image_bits(r#"C:\dev\Freshon.in\Fpos\public\logo.png"#, 120));
    data.push(b'\n');

    // 3. Store Info (Font A - LARGE)
    data.extend_from_slice(b"\x1B\x4D\x00"); // Font A
    data.extend_from_slice(b"\x1B\x61\x01"); // Center
    data.extend_from_slice(b"\x1B\x45\x01"); // Bold ON
    data.extend_from_slice(b"Eliteck Solutions & Services PVT Ltd\n");
    data.extend_from_slice(b"\x1B\x45\x00"); // Bold OFF
    data.extend_from_slice(b"17, 80ft Rd, Kengeri Ring Rd,\n");
    data.extend_from_slice(b"Mallathalli, Bengaluru-560056\n");
    data.extend_from_slice(b"Phone: 8884463083, 9591241245\n");
    data.extend_from_slice(b"GSTIN: 29AADCE6858N3ZS\n");
    data.extend_from_slice(b"------------------------------------------\n");

    // 4. Invoice Metadata (Font B - SMALL)
    data.extend_from_slice(b"\x1B\x4D\x01"); // Font B
    data.extend_from_slice(b"\x1B\x61\x00"); // Left
    data.extend_from_slice(b"INVOICE NO:                    F0A867EE...\n");
    data.extend_from_slice(b"DATE:                 13/05/2026, 16:26:10\n");
    data.extend_from_slice(b"CUST:                              YOGESH\n");
    data.extend_from_slice(b"PHONE:                          8431204137\n");
    data.extend_from_slice(b"TIER:                               Bronze\n");
    data.extend_from_slice(b"------------------------------------------\n");

    // 5. Main Table (Precise Grid)
    data.extend_from_slice(b"+--+-----------------+------+---+----+----+\n");
    data.extend_from_slice(b"|Sn| Item Name       | MRP  |Qty|Rate| Amt|\n");
    data.extend_from_slice(b"+--+-----------------+------+---+----+----+\n");
    data.extend_from_slice(b"|1 | Diabetic Rice   |188.00|5.0| 188| 940|\n");
    data.extend_from_slice(b"|  | (1 Kg)          |      |   |    |    |\n");
    data.extend_from_slice(b"+--+-----------------+------+---+----+----+\n");
    
    // 6. Totals
    data.extend_from_slice(b"SUBTOTAL                            940.00\n");
    data.extend_from_slice(b"------------------------------------------\n");
    data.extend_from_slice(b"\x1B\x45\x01"); // Bold
    data.extend_from_slice(b"NET AMOUNT                        Rs 940.00\n");
    data.extend_from_slice(b"\x1B\x45\x00"); // Bold Off
    data.extend_from_slice(b"Total GST Included                  143.39\n");
    data.extend_from_slice(b"------------------------------------------\n");

    // 7. GST Summary
    data.extend_from_slice(b"\x1B\x61\x01"); // Center
    data.extend_from_slice(b"GST SUMMARY\n");
    data.extend_from_slice(b"\x1B\x61\x00"); // Left
    data.extend_from_slice(b"+---------+----+-------+----+-------+----+\n");
    data.extend_from_slice(b"|Taxable V|CGST|Amt    |SGST|Amt    |Tot |\n");
    data.extend_from_slice(b"+---------+----+-------+----+-------+----+\n");
    data.extend_from_slice(b"|  796.61 | 9.0| 71.69 | 9.0| 71.69 | 143|\n");
    data.extend_from_slice(b"+---------+----+-------+----+-------+----+\n");

    // 8. Savings
    data.extend_from_slice(b"\x1B\x61\x01"); // Center
    data.extend_from_slice(b"--- YOUR SAVINGS ---\n");
    data.extend_from_slice(b"JOIN PRIDE TO HAVE SAVED Rs 282.00\n");
    data.extend_from_slice(b"------------------------------------------\n");

    // 9. Kannada Footer (Mock)
    data.extend_from_slice(b"\x1B\x21\x10"); // Double Height
    data.extend_from_slice(b"THANK YOU!\n");
    data.extend_from_slice(b"\x1B\x21\x00"); // Normal
    data.extend_from_slice(b"Visit Again\n");
    
    // 10. Barcode (Code 128)
    data.extend_from_slice(b"\x1B\x61\x01"); // Center
    data.extend_from_slice(b"\x1D\x68\x40"); // Height 64
    data.extend_from_slice(b"\x1D\x6B\x49\x0A{B123456789\n"); 

    for _ in 0..3 { data.push(b'\n'); }
    data.extend_from_slice(b"\x1D\x56\x00"); // Cut

    let mut out = File::create("test_bill.bin").unwrap();
    out.write_all(&data).unwrap();
    println!("SUCCESS: Created test_bill.bin ({} bytes)", data.len());
}
