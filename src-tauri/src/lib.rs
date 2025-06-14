// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod commands;
mod scheduling_conflict;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            #[cfg(mobile)]
            app.handle().plugin(tauri_plugin_barcode_scanner::init());
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sharing::init())
        .invoke_handler(tauri::generate_handler![
            commands::check_conflicts,
            commands::find_free_times,
            commands::is_free_at
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
