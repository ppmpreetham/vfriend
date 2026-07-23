// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod newercommands;
mod parse_html;

// pub mod commands;
// pub mod newcommands;
// mod scheduling_conflict;
use tauri_plugin_deep_link::DeepLinkExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init());
    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|_app, argv, _cwd| {
            println!(
                "a new app instance was opened with {argv:?} and the deep link event was already triggered"
            );
        }));
    }
    #[cfg(mobile)]
    {
        builder = builder
            .plugin(tauri_plugin_barcode_scanner::init())
            .plugin(tauri_plugin_sharesheet::init());
    }
    builder
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            #[cfg(desktop)]
            app.deep_link().register("vfriend")?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            parse_html::parse_html,
            newercommands::build_bitmap,
            newercommands::build_kindmap,
            newercommands::next_free_time_after,
            newercommands::get_free_status,
            newercommands::new_get_free_status,
            newercommands::timetable_status,
            newercommands::timetable_status_now,
            newercommands::currently_at,
            newercommands::currentbit,
            // commands::check_conflicts,
            // commands::find_free_times,
            // commands::is_free_at,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
