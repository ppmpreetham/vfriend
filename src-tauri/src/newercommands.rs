use serde::Deserialize;
use tauri::command;

#[derive(Debug, Deserialize)]
pub struct CompactSlot {
    d: u8,        // day (1-7)
    s: String,    // "t" or "l"
    p: u8,        // period (1-12)
    f: String,    // original full text
}

#[command]
pub fn build_bitmap(schedule: Vec<CompactSlot>) -> Vec<bool> {
    let mut bitmap = vec![false; 12]; // 12-period day
    for slot in schedule {
        if (1..=12).contains(&slot.p) {
            bitmap[(slot.p - 1) as usize] = true;
        }
    }
    bitmap
}
