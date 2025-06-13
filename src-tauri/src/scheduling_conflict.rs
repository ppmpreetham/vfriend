use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// Make structs and fields public
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct CompactTimetable {
    pub u: String,  // username
    pub t: String,  // timestamp
    pub o: Vec<CompactSlot>, // occupied slots
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct CompactSlot {
    pub d: u8,       // day (1-7)
    pub s: String,   // slot_type (t/l)
    pub p: u8,       // period
    pub f: String,   // full_text (original cell text)
}

#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct Conflict {
    pub day: u8,
    pub user1_slot: SlotInfo,
    pub user2_slot: SlotInfo,
}

#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct SlotInfo {
    pub slot_type: String,
    pub period: u8,
    pub time_range: String,
    pub class_text: String,
}

#[derive(Debug, Clone)]
pub struct FreeTimeSlot {
    pub day: u8,
    pub start_time: String,
    pub end_time: String,
}

#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct Friend {
    pub name: String,
    pub schedule: CompactTimetable,
}

// Define public time slot struct
#[derive(Debug, Clone)]
pub struct TimeSlot {
    pub period: u8,
    pub start_time: String,
    pub end_time: String,
}

// Define public lunch period struct
#[derive(Debug, Clone)]
pub struct LunchPeriod {
    pub start: String,
    pub end: String,
}

// Helper function to convert time string to minutes since midnight
pub fn time_to_minutes(time_string: &str) -> i32 {
    if time_string == "Lunch" {
        return -1; // Special case for lunch
    }
    
    let parts: Vec<&str> = time_string.split(':').collect();
    if parts.len() != 2 {
        return -1; // Invalid format
    }
    
    match (parts[0].parse::<i32>(), parts[1].parse::<i32>()) {
        (Ok(hours), Ok(minutes)) => hours * 60 + minutes,
        _ => -1, // Parsing error
    }
}

// Helper function to check if two time ranges overlap
pub fn time_ranges_overlap(start1: &str, end1: &str, start2: &str, end2: &str) -> bool {
    let start1_mins = time_to_minutes(start1);
    let end1_mins = time_to_minutes(end1);
    let start2_mins = time_to_minutes(start2);
    let end2_mins = time_to_minutes(end2);
    
    println!("Checking overlap: {}({}) - {}({}) vs {}({}) - {}({})", 
        start1, start1_mins, end1, end1_mins, 
        start2, start2_mins, end2, end2_mins);
    
    // Check for overlap
    let overlaps = start1_mins < end2_mins && end1_mins > start2_mins;
    println!("Overlap result: {}", overlaps);
    overlaps
}


// Initialize time slot definitions
pub fn initialize_time_slots() -> HashMap<String, Vec<TimeSlot>> {
    let mut time_slots = HashMap::new();
    
    // Theory time slots
    let theory_slots = vec![
        TimeSlot { period: 1, start_time: "08:00".to_string(), end_time: "08:50".to_string() },
        TimeSlot { period: 2, start_time: "08:55".to_string(), end_time: "09:45".to_string() },
        TimeSlot { period: 3, start_time: "09:50".to_string(), end_time: "10:40".to_string() },
        TimeSlot { period: 4, start_time: "10:45".to_string(), end_time: "11:35".to_string() },
        TimeSlot { period: 5, start_time: "11:40".to_string(), end_time: "12:30".to_string() },
        TimeSlot { period: 6, start_time: "12:35".to_string(), end_time: "13:25".to_string() },
        TimeSlot { period: 7, start_time: "14:00".to_string(), end_time: "14:50".to_string() },
        TimeSlot { period: 8, start_time: "14:55".to_string(), end_time: "15:45".to_string() },
        TimeSlot { period: 9, start_time: "15:50".to_string(), end_time: "16:40".to_string() },
        TimeSlot { period: 10, start_time: "16:45".to_string(), end_time: "17:35".to_string() },
        TimeSlot { period: 11, start_time: "17:40".to_string(), end_time: "18:30".to_string() },
        TimeSlot { period: 12, start_time: "18:35".to_string(), end_time: "19:25".to_string() },
    ];
    
    // Lab time slots
    let lab_slots = vec![
        TimeSlot { period: 1, start_time: "08:00".to_string(), end_time: "08:50".to_string() },
        TimeSlot { period: 2, start_time: "08:50".to_string(), end_time: "09:40".to_string() },
        TimeSlot { period: 3, start_time: "09:50".to_string(), end_time: "10:40".to_string() },
        TimeSlot { period: 4, start_time: "10:40".to_string(), end_time: "11:30".to_string() },
        TimeSlot { period: 5, start_time: "11:40".to_string(), end_time: "12:30".to_string() },
        TimeSlot { period: 6, start_time: "12:30".to_string(), end_time: "13:20".to_string() },
        TimeSlot { period: 7, start_time: "14:00".to_string(), end_time: "14:50".to_string() },
        TimeSlot { period: 8, start_time: "14:50".to_string(), end_time: "15:40".to_string() },
        TimeSlot { period: 9, start_time: "15:50".to_string(), end_time: "16:40".to_string() },
        TimeSlot { period: 10, start_time: "16:40".to_string(), end_time: "17:30".to_string() },
        TimeSlot { period: 11, start_time: "17:40".to_string(), end_time: "18:30".to_string() },
        TimeSlot { period: 12, start_time: "18:30".to_string(), end_time: "19:20".to_string() },
    ];
    
    time_slots.insert("theory".to_string(), theory_slots);
    time_slots.insert("lab".to_string(), lab_slots);
    
    time_slots
}

// Initialize lunch periods
pub fn initialize_lunch_periods() -> HashMap<String, LunchPeriod> {
    let mut lunch_periods = HashMap::new();
    
    lunch_periods.insert(
        "theory".to_string(),
        LunchPeriod {
            start: "13:25".to_string(),
            end: "14:00".to_string(),
        },
    );
    
    lunch_periods.insert(
        "lab".to_string(),
        LunchPeriod {
            start: "13:20".to_string(),
            end: "14:00".to_string(),
        },
    );
    
    lunch_periods
}

// Get the precise time slot information for a given class
// Removed unused day parameter
pub fn get_time_slot_info(
    _day: u8,  // Using underscore to mark it as intentionally unused
    period: u8, 
    slot_type: &str, 
    time_slots: &HashMap<String, Vec<TimeSlot>>,
    lunch_periods: &HashMap<String, LunchPeriod>
) -> Option<(String, String)> {
    let type_key = if slot_type == "t" { "theory" } else { "lab" };
    
    // Handle lunch period specially
    if period == 0 {
        if let Some(lunch) = lunch_periods.get(type_key) {
            return Some((lunch.start.clone(), lunch.end.clone()));
        }
        return None;
    }
    
    // Convert to 0-based index
    let period_index = (period - 1) as usize;
    
    // Get the slots for this type
    if let Some(slots) = time_slots.get(type_key) {
        if period_index < slots.len() {
            let slot = &slots[period_index];
            return Some((slot.start_time.clone(), slot.end_time.clone()));
        }
    }
    
    None
}

// Check if a specific slot conflicts with any slot in another schedule
pub fn slot_conflicts_with_schedule(
    slot: &CompactSlot, 
    other_schedule: &CompactTimetable,
    time_slots: &HashMap<String, Vec<TimeSlot>>,
    lunch_periods: &HashMap<String, LunchPeriod>
) -> bool {
    if let Some((slot_start, slot_end)) = get_time_slot_info(
        slot.d, slot.p, &slot.s, time_slots, lunch_periods
    ) {
        for other_slot in &other_schedule.o {
            // Only check for conflicts on the same day
            if slot.d == other_slot.d {
                if let Some((other_start, other_end)) = get_time_slot_info(
                    other_slot.d, other_slot.p, &other_slot.s, time_slots, lunch_periods
                ) {
                    // Check if the time ranges overlap
                    if time_ranges_overlap(&slot_start, &slot_end, &other_start, &other_end) {
                        return true;
                    }
                }
            }
        }
    }
    
    false
}

// Find conflicts between two users on a specific day
pub fn find_day_conflicts(
    user1_schedule: &CompactTimetable,
    user2_schedule: &CompactTimetable,
    day: u8,
    time_slots: &HashMap<String, Vec<TimeSlot>>,
    lunch_periods: &HashMap<String, LunchPeriod>
) -> Vec<Conflict> {
    let mut conflicts = Vec::new();
    
    println!("=== find_day_conflicts for day {} ===", day);
    
    // Get all slots for the specified day
    let user1_day_slots: Vec<&CompactSlot> = user1_schedule.o
        .iter()
        .filter(|slot| slot.d == day)
        .collect();
        
    let user2_day_slots: Vec<&CompactSlot> = user2_schedule.o
        .iter()
        .filter(|slot| slot.d == day)
        .collect();
    
    println!("User1 has {} slots on day {}: {:?}", user1_day_slots.len(), day, user1_day_slots);
    println!("User2 has {} slots on day {}: {:?}", user2_day_slots.len(), day, user2_day_slots);
    
    // Check each user1 slot against all user2 slots
    for slot1 in user1_day_slots {
        // Skip lunch periods
        if slot1.p == 0 { // Assuming period 0 is lunch
            continue;
        }
        
        println!("Checking user1 slot: day={}, period={}, type={}", slot1.d, slot1.p, slot1.s);
        
        if let Some((slot1_start, slot1_end)) = get_time_slot_info(
            slot1.d, slot1.p, &slot1.s, time_slots, lunch_periods
        ) {
            println!("User1 slot time: {} - {}", slot1_start, slot1_end);
            
            for slot2 in &user2_day_slots {
                // Skip lunch periods
                if slot2.p == 0 {
                    continue;
                }
                
                println!("  Checking against user2 slot: day={}, period={}, type={}", slot2.d, slot2.p, slot2.s);
                
                if let Some((slot2_start, slot2_end)) = get_time_slot_info(
                    slot2.d, slot2.p, &slot2.s, time_slots, lunch_periods
                ) {
                    println!("  User2 slot time: {} - {}", slot2_start, slot2_end);
                    
                    // Check if the time ranges overlap
                    if time_ranges_overlap(&slot1_start, &slot1_end, &slot2_start, &slot2_end) {
                        println!("  *** CONFLICT DETECTED ***");
                        conflicts.push(Conflict {
                            day,
                            user1_slot: SlotInfo {
                                slot_type: if slot1.s == "t" { "Theory".to_string() } else { "Lab".to_string() },
                                period: slot1.p,
                                time_range: format!("{}-{}", slot1_start, slot1_end),
                                class_text: slot1.f.clone(),
                            },
                            user2_slot: SlotInfo {
                                slot_type: if slot2.s == "t" { "Theory".to_string() } else { "Lab".to_string() },
                                period: slot2.p,
                                time_range: format!("{}-{}", slot2_start, slot2_end),
                                class_text: slot2.f.clone(),
                            },
                        });
                    }
                } else {
                    println!("  Could not get time info for user2 slot");
                }
            }
        } else {
            println!("Could not get time info for user1 slot");
        }
    }
    
    println!("Total conflicts found: {}", conflicts.len());
    conflicts
}

// Check if a user is free at a specific time
pub fn is_user_free_at(
    user_schedule: &CompactTimetable,
    day: u8,
    time_string: &str,
    time_slots: &HashMap<String, Vec<TimeSlot>>,
    lunch_periods: &HashMap<String, LunchPeriod>
) -> bool {
    let time_minutes = time_to_minutes(time_string);
    
    // Check if the time is during lunch period (always free)
    if let (Some(theory_lunch), Some(lab_lunch)) = (
        lunch_periods.get("theory"), 
        lunch_periods.get("lab")
    ) {
        let lunch_start_theory = time_to_minutes(&theory_lunch.start);
        let lunch_end_theory = time_to_minutes(&theory_lunch.end);
        let lunch_start_lab = time_to_minutes(&lab_lunch.start);
        let lunch_end_lab = time_to_minutes(&lab_lunch.end);
        
        if (time_minutes >= lunch_start_theory && time_minutes < lunch_end_theory) ||
           (time_minutes >= lunch_start_lab && time_minutes < lunch_end_lab) {
            return true;
        }
    }
    
    for slot in &user_schedule.o {
        if slot.d != day {
            continue;
        }
        
        if slot.p == 0 {
            continue;
        }
        
        if let Some((slot_start, slot_end)) = get_time_slot_info(
            slot.d, slot.p, &slot.s, time_slots, lunch_periods
        ) {
            let slot_start_minutes = time_to_minutes(&slot_start);
            let slot_end_minutes = time_to_minutes(&slot_end);
            
            if time_minutes >= slot_start_minutes && time_minutes < slot_end_minutes {
                return false;
            }
        }
    }
    
    true 
}

// Find common free times between multiple friends
pub fn find_common_free_times(
    friends_schedules: &[Friend],
    time_slots: &HashMap<String, Vec<TimeSlot>>,
    lunch_periods: &HashMap<String, LunchPeriod>
) -> Vec<FreeTimeSlot> {
    // Fixed by adding the explicit type annotation
    let mut common_free_times: Vec<FreeTimeSlot> = Vec::new();
    let days = vec![1, 2, 3, 4, 5, 6, 7]; // Monday to Sunday
    
    // For each day, check every 5-minute interval to find common free times
    for &day in &days {
        // Generate time intervals across the day (8:00 to 19:30)
        let start_minutes = time_to_minutes("08:00");
        let end_minutes = time_to_minutes("19:30");
        let mut intervals = Vec::new();
        
        // Create 5-minute intervals
        for min in (start_minutes..end_minutes).step_by(5) {
            let hour = min / 60;
            let minute = min % 60;
            let time_string = format!("{:02}:{:02}", hour, minute);
            intervals.push(time_string);
        }
        
        // For each interval, check if all friends are free
        for i in 0..intervals.len() - 1 {
            let start_time = &intervals[i];
            let end_time = &intervals[i + 1];
            
            // Check if all friends are free during this interval
            let all_free = friends_schedules.iter().all(|friend| {
                !friend.schedule.o.iter().any(|slot| {
                    // Skip slots from other days
                    if slot.d != day {
                        return false;
                    }
                    
                    // Skip lunch periods
                    if slot.p == 0 {
                        return false;
                    }
                    
                    if let Some((slot_start, slot_end)) = get_time_slot_info(
                        slot.d, slot.p, &slot.s, time_slots, lunch_periods
                    ) {
                        // Check if the slot overlaps with the current interval
                        time_ranges_overlap(
                            &start_time, &end_time,
                            &slot_start, &slot_end
                        )
                    } else {
                        false
                    }
                })
            });
            
            if all_free {
                // Combine consecutive free intervals
                if let Some(last_free_time) = common_free_times.last_mut() {
                    if last_free_time.day == day && last_free_time.end_time == *start_time {
                        last_free_time.end_time = end_time.clone();
                        continue;
                    }
                }
                
                common_free_times.push(FreeTimeSlot {
                    day,
                    start_time: start_time.clone(),
                    end_time: end_time.clone(),
                });
            }
        }
    }
    
    common_free_times
}

