use std::fs::File;
use std::io::Read;
use image::{RgbImage, Rgb};
use rusttype::{Font, Scale, point};

fn main() {
    let mut f = File::open("test_bill.bin").expect("Could not open test_bill.bin");
    let mut buffer = Vec::new();
    f.read_to_end(&mut buffer).unwrap();

    println!("Analyzing test_bill.bin ({} bytes)...", buffer.len());

    let mut img = RgbImage::new(384, 2500); 
    for p in img.pixels_mut() { *p = Rgb([255, 255, 255]); } 

    let font_data = std::fs::read("C:\\Windows\\Fonts\\consola.ttf").expect("Could not find Consolas font");
    let font = Font::try_from_vec(font_data).expect("Error constructing Font");

    let mut cursor_y = 0;
    let mut i = 0;
    let mut current_text = String::new();
    let mut is_bold = false;
    let mut is_font_b = false;
    let mut alignment = 0u8; 
    let mut text_mode = 0u8; 

    while i < buffer.len() {
        if i + 7 < buffer.len() && buffer[i] == 0x1D && buffer[i+1] == 0x76 && buffer[i+2] == 0x30 {
            flush_text(&mut img, &font, &mut current_text, &mut cursor_y, is_bold, is_font_b, alignment, text_mode);
            let xl = buffer[i+4] as u32;
            let xh = buffer[i+5] as u32;
            let yl = buffer[i+6] as u32;
            let yh = buffer[i+7] as u32;
            let width_bytes = xl + 256 * xh;
            let height_dots = yl + 256 * yh;
            i += 8;
            for y in 0..height_dots {
                for x_byte in 0..width_bytes {
                    let byte = buffer[i + (y * width_bytes + x_byte) as usize];
                    for bit in 0..8 {
                        if (byte >> (7 - bit)) & 1 == 1 {
                            let x = x_byte * 8 + bit;
                            let py = cursor_y + y;
                            if x < 384 && py < 2500 { img.put_pixel(x, py, Rgb([0, 0, 0])); }
                        }
                    }
                }
            }
            cursor_y += height_dots;
            i += (width_bytes * height_dots) as usize;
        }
        else if i + 2 < buffer.len() && buffer[i] == 0x1B && buffer[i+1] == 0x21 {
            flush_text(&mut img, &font, &mut current_text, &mut cursor_y, is_bold, is_font_b, alignment, text_mode);
            text_mode = buffer[i+2];
            i += 3;
        }
        else if i + 2 < buffer.len() && buffer[i] == 0x1B && buffer[i+1] == 0x61 {
            flush_text(&mut img, &font, &mut current_text, &mut cursor_y, is_bold, is_font_b, alignment, text_mode);
            alignment = buffer[i+2];
            i += 3;
        }
        else if i + 2 < buffer.len() && buffer[i] == 0x1B && buffer[i+1] == 0x4D {
            flush_text(&mut img, &font, &mut current_text, &mut cursor_y, is_bold, is_font_b, alignment, text_mode);
            is_font_b = buffer[i+2] == 1;
            i += 3;
        }
        else if i + 2 < buffer.len() && buffer[i] == 0x1B && buffer[i+1] == 0x45 {
            flush_text(&mut img, &font, &mut current_text, &mut cursor_y, is_bold, is_font_b, alignment, text_mode);
            is_bold = buffer[i+2] > 0;
            i += 3;
        }
        else if buffer[i] == b'\n' {
            flush_text(&mut img, &font, &mut current_text, &mut cursor_y, is_bold, is_font_b, alignment, text_mode);
            let line_h = if (text_mode & 0x10) > 0 { 48 } else { 24 };
            cursor_y += line_h; 
            i += 1;
        }
        else if buffer[i] >= 32 && buffer[i] <= 126 {
            current_text.push(buffer[i] as char);
            i += 1;
        }
        else { i += 1; }
    }
    img.save("receipt_preview.png").unwrap();
    println!("SUCCESS: Created receipt_preview.png.");
}

fn flush_text(img: &mut RgbImage, font: &Font, text: &mut String, y: &mut u32, bold: bool, font_b: bool, alignment: u8, mode: u8) {
    if text.is_empty() { return; }
    let is_double_h = (mode & 0x10) > 0;
    let is_double_w = (mode & 0x20) > 0;
    let base_size = if font_b { 14.0 } else { 20.0 };
    let scale_h = if is_double_h { base_size * 2.0 } else { base_size };
    let scale_w = if is_double_w { base_size * 2.0 } else { base_size };
    let scale = Scale { x: scale_w, y: scale_h };
    let v_metrics = font.v_metrics(scale);
    let glyphs: Vec<_> = font.layout(text, scale, point(0.0, 0.0)).collect();
    let width = if let Some(last) = glyphs.last() {
        last.pixel_bounding_box().map(|bb| bb.max.x).unwrap_or(0) as f32
    } else { 0.0 };
    let x_offset = match alignment {
        1 => (384.0 - width) / 2.0,
        2 => 384.0 - width - 10.0,
        _ => 10.0,
    };
    for glyph in glyphs {
        if let Some(bb) = glyph.pixel_bounding_box() {
            glyph.draw(|x, gy, v| {
                if v > 0.5 {
                    let px = (x as i32 + bb.min.x) as f32 + x_offset;
                    let py = (gy as i32 + bb.min.y) as f32 + *y as f32 + v_metrics.ascent;
                    if px >= 0.0 && px < 384.0 && py >= 0.0 && py < 2500.0 {
                        img.put_pixel(px as u32, py as u32, Rgb([0, 0, 0]));
                    }
                }
            });
        }
    }
    text.clear();
}
