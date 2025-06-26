// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod commands;
pub mod newcommands;
pub mod newercommands;
mod scheduling_conflict;
mod parseHTML;
use tauri_plugin_deep_link::DeepLinkExt;
// mod p2p;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();
    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|_app, argv, _cwd| {
          println!("a new app instance was opened with {argv:?} and the deep link event was already triggered");
          // when defining deep link schemes at runtime, you must also check `argv` here
        }));
    }
    builder
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            #[cfg(mobile)]
            app.handle().plugin(tauri_plugin_barcode_scanner::init());
            Ok(())
        })
        .setup(|app| {
            #[cfg(desktop)]
            app.deep_link().register("vfriend")?;
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sharing::init())
        .invoke_handler(tauri::generate_handler![
            parseHTML::parseHTML,
            newercommands::build_bitmap,
            newercommands::build_kindmap,
            newercommands::next_free_time_after,
            newercommands::get_free_status,
            newercommands::currently_at,
            // commands::check_conflicts,
            // commands::find_free_times,
            // commands::is_free_at,
            // p2p::start_node,
            // p2p::create_ticket,
            // p2p::join_ticket,
            // p2p::exchange_friend_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}