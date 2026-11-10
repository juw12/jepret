// Jepret for Windows: the same offline web app in its own window (WebView2).
// Photos are read from the SD card inside the window and never uploaded.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("Jepret failed to start");
}
