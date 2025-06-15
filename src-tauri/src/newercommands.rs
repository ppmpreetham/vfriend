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

use chrono::NaiveTime;

const THEORY_TIMES: [&str; 12] = [
    "08:00", "08:55", "09:50", "10:45", "11:40", "12:35",
    "14:00", "14:55", "15:50", "16:45", "17:40", "18:35",
];

const LAB_TIMES: [&str; 12] = [
    "08:00", "08:50", "09:50", "10:40", "11:40", "12:30",
    "14:00", "14:50", "15:50", "16:40", "17:40", "18:30",
];

pub fn next_free_time_after(
    bitmap: &[bool; 12], // false for free, true for occupied
    kindmap: &[bool; 12], // false for theory, true for lab
    current_time: NaiveTime,
) -> Option<NaiveTime> {
    for i in 0..12 {
        if bitmap[i] {
            continue;
        }

        let is_lab = kindmap[i];
        let time_str = if is_lab {
            LAB_TIMES[i]
        } else {
            THEORY_TIMES[i]
        };

        let start_time = NaiveTime::parse_from_str(time_str, "%H:%M").unwrap();
        if start_time >= current_time {
            return Some(start_time);
        }
    }

    None
}

pub fn main(){
    let bitmap = [true, true, true, true, true, true, false, false, false, true, true, true];
    let kindmap = [false, false, false, false, false, false, false, false, false, false, false, false];
    let current_time = NaiveTime::parse_from_str("14:01", "%H:%M").unwrap();

    let result = next_free_time_after(&bitmap, &kindmap, current_time);
    println!("{:?}", result);

}