#[cfg(windows)]
use winapi::um::winspool::*;
#[cfg(windows)]
use winapi::shared::minwindef::DWORD;
use std::env;
use std::fs;
use std::ptr;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 3 {
        println!("Usage: cargo run --bin print_raw -- <PRINTER_NAME> <FILE_PATH>");
        return;
    }
    let printer_name = &args[1];
    let file_path = &args[2];

    println!("Sending {} to {}...", file_path, printer_name);

    let data = fs::read(file_path).expect("Failed to read file");

    #[cfg(windows)]
    {
        use std::ffi::OsStr;
        use std::os::windows::ffi::OsStrExt;

        let mut printer_name_wide: Vec<u16> = OsStr::new(printer_name)
            .encode_wide()
            .chain(std::iter::once(0))
            .collect();

        let mut handle = ptr::null_mut();
        unsafe {
            if OpenPrinterW(printer_name_wide.as_mut_ptr(), &mut handle, ptr::null_mut()) == 0 {
                println!("ERROR: Failed to open printer");
                return;
            }

            let mut doc_name: Vec<u16> = OsStr::new("Raw Print Job")
                .encode_wide()
                .chain(std::iter::once(0))
                .collect();
            let mut data_type: Vec<u16> = OsStr::new("RAW")
                .encode_wide()
                .chain(std::iter::once(0))
                .collect();

            let mut doc_info = DOC_INFO_1W {
                pDocName: doc_name.as_mut_ptr(),
                pOutputFile: ptr::null_mut(),
                pDatatype: data_type.as_mut_ptr(),
            };

            if StartDocPrinterW(handle, 1, &mut doc_info as *mut _ as *mut _) == 0 {
                println!("ERROR: Failed to start doc");
                ClosePrinter(handle);
                return;
            }

            if StartPagePrinter(handle) == 0 {
                println!("ERROR: Failed to start page");
                EndDocPrinter(handle);
                ClosePrinter(handle);
                return;
            }

            let mut written: DWORD = 0;
            if WritePrinter(handle, data.as_ptr() as *mut _, data.len() as DWORD, &mut written) == 0 {
                println!("ERROR: Failed to write data");
            } else {
                println!("SUCCESS: Sent {} bytes to printer", written);
            }

            EndPagePrinter(handle);
            EndDocPrinter(handle);
            ClosePrinter(handle);
        }
    }
}
