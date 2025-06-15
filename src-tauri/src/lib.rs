// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod commands;
mod scheduling_conflict;
mod parseHTML;
pub mod newcommands;
pub mod newercommands;
// mod p2p;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
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
            commands::is_free_at,
            parseHTML::parseHTML,
            // newcommands::next_free_time,
            newercommands::build_bitmap,
            newercommands::next_free_time_after,
            // p2p::start_node,
            // p2p::create_ticket,
            // p2p::join_ticket,
            // p2p::exchange_friend_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
