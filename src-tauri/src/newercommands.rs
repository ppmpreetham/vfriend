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
pub fn currentbit(bitmap: [bool; 12], kindmap: [bool; 12]) -> Result<u8, String> {
    let current_time = chrono::Local::now().time();

    for i in 0..12 {
        let (start_str, end_str) = if kindmap[i] {
            LAB_PERIODS[i]
        } else {
            THEORY_PERIODS[i]
        };

        let start = NaiveTime::parse_from_str(start_str, "%H:%M")
            .map_err(|e| format!("Start time parse error: {}", e))?;
        let end = NaiveTime::parse_from_str(end_str, "%H:%M")
            .map_err(|e| format!("End time parse error: {}", e))?;

        if current_time >= start && current_time < end && bitmap[i] {
            return Ok((i + 1) as u8); // 1-based period index
        }
    }

    // Optional: special lunch detection
    let lunch_start = NaiveTime::parse_from_str("13:25", "%H:%M").unwrap();
    let lunch_end = NaiveTime::parse_from_str("14:00", "%H:%M").unwrap();
    if current_time >= lunch_start && current_time < lunch_end {
        return Ok(13); // Special code for lunch
    }

    Ok(0) // 0 = no active period
}


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

#[derive(serde::Serialize)]
pub struct FreeStatus {
    pub is_busy: bool,
    pub from: NaiveTime,
    pub until: Option<NaiveTime>,
    pub is_lunch: bool, // New field to identify lunch periods
}

#[tauri::command]
pub fn get_free_status(
    bitmap: [bool; 12],
    kindmap: [bool; 12],
    current_time: NaiveTime,
) -> Option<FreeStatus> {
    // Check for lunch period first to give it priority
    let lunch_start = NaiveTime::parse_from_str("13:25", "%H:%M").unwrap();
    let lunch_end = NaiveTime::parse_from_str("14:00", "%H:%M").unwrap();
    if current_time >= lunch_start && current_time < lunch_end {
        return Some(FreeStatus {
            is_busy: false,
            from: current_time,
            until: Some(lunch_end),
            is_lunch: true, // Mark as lunch period
        });
    }
    
    // Get the next free time
    let next_free_time_str = next_free_time_after(bitmap, kindmap, current_time);
    
    // Determine if currently free or busy
    if next_free_time_str == "YOU ARE FREE" {
        // User is currently free, find when they'll next be busy
        
        // Check if in a period
        for i in 0..12 {
            let (start_str, end_str) = if kindmap[i] {
                LAB_PERIODS[i]
            } else {
                THEORY_PERIODS[i]
            };
            let start = NaiveTime::parse_from_str(start_str, "%H:%M").unwrap();
            let end = NaiveTime::parse_from_str(end_str, "%H:%M").unwrap();
            
            if current_time >= start && current_time < end && !bitmap[i] {
                // We're in a free period, find when it ends
                return Some(FreeStatus {
                    is_busy: false,
                    from: current_time,
                    until: Some(end),
                    is_lunch: false,
                });
            }
        }
        
        // If not in a specific period, free until end of day
        return Some(FreeStatus {
            is_busy: false,
            from: current_time,
            until: None,
            is_lunch: false,
        });
    } else if next_free_time_str == "NO FREE TIME AVAILABLE" {
        // No more free time today
        return Some(FreeStatus {
            is_busy: true,
            from: current_time,
            until: None,
            is_lunch: false,
        });
    } else {
        // User is busy, will be free at the time specified
        match NaiveTime::parse_from_str(&next_free_time_str, "%H:%M") {
            Ok(time) => {
                return Some(FreeStatus {
                    is_busy: true,
                    from: current_time,
                    until: Some(time),
                    is_lunch: time == lunch_start, // If next free time is lunch start
                });
            },
            Err(_) => {
                // Parse error - fall back to default
                return Some(FreeStatus {
                    is_busy: true,
                    from: current_time,
                    until: None,
                    is_lunch: false,
                });
            }
        }
    }
}

#[tauri::command]
pub fn new_get_free_status(
    bitmap: [bool; 12],
    kindmap: [bool; 12],
    current_time: NaiveTime,
) -> Option<FreeStatus> {
    // Check for lunch period first
    let lunch_start = NaiveTime::parse_from_str("13:25", "%H:%M").unwrap();
    let lunch_end = NaiveTime::parse_from_str("14:00", "%H:%M").unwrap();
    
    // If we're in lunch period, we're already free
    if current_time >= lunch_start && current_time < lunch_end {
        return Some(FreeStatus {
            is_busy: false,
            from: current_time,
            until: Some(lunch_end),
            is_lunch: true,
        });
    }
    
    // Check if we're in any class period
    let mut in_period = false;
    let mut current_period_index = 0;
    let mut current_period_end = NaiveTime::from_hms(0, 0, 0);
    
    for i in 0..12 {
        let (start_str, end_str) = if kindmap[i] {
            LAB_PERIODS[i]
        } else {
            THEORY_PERIODS[i]
        };
        let start = NaiveTime::parse_from_str(start_str, "%H:%M").unwrap();
        let end = NaiveTime::parse_from_str(end_str, "%H:%M").unwrap();
        
        if current_time >= start && current_time < end {
            in_period = true;
            current_period_index = i;
            current_period_end = end;
            break;
        }
    }
    
    if in_period {
        // We are in a class period
        if !bitmap[current_period_index] {
            // Currently in a FREE period - find how long we're free
            let mut last_end = current_period_end;
            for j in (current_period_index + 1)..12 {
                if bitmap[j] {
                    break;
                }
                let (_, next_end_str) = if kindmap[j] {
                    LAB_PERIODS[j]
                } else {
                    THEORY_PERIODS[j]
                };
                last_end = NaiveTime::parse_from_str(next_end_str, "%H:%M").unwrap();
            }
            
            return Some(FreeStatus {
                is_busy: false,
                from: current_time,
                until: Some(last_end),
                is_lunch: false,
            });
        } else {
            // Currently in a BUSY period - find when we'll next be free
            
            // Check if lunch is next after this period
            if current_period_end <= lunch_start && lunch_start > current_time {
                return Some(FreeStatus {
                    is_busy: true,
                    from: current_time,
                    until: Some(lunch_start),
                    is_lunch: false,
                });
            }
            
            // Look for next free period
            for j in (current_period_index + 1)..12 {
                if !bitmap[j] {
                    let (next_start_str, _) = if kindmap[j] {
                        LAB_PERIODS[j]
                    } else {
                        THEORY_PERIODS[j]
                    };
                    let next_free = NaiveTime::parse_from_str(next_start_str, "%H:%M").unwrap();
                    
                    // But if lunch comes first, return that
                    if next_free > lunch_start && current_period_end < lunch_start && current_time < lunch_start {
                        return Some(FreeStatus {
                            is_busy: true,
                            from: current_time,
                            until: Some(lunch_start),
                            is_lunch: false,
                        });
                    }
                    
                    return Some(FreeStatus {
                        is_busy: true,
                        from: current_time,
                        until: Some(next_free),
                        is_lunch: false,
                    });
                }
            }
            
            // No more free periods today
            return Some(FreeStatus {
                is_busy: true,
                from: current_time,
                until: None,
                is_lunch: false,
            });
        }
    } else {
        // We're not in any class period - either before day starts, after it ends, or between periods
        
        // Before day starts or between periods - find next free slot
        for i in 0..12 {
            let (start_str, _) = if kindmap[i] {
                LAB_PERIODS[i]
            } else {
                THEORY_PERIODS[i]
            };
            let start = NaiveTime::parse_from_str(start_str, "%H:%M").unwrap();
            
            if current_time < start && !bitmap[i] {
                // Found the next free period
                return Some(FreeStatus {
                    is_busy: false,
                    from: start,
                    until: None, // We'll determine the duration when they're actually in the period
                    is_lunch: false,
                });
            }
        }
        
        // If no free periods are found and we're before lunch
        if current_time < lunch_start {
            return Some(FreeStatus {
                is_busy: false,
                from: lunch_start,
                until: Some(lunch_end),
                is_lunch: true,
            });
        }
        
        // After all classes, user is free
        let latest_period_end = NaiveTime::parse_from_str("19:25", "%H:%M").unwrap();
        if current_time >= latest_period_end {
            return Some(FreeStatus {
                is_busy: false,
                from: current_time,
                until: None,
                is_lunch: false,
            });
        }
    }
    
    // Default fallback
    Some(FreeStatus {
        is_busy: true,
        from: current_time,
        until: None,
        is_lunch: false,
    })
}

#[tauri::command]
pub fn currently_at(time: &str, time_table: Vec<CompactSlot>, day: u8, is_end_time: bool) -> Option<String> {
    // Parse the current time
    let current_time = match NaiveTime::parse_from_str(time, "%H:%M") {
        Ok(t) => t,
        Err(_) => return None, // Invalid time format
    };

    // Find which period the current time belongs to
    let mut current_period = None;

    if !is_end_time {
        // Original logic for start time - find period containing this time
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
    } else {
        // New logic for end time - find the period that ENDS at this time
        for i in 0..12 {
            // Check theory periods
            let (_, theory_end) = THEORY_PERIODS[i];
            let theory_end_time = NaiveTime::parse_from_str(theory_end, "%H:%M").unwrap();
            
            if current_time == theory_end_time {
                // Found the period that ends at this time
                // Look for the NEXT period (not this one)
                if i < 11 {  // Check if there's a next period
                    current_period = Some((i + 1) as u8 + 1);
                    break;
                }
            }
            
            // Check lab periods
            let (_, lab_end) = LAB_PERIODS[i];
            let lab_end_time = NaiveTime::parse_from_str(lab_end, "%H:%M").unwrap();
            
            if current_time == lab_end_time {
                // Found the period that ends at this time
                // Look for the NEXT period (not this one)
                if i < 11 {  // Check if there's a next period
                    current_period = Some((i + 1) as u8 + 1);
                    break;
                }
            }
        }
        
        // If no exact match for end time, find the next period that would start after this time
        if current_period.is_none() {
            let mut next_period_index = None;
            let mut next_period_time = NaiveTime::from_hms(23, 59, 59); // Initialize with end of day
            
            for i in 0..12 {
                let (theory_start, _) = THEORY_PERIODS[i];
                let theory_start_time = NaiveTime::parse_from_str(theory_start, "%H:%M").unwrap();
                
                // Find the closest period that starts after current_time
                if current_time < theory_start_time && theory_start_time < next_period_time {
                    next_period_time = theory_start_time;
                    next_period_index = Some(i);
                }
                
                let (lab_start, _) = LAB_PERIODS[i];
                let lab_start_time = NaiveTime::parse_from_str(lab_start, "%H:%M").unwrap();
                
                // Find the closest period that starts after current_time
                if current_time < lab_start_time && lab_start_time < next_period_time {
                    next_period_time = lab_start_time;
                    next_period_index = Some(i);
                }
            }
            
            if let Some(idx) = next_period_index {
                current_period = Some(idx as u8 + 1);
            }
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
            // Return the full course information
            return Some(slot.f.clone());
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
