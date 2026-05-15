use image::{GenericImageView, RgbImage, Rgb};
use rusttype::{Font, Scale, point};

fn main() {
    let mut data: Vec<u8> = Vec::new();
    
    // 1. GENERATE BINARY DATA
    data.extend_from_slice(b"\x1B\x40\x1B\x74\x00");
    
    // BOLD LOGO
    data.extend_from_slice(b"\x1B\x61\x01"); 
    let logo_path = r#"C:\dev\Freshon.in\Fpos\public\logo.png"#;
    if let Ok(bits) = get_image_bits_bold(logo_path, 380) { data.extend_from_slice(&bits); }
    
    // IDENTITY
    append_text(&mut data, "[C][B]Eliteck Solutions & Services PVT Ltd[b][c]\n");
    append_text(&mut data, "[C]17, 80ft Road, Kengeri Ring Road,[c]\n");
    append_text(&mut data, "[C]Mallathalli, Bengaluru-560056[c]\n");
    append_text(&mut data, "[C]Phone: 8884463083, 9591241245[c]\n");
    append_text(&mut data, "[C]GSTIN : 29AADCE6858N3ZS[c]\n");
    append_text(&mut data, "\n[C][B]TAX INVOICE[b][c]\n\n");

    // BILL DETAILS
    append_text(&mut data, "Bill No : S/26-27/1716         Date : 12-05-2026\n");
    append_text(&mut data, "Sowmya Satish  8088171267               04:30:00\n\n");

    // ITEM TABLE
    data.extend_from_slice(&draw_solid_line(576, 2));
    append_text(&mut data, "Sn | Item Name          | Qty | Rate | Amount \n");
    data.extend_from_slice(&draw_solid_line_with_grid(576, 1, vec![0, 48, 280, 360, 460, 576]));
    append_text(&mut data, " 1 | WATER MELON - KIRAN EXTRA LARGE SWEET SHOP PRIDE | 2.6 | 69.0 | 179.40 \n");
    append_text(&mut data, " 2 | BANANA YELAKKI     | 1.4 |115.0 | 161.00 \n");
    append_text(&mut data, " 3 | PAPAYA RED LADY    | 1.7 | 75.0 | 127.50 \n");
    data.extend_from_slice(&draw_solid_line_with_grid(576, 1, vec![0, 48, 280, 360, 460, 576]));
    append_text(&mut data, "   | Total              | 5.70|      | 467.90 \n");
    data.extend_from_slice(&draw_solid_line(576, 2));

    append_text(&mut data, "\n[B][R]Round-Off :        .10[r][b]\n");
    data.extend_from_slice(&draw_rect(420, 156, 1)); 

    // BOXED NET TOTAL
    data.extend_from_slice(b"\n\n");
    data.extend_from_slice(&draw_solid_line(576, 3));
    append_text(&mut data, "[C]\n[H][B]Net Bill Amount :     Rs. 468.00[b][h]\n\n[c]");
    data.extend_from_slice(&draw_solid_line(576, 3));
    
    // PAYMENT DETAILS
    append_text(&mut data, "\n[C]Payment Details[c]\n");
    data.extend_from_slice(&draw_solid_line(576, 2));
    append_text(&mut data, " Mode of Payment        | Amount \n");
    data.extend_from_slice(&draw_solid_line_with_grid(576, 1, vec![0, 320, 576]));
    append_text(&mut data, " R-Credit               | 468.00 \n");
    data.extend_from_slice(&draw_solid_line(576, 2));
    
    // GST TABLE (CLEAN CELLS)
    append_text(&mut data, "\nGST Summary\n");
    data.extend_from_slice(&draw_solid_line(576, 2));
    append_text(&mut data, " Taxable |      CGST       |      SGST       | Total \n");
    // PARTIAL SUB-DIVIDER: Only between 120 and 440 (The CGST/SGST part)
    data.extend_from_slice(&draw_rect_with_grid(120, 320, 1, vec![0, 120, 200, 280, 360, 440, 576])); 
    append_text(&mut data, "  Value  | % |    Amt      | % |    Amt      |  GST  \n");
    data.extend_from_slice(&draw_solid_line_with_grid(576, 1, vec![0, 120, 160, 280, 320, 440, 576]));
    append_text(&mut data, "  434.46 |   |   16.72     |   |   16.72     | 33.44 \n");
    data.extend_from_slice(&draw_solid_line(576, 2));

    // SAVINGS & FOOTER
    append_text(&mut data, "\n[C][B]With Pride u could have saved Rs. 19.00[b][c]\n");
    append_text(&mut data, "[C]---------------------------------------[c]\n\n");
    append_text(&mut data, "[C][B]Thank You for Choosing FreshOn.In![b][c]\n");
    append_text(&mut data, "[C]   App (iOS)            App (Android)[c]\n");
    append_text(&mut data, "[C][QR]ios_link[qr]     [QR]android_link[qr][c]\n\n");
    append_text(&mut data, "[C]INVOICE BARCODE[c]\n");
    append_text(&mut data, "[C][BAR]S/26-27/1716[bar][c]\n\n");

    let footer_path = r#"C:\dev\Freshon.in\Fpos\public\kannada_footer.png"#;
    if let Ok(bits) = get_image_bits_bold(footer_path, 576) {
        data.extend_from_slice(b"\n\x1B\x61\x01");
        data.extend_from_slice(&bits);
    }
    
    std::fs::write("test_bill.bin", &data).ok();
    save_preview(&data, "receipt_preview.png");
}

fn append_text(data: &mut Vec<u8>, content: &str) {
    let mut current_pos = 0;
    while current_pos < content.len() {
        let remaining = &content[current_pos..];
        if remaining.starts_with("[C]") { data.extend_from_slice(b"\x1B\x61\x01"); current_pos += 3; continue; }
        if remaining.starts_with("[c]") { data.extend_from_slice(b"\x1B\x61\x00"); current_pos += 3; continue; }
        if remaining.starts_with("[R]") { data.extend_from_slice(b"\x1B\x61\x02"); current_pos += 3; continue; }
        if remaining.starts_with("[r]") { data.extend_from_slice(b"\x1B\x61\x00"); current_pos += 3; continue; }
        if remaining.starts_with("[B]") { data.extend_from_slice(b"\x1B\x45\x01"); current_pos += 3; continue; }
        if remaining.starts_with("[b]") { data.extend_from_slice(b"\x1B\x45\x00"); current_pos += 3; continue; }
        if remaining.starts_with("[H]") { data.extend_from_slice(b"\x1B\x21\x10"); current_pos += 3; continue; }
        if remaining.starts_with("[h]") { data.extend_from_slice(b"\x1B\x21\x00"); current_pos += 3; continue; }
        if remaining.starts_with('\n') { data.push(b'\n'); current_pos += 1; continue; }
        let ch = content[current_pos..].chars().next().unwrap();
        let mut buf = [0u8; 4];
        let encoded = ch.encode_utf8(&mut buf);
        data.extend_from_slice(encoded.as_bytes());
        current_pos += ch.len_utf8();
    }
}

fn draw_solid_line(w: u16, h: u16) -> Vec<u8> { draw_rect(0, w, h) }
fn draw_solid_line_with_grid(w: u16, h: u16, grid: Vec<u16>) -> Vec<u8> { draw_rect_with_grid(0, w, h, grid) }
fn draw_rect(off: u16, len: u16, h: u16) -> Vec<u8> { draw_rect_with_grid(off, len, h, vec![]) }
fn draw_rect_with_grid(off: u16, len: u16, h: u16, grid: Vec<u16>) -> Vec<u8> {
    let pw = 576; let bw = pw / 8;
    let mut cmd = vec![0x1D, 0x76, 0x30, 0x00, (bw % 256) as u8, (bw / 256) as u8, (h % 256) as u8, (h / 256) as u8];
    for _ in 0..h { for xb in 0..bw {
        let mut b = 0u8;
        for bit in 0..8 { 
            let dx = xb*8+bit; 
            let in_main = dx >= off && dx < (off+len);
            let is_grid = grid.iter().any(|&gx| dx == gx || dx == gx+1);
            if in_main || is_grid { b |= 1 << (7-bit); } 
        }
        cmd.push(b);
    }}
    cmd
}

fn get_image_bits_bold(path: &str, target_w: u32) -> Result<Vec<u8>, String> {
    let img = image::open(path).map_err(|e| e.to_string())?;
    let (ow, oh) = img.dimensions();
    let target_h = (oh * target_w) / ow;
    let resized = img.resize(target_w, target_h, image::imageops::Nearest);
    let (w, h) = resized.dimensions();
    let gray = resized.to_luma8();
    let mut bitmask = vec![false; (w * h) as usize];
    for y in 0..h { for x in 0..w { if gray.get_pixel(x,y)[0] < 200 { 
        for dy in -1..=1 { for dx in -1..=1 {
            let nx = x as i32 + dx; let ny = y as i32 + dy;
            if nx >= 0 && nx < (w as i32) && ny >= 0 && ny < (h as i32) { bitmask[(ny as u32 * w + nx as u32) as usize] = true; }
        }}
    }}}
    let bw = 576/8; let pad = (576 - w) / 2;
    let mut data = Vec::new();
    data.extend_from_slice(&[0x1D, 0x76, 0x30, 0x00, (bw%256) as u8, (bw/256) as u8, (h%256) as u8, (h/256) as u8]);
    for y in 0..h { for xb in 0..bw {
        let mut byte = 0u8;
        for bit in 0..8 {
            let dx = xb * 8 + bit;
            if dx >= pad && dx < (pad + w) && bitmask[(y * w + (dx - pad)) as usize] { byte |= 1 << (7 - bit); }
        }
        data.push(byte);
    }}
    Ok(data)
}

fn save_preview(buf: &[u8], path: &str) {
    let mut img = RgbImage::new(576, 4500);
    for p in img.pixels_mut() { *p = Rgb([255, 255, 255]); }
    let font_path = r#"C:\Windows\Fonts\consola.ttf"#;
    let font_data = std::fs::read(font_path).expect("Font not found at C:\\Windows\\Fonts\\consola.ttf");
    let font = Font::try_from_vec(font_data).expect("Error Font");
    let mut cy = 0; let mut i = 0; let mut txt = String::new();
    let mut bold = false; let mut sh = 1.0; let mut sw = 1.0; let mut al = 0;
    while i < buf.len() {
        if i+7 < buf.len() && buf[i] == 0x1D && buf[i+1] == 0x76 && buf[i+2] == 0x30 {
            flush_txt(&mut img,&font,&mut txt,&mut cy,bold,sh,sw,al,576);
            let wb = (buf[i+4] as u32) + 256 * (buf[i+5] as u32);
            let hd = (buf[i+6] as u32) + 256 * (buf[i+7] as u32); i += 8;
            for y in 0..hd { for xb in 0..wb {
                let b = buf[i + (y*wb+xb) as usize];
                for bit in 0..8 { if (b >> (7-bit)) & 1 == 1 {
                    let px = xb*8+bit; let py = cy+y;
                    if px < 576 && py < 4500 { img.put_pixel(px, py, Rgb([0,0,0])); }
                } }
            }}
            cy += hd; i += (wb*hd) as usize;
        } else if i+2 < buf.len() && buf[i] == 0x1D && buf[i+1] == 0x6B {
            flush_txt(&mut img, &font, &mut txt, &mut cy, bold, sh, sw, al, 576);
            let len = buf[i+3] as usize; i += 4;
            for y in 0..80 { for x in 100..476 { if (cy+y) < 4500 { img.put_pixel(x, cy+y, Rgb([0,0,0])); } } }
            cy += 100; i += len;
        } else if i+2 < buf.len() && buf[i] == 0x1B && buf[i+1] == 0x21 {
            flush_txt(&mut img,&font,&mut txt,&mut cy,bold,sh,sw,al,576);
            let m = buf[i+2]; sh = if m&0x10!=0 {2.0} else {1.0}; sw = if m&0x20!=0 {2.0} else {1.0}; i += 3;
        } else if i+2 < buf.len() && buf[i] == 0x1B && buf[i+1] == 0x61 {
            flush_txt(&mut img,&font,&mut txt,&mut cy,bold,sh,sw,al,576); al = buf[i+2]; i += 3;
        } else if i+2 < buf.len() && buf[i] == 0x1B && buf[i+1] == 0x45 {
            flush_txt(&mut img,&font,&mut txt,&mut cy,bold,sh,sw,al,576); bold = buf[i+2] > 0; i += 3;
        } else if buf[i] == b'\n' {
            flush_txt(&mut img,&font,&mut txt,&mut cy,bold,sh,sw,al,576); cy += (25.0 * sh) as u32; i += 1;
        } else if buf[i] >= 32 { if buf[i] <= 126 { txt.push(buf[i] as char); } else { txt.push(' '); } i += 1;
        } else { i += 1; }
    }
    img.save(path).unwrap();
}

fn flush_txt(img: &mut RgbImage, f: &Font, t: &mut String, y: &mut u32, b: bool, sh: f32, sw: f32, al: u8, pw: u32) {
    if t.is_empty() { return; }
    let s = Scale { x: 20.0 * sw, y: 20.0 * sh };
    let vm = f.v_metrics(s);
    let parts: Vec<&str> = t.split('|').collect();
    if parts.len() > 1 {
        let is_gst_sub = parts.len() == 6;
        let is_gst_main = parts.len() == 4 && (t.contains("Value") || t.contains("CGST"));
        let is_payment = t.contains("Payment") || (parts.len() == 2 && !t.contains("Item Name") && !t.contains("Round-Off"));
        
        let (bounds, v_lines) = if is_gst_sub {
             (vec![0, 120, 160, 280, 320, 440, 576], vec![0, 120, 160, 280, 320, 440, 576])
        } else if is_gst_main {
             (vec![0, 120, 280, 440, 576], vec![0, 120, 280, 440, 576])
        } else if is_payment {
             (vec![0, 320, 576], vec![0, 320, 576])
        } else {
             (vec![0, 48, 280, 360, 460, 576], vec![0, 48, 280, 360, 460, 576])
        };

        let mut max_lines = 1; let mut wrapped: Vec<Vec<String>> = Vec::new();
        for (idx, part) in parts.iter().enumerate() {
            if idx >= bounds.len() - 1 { break; }
            let lines = wrap_text(part.trim(), f, s, (bounds[idx+1]-bounds[idx]) as f32 - 10.0);
            if lines.len() > max_lines { max_lines = lines.len(); } wrapped.push(lines);
        }
        let row_y = *y; let line_h = (25.0 * sh) as u32; let total_h = max_lines as u32 * line_h;
        if t.contains("Sn") || t.contains("Value") || t.contains(".") || t.contains("Total") || t.contains("Amt") || t.contains("Payment") || t.contains("Credit") {
            for &vx_u in v_lines.iter() {
                let vx = vx_u as u32; if vx >= pw { continue; }
                for vy in row_y..(row_y + total_h) {
                    if vy < 4500 { img.put_pixel(vx, vy, Rgb([0,0,0])); if vx+1 < pw { img.put_pixel(vx+1, vy, Rgb([0,0,0])); } }
                }
            }
        }
        for line_idx in 0..max_lines {
            for (idx, lines) in wrapped.iter().enumerate() {
                if line_idx >= lines.len() { continue; }
                let p_off = bounds[idx] as f32; let p_w = (bounds[idx+1] - bounds[idx]) as f32;
                let gls: Vec<_> = f.layout(&lines[line_idx], s, point(0.0, 0.0)).collect();
                let tw = gls.last().map(|g| g.pixel_bounding_box().map(|bb| bb.max.x).unwrap_or(0)).unwrap_or(0) as f32;
                let tx = p_off + (p_w - tw) / 2.0; let ly = row_y + (line_idx as u32 * line_h);
                for g in gls { if let Some(bb) = g.pixel_bounding_box() {
                    g.draw(|x, gy, v| {
                        if v > 0.4 || (b && v > 0.2) {
                            let px = (x as i32 + bb.min.x) as f32 + tx;
                            let py = (gy as i32 + bb.min.y) as f32 + ly as f32 + vm.ascent;
                            if px >= 0.0 && px < pw as f32 && py >= 0.0 && py < 4500.0 { img.put_pixel(px as u32, py as u32, Rgb([0,0,0])); }
                        }
                    });
                }}
            }
        }
        *y += total_h - line_h;
    } else {
        let clean_t = t.replace('|', " ");
        let gls: Vec<_> = f.layout(&clean_t, s, point(0.0, 0.0)).collect();
        let tw = gls.last().map(|g| g.pixel_bounding_box().map(|bb| bb.max.x).unwrap_or(0)).unwrap_or(0) as f32;
        let off = match al { 1 => (pw as f32 - tw)/2.0, 2 => pw as f32 - tw - 10.0, _ => 10.0 };
        for g in gls { if let Some(bb) = g.pixel_bounding_box() {
            g.draw(|x, gy, v| {
                if v > 0.4 || (b && v > 0.2) {
                    let px = (x as i32 + bb.min.x) as f32 + off;
                    let py = (gy as i32 + bb.min.y) as f32 + *y as f32 + vm.ascent;
                    if px >= 0.0 && px < pw as f32 && py >= 0.0 && py < 4500.0 { img.put_pixel(px as u32, py as u32, Rgb([0,0,0])); }
                }
            });
        }}
    }
    t.clear();
}
fn wrap_text(t: &str, f: &Font, s: Scale, max_w: f32) -> Vec<String> {
    let mut lines = Vec::new(); let mut cur = String::new();
    for w in t.split_whitespace() {
        let test = if cur.is_empty() { w.to_string() } else { format!("{} {}", cur, w) };
        let tw = f.layout(&test, s, point(0.0, 0.0)).last().map(|g| g.pixel_bounding_box().map(|bb| bb.max.x).unwrap_or(0)).unwrap_or(0) as f32;
        if tw > max_w && !cur.is_empty() { lines.push(cur); cur = w.to_string(); } else { cur = test; }
    }
    if !cur.is_empty() { lines.push(cur); } else if lines.is_empty() { lines.push(" ".to_string()); }
    lines
}
