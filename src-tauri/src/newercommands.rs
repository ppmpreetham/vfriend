use chrono::NaiveTime;
use serde::{Deserialize, Serialize};
use tauri;

#[derive(Debug, Deserialize)]
pub struct CompactSlot {
    d: u8,     // day (1-7)
    s: String, // "t" or "l"
    p: u8,     // period (1-12)
    f: String, // original full text
}

#[tauri::command]
pub fn build_bitmap(schedule: Vec<CompactSlot>, target_day: u8) -> Vec<bool> {
    let mut bitmap = vec![false; 12]; // 12-period day
    for slot in schedule {
        if slot.d == target_day && (1..=12).contains(&slot.p) {
            bitmap[(slot.p - 1) as usize] = true;
        }
    }
    bitmap
}

#[tauri::command]
pub fn build_kindmap(schedule: Vec<CompactSlot>, target_day: u8) -> Vec<bool> {
    let mut kindmap = vec![false; 12]; // 12-period day
    for slot in schedule {
        if slot.d == target_day && (1..=12).contains(&slot.p) {
            kindmap[(slot.p - 1) as usize] = slot.s == "l"; // true for lab, false for theory
        }
    }
    kindmap
}

const THEORY_TIMES: [&str; 12] = [
    "08:00", "08:55", "09:50", "10:45", "11:40", "12:35", "14:00", "14:55", "15:50", "16:45",
    "17:40", "18:35",
];

const LAB_TIMES: [&str; 12] = [
    "08:00", "08:50", "09:50", "10:40", "11:40", "12:30", "14:00", "14:50", "15:50", "16:40",
    "17:40", "18:30",
];

const THEORY_PERIODS: [(&str, &str); 12] = [
    ("08:00", "08:50"),
    ("08:55", "09:45"),
    ("09:50", "10:40"),
    ("10:45", "11:35"),
    ("11:40", "12:30"),
    ("12:35", "13:25"),
    ("14:00", "14:50"),
    ("14:55", "15:45"),
    ("15:50", "16:40"),
    ("16:45", "17:35"),
    ("17:40", "18:30"),
    ("18:35", "19:25"),
];

const LAB_PERIODS: [(&str, &str); 12] = [
    ("08:00", "08:50"),
    ("08:50", "09:40"),
    ("09:50", "10:40"),
    ("10:40", "11:30"),
    ("11:40", "12:30"),
    ("12:30", "13:20"),
    ("14:00", "14:50"),
    ("14:50", "15:40"),
    ("15:50", "16:40"),
    ("16:40", "17:30"),
    ("17:40", "18:30"),
    ("18:30", "19:20"),
];

#[tauri::command]
pub fn next_free_time_after(
    bitmap: [bool; 12],  // Remove the & reference
    kindmap: [bool; 12], // Remove the & reference
    current_time: NaiveTime,
) -> String {
    // Determine if we're in a lab day or theory day for lunch timing
    let is_lab_schedule = kindmap[5]; // Check period 6's type

    // lunch times based on schedule type
    let lunch_start = if is_lab_schedule {
        NaiveTime::parse_from_str("13:20", "%H:%M").unwrap()
    } else {
        NaiveTime::parse_from_str("13:25", "%H:%M").unwrap()
    };
    let lunch_end = NaiveTime::parse_from_str("14:00", "%H:%M").unwrap();

    // Check free periods before lunch
    for i in 0..12 {
        if bitmap[i] {
            continue; // Skip busy periods
        }

        let (start_str, end_str) = if kindmap[i] {
            LAB_PERIODS[i]
        } else {
            THEORY_PERIODS[i]
        };

        let start = NaiveTime::parse_from_str(start_str, "%H:%M").unwrap();
        let end = NaiveTime::parse_from_str(end_str, "%H:%M").unwrap();

        // Skip periods that are after lunch
        if start >= lunch_end {
            continue;
        }

        // If we're currently in a free period
        if current_time >= start && current_time < end {
            return "YOU ARE FREE".to_string();
        }

        // If there's a free period starting after current time but before lunch
        if current_time < start && start < lunch_start {
            return format!("{}", start);
        }
    }

    // If no free periods found before lunch, check if current time is before lunch
    if current_time < lunch_start {
        return format!("{}", lunch_start); // Next free time is lunch
    }

    // If we're in lunch period
    if current_time >= lunch_start && current_time < lunch_end {
        return "YOU ARE FREE".to_string(); // Currently free during lunch
    }

    // Check for free periods after lunch
    for i in 0..12 {
        if bitmap[i] {
            continue; // Skip busy periods
        }

        let (start_str, end_str) = if kindmap[i] {
            LAB_PERIODS[i]
        } else {
            THEORY_PERIODS[i]
        };

        let start = NaiveTime::parse_from_str(start_str, "%H:%M").unwrap();
        let end = NaiveTime::parse_from_str(end_str, "%H:%M").unwrap();

        // Only consider periods after lunch
        if end <= lunch_end {
            continue;
        }

        // If we're currently in a free period
        if current_time >= start && current_time < end {
            return "YOU ARE FREE".to_string();
        }

        // Next free period starting after current time
        if current_time < start {
            return format!("{}", start);
        }
    }

    "NO FREE TIME AVAILABLE".to_string()
}

// pub fn main(){
//     let bitmap = [true, true, true, true, true, false, false, true, false, true, true, true];
//     let kindmap = [false, false, false, false, false, false, false, false, false, false, false, false];
//     let current_time = NaiveTime::parse_from_str("13:10", "%H:%M").unwrap();

//     let result = next_free_time_after(&bitmap, &kindmap, current_time);
//     println!("Next free time: {}", result);
// }

#[derive(Serialize)]
pub struct FreeStatus {
    pub is_busy: bool,            // true = busy, false = free
    pub from: NaiveTime,          // if free: current time or start of next free period
    pub until: Option<NaiveTime>, // if free: until when you're free, if busy: when next free
}

#[tauri::command]
pub fn get_free_status(
    bitmap: [bool; 12],
    kindmap: [bool; 12],
    current_time: NaiveTime,
) -> Option<FreeStatus> {
    for i in 0..12 {
        let (start_str, end_str) = if kindmap[i] {
            LAB_PERIODS[i]
        } else {
            THEORY_PERIODS[i]
        };

        let start = NaiveTime::parse_from_str(start_str, "%H:%M").unwrap();
        let end = NaiveTime::parse_from_str(end_str, "%H:%M").unwrap();

        if current_time >= start && current_time < end {
            if !bitmap[i] {
                // currently free
                return Some(FreeStatus {
                    is_busy: false,
                    from: current_time,
                    until: Some(end),
                });
            } else {
                // currently busy
                let mut next_free: Option<NaiveTime> = None;
                for j in i + 1..12 {
                    if !bitmap[j] {
                        let (start_j, _) = if kindmap[j] {
                            LAB_PERIODS[j]
                        } else {
                            THEORY_PERIODS[j]
                        };
                        next_free = Some(NaiveTime::parse_from_str(start_j, "%H:%M").unwrap());
                        break;
                    }
                }
                return Some(FreeStatus {
                    is_busy: true,
                    from: end,
                    until: next_free,
                });
            }
        }
    }

    // Before day starts: look for next free
    for i in 0..12 {
        let (start_str, end_str) = if kindmap[i] {
            LAB_PERIODS[i]
        } else {
            THEORY_PERIODS[i]
        };

        let start = NaiveTime::parse_from_str(start_str, "%H:%M").unwrap();
        let end = NaiveTime::parse_from_str(end_str, "%H:%M").unwrap();

        if current_time < start && !bitmap[i] {
            return Some(FreeStatus {
                is_busy: false,
                from: start,
                until: Some(end),
            });
        }
    }

    None
}

#[tauri::command]
pub fn currently_at(time: &str, time_table: Vec<CompactSlot>, day: u8) -> Option<String> {
    // Parse the current time
    let current_time = match NaiveTime::parse_from_str(time, "%H:%M") {
        Ok(t) => t,
        Err(_) => return None, // Invalid time format
    };

    // Find which period the current time belongs to
    let mut current_period = None;

    // Check against both theory and lab periods to find the current period
    for i in 0..12 {
        // Check theory periods
        let (theory_start, theory_end) = THEORY_PERIODS[i];
        let theory_start_time = NaiveTime::parse_from_str(theory_start, "%H:%M").unwrap();
        let theory_end_time = NaiveTime::parse_from_str(theory_end, "%H:%M").unwrap();

        if current_time >= theory_start_time && current_time < theory_end_time {
            current_period = Some(i as u8 + 1);
            break;
        }

        // Check lab periods
        let (lab_start, lab_end) = LAB_PERIODS[i];
        let lab_start_time = NaiveTime::parse_from_str(lab_start, "%H:%M").unwrap();
        let lab_end_time = NaiveTime::parse_from_str(lab_end, "%H:%M").unwrap();

        if current_time >= lab_start_time && current_time < lab_end_time {
            current_period = Some(i as u8 + 1);
            break;
        }
    }

    // If we couldn't determine the current period, return None
    let period = match current_period {
        Some(p) => p,
        None => return None,
    };

    // Look for a matching slot in the time_table with the same day and period
    for slot in time_table {
        if slot.d == day && slot.p == period {
            // Extract the location from the f field (part after the first hyphen)
            if let Some(first_hyphen) = slot.f.find('-') {
                let after_first_hyphen = &slot.f[first_hyphen + 1..];
                return Some(after_first_hyphen.to_string());
            }
        }
    }

    // No matching slot found
    None
}

// fn main() {

//     let bitmap: [bool; 12] = [
//         true, true, true, // 1-3 busy
//         false, false, false, // 4-6 free
//         true, true, true, // 7-9 busy
//         false, false, false // 10-12 free
//     ];

//     let kindmap: [bool; 12] = [
//         false, false, false,
//         false, false, false,
//         true, true, true,
//         true, true, true,
//     ];

//     let now = NaiveTime::parse_from_str("09:55", "%H:%M").unwrap();

//     if let Some(status) = get_free_status(&bitmap, &kindmap, now) {
//         match status.is_busy {
//             true => println!(
//                 "You’re busy now. Free from {} to {:?}",
//                 status.from.format("%H:%M"),
//                 status.until.map(|t| t.format("%H:%M").to_string())
//             ),
//             false => println!(
//                 "You’re free now until {}",
//                 status.until.unwrap().format("%H:%M")
//             ),
//         }
//     } else {
//         println!("No free time left today.");
//     }
// }
