use crate::scheduling_conflict::{
    find_common_free_times, get_time_slot_info, initialize_lunch_periods, initialize_time_slots,
    is_user_free_at, CompactTimetable, Friend,
};
use serde::Serialize;

#[derive(Debug, Serialize, Clone)]
pub struct FreeTimeResult {
    day: u8,
    start_time: String,
    end_time: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct ConflictResult {
    day: u8,
    user1_class: String,
    user1_time: String,
    user2_class: String,
    user2_time: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct DebugConflictResult {
    conflicts: Vec<ConflictResult>,
    debug_info: String,
}

#[tauri::command]
pub fn check_conflicts_debug(
    user1_schedule_json: &str,
    user2_schedule_json: &str,
) -> DebugConflictResult {
    let mut debug_info = String::new();
    debug_info.push_str("=== DEBUG: check_conflicts called ===\n");

    let time_slots = initialize_time_slots();
    let lunch_periods = initialize_lunch_periods();

    let user1_schedule: CompactTimetable = serde_json::from_str(user1_schedule_json)
        .unwrap_or_else(|e| {
            debug_info.push_str(&format!("Error parsing user1 schedule: {}\n", e));
            CompactTimetable {
                u: "".to_string(),
                t: "".to_string(),
                o: vec![],
            }
        });

    let user2_schedule: CompactTimetable = serde_json::from_str(user2_schedule_json)
        .unwrap_or_else(|e| {
            debug_info.push_str(&format!("Error parsing user2 schedule: {}\n", e));
            CompactTimetable {
                u: "".to_string(),
                t: "".to_string(),
                o: vec![],
            }
        });

    debug_info.push_str(&format!(
        "Parsed User1: {} classes\n",
        user1_schedule.o.len()
    ));
    debug_info.push_str(&format!(
        "Parsed User2: {} classes\n",
        user2_schedule.o.len()
    ));

    // Debug the specific test case
    debug_info.push_str("\nUser1 classes:\n");
    for slot in &user1_schedule.o {
        if let Some((start, end)) =
            get_time_slot_info(slot.d, slot.p, &slot.s, &time_slots, &lunch_periods)
        {
            debug_info.push_str(&format!(
                "  Day {}, Period {}, Type {}: {} - {} ({})\n",
                slot.d, slot.p, slot.s, start, end, slot.f
            ));
        }
    }

    debug_info.push_str("\nUser2 classes:\n");
    for slot in &user2_schedule.o {
        if let Some((start, end)) =
            get_time_slot_info(slot.d, slot.p, &slot.s, &time_slots, &lunch_periods)
        {
            debug_info.push_str(&format!(
                "  Day {}, Period {}, Type {}: {} - {} ({})\n",
                slot.d, slot.p, slot.s, start, end, slot.f
            ));
        }
    }

    let mut all_conflicts: Vec<ConflictResult> = Vec::new();

    // Check conflicts for all days
    for day in 1..=7 {
        debug_info.push_str(&format!("\nChecking conflicts for day {}\n", day));

        // Get slots for this day
        let user1_day_slots: Vec<_> = user1_schedule
            .o
            .iter()
            .filter(|slot| slot.d == day)
            .collect();
        let user2_day_slots: Vec<_> = user2_schedule
            .o
            .iter()
            .filter(|slot| slot.d == day)
            .collect();

        debug_info.push_str(&format!(
            "User1 has {} slots on day {}\n",
            user1_day_slots.len(),
            day
        ));
        debug_info.push_str(&format!(
            "User2 has {} slots on day {}\n",
            user2_day_slots.len(),
            day
        ));

        // Manual conflict checking with debug
        for slot1 in &user1_day_slots {
            if slot1.p == 0 {
                continue;
            }

            if let Some((slot1_start, slot1_end)) =
                get_time_slot_info(slot1.d, slot1.p, &slot1.s, &time_slots, &lunch_periods)
            {
                debug_info.push_str(&format!(
                    "  Checking User1 slot: {} - {} ({})\n",
                    slot1_start, slot1_end, slot1.f
                ));

                for slot2 in &user2_day_slots {
                    if slot2.p == 0 {
                        continue;
                    }

                    if let Some((slot2_start, slot2_end)) =
                        get_time_slot_info(slot2.d, slot2.p, &slot2.s, &time_slots, &lunch_periods)
                    {
                        debug_info.push_str(&format!(
                            "    Against User2 slot: {} - {} ({})\n",
                            slot2_start, slot2_end, slot2.f
                        ));

                        // Check overlap manually
                        let slot1_start_mins = time_to_minutes(&slot1_start);
                        let slot1_end_mins = time_to_minutes(&slot1_end);
                        let slot2_start_mins = time_to_minutes(&slot2_start);
                        let slot2_end_mins = time_to_minutes(&slot2_end);

                        debug_info.push_str(&format!(
                            "    Times in minutes: {}({}) - {}({}) vs {}({}) - {}({})\n",
                            slot1_start,
                            slot1_start_mins,
                            slot1_end,
                            slot1_end_mins,
                            slot2_start,
                            slot2_start_mins,
                            slot2_end,
                            slot2_end_mins
                        ));

                        let overlaps =
                            slot1_start_mins < slot2_end_mins && slot1_end_mins > slot2_start_mins;
                        debug_info.push_str(&format!(
                            "    Overlap check: {} < {} && {} > {} = {}\n",
                            slot1_start_mins,
                            slot2_end_mins,
                            slot1_end_mins,
                            slot2_start_mins,
                            overlaps
                        ));

                        if overlaps {
                            debug_info.push_str("    *** CONFLICT DETECTED ***\n");
                            all_conflicts.push(ConflictResult {
                                day,
                                user1_class: slot1.f.clone(),
                                user1_time: format!("{}-{}", slot1_start, slot1_end),
                                user2_class: slot2.f.clone(),
                                user2_time: format!("{}-{}", slot2_start, slot2_end),
                            });
                        }
                    }
                }
            }
        }
    }

    debug_info.push_str(&format!(
        "\nTotal conflicts found: {}\n",
        all_conflicts.len()
    ));

    DebugConflictResult {
        conflicts: all_conflicts,
        debug_info,
    }
}

// Helper function to convert time to minutes
fn time_to_minutes(time_string: &str) -> i32 {
    if time_string == "Lunch" {
        return -1;
    }

    let parts: Vec<&str> = time_string.split(':').collect();
    if parts.len() != 2 {
        return -1;
    }

    match (parts[0].parse::<i32>(), parts[1].parse::<i32>()) {
        (Ok(hours), Ok(minutes)) => hours * 60 + minutes,
        _ => -1,
    }
}

#[tauri::command]
pub fn check_conflicts(
    user1_schedule_json: &str,
    user2_schedule_json: &str,
) -> Vec<ConflictResult> {
    let debug_result = check_conflicts_debug(user1_schedule_json, user2_schedule_json);
    debug_result.conflicts
}

#[tauri::command]
pub fn find_free_times(schedules_json: &str) -> Vec<FreeTimeResult> {
    let time_slots = initialize_time_slots();
    let lunch_periods = initialize_lunch_periods();

    let schedules: Vec<CompactTimetable> =
        serde_json::from_str(schedules_json).unwrap_or_else(|_| Vec::new());

    let friends: Vec<Friend> = schedules
        .into_iter()
        .map(|schedule| Friend {
            name: schedule.u.clone(),
            schedule,
        })
        .collect();

    let free_times = find_common_free_times(&friends, &time_slots, &lunch_periods);

    let result: Vec<FreeTimeResult> = free_times
        .into_iter()
        .map(|ft| FreeTimeResult {
            day: ft.day,
            start_time: ft.start_time,
            end_time: ft.end_time,
        })
        .collect();

    result
}

#[tauri::command]
pub fn is_free_at(schedule_json: &str, day: u8, time: &str) -> bool {
    let time_slots = initialize_time_slots();
    let lunch_periods = initialize_lunch_periods();

    let schedule: CompactTimetable =
        serde_json::from_str(schedule_json).unwrap_or_else(|_| CompactTimetable {
            u: "".to_string(),
            t: "".to_string(),
            o: vec![],
        });

    is_user_free_at(&schedule, day, time, &time_slots, &lunch_periods)
}
