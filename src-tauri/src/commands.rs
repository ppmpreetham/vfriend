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

#[tauri::command]
pub fn check_conflicts(
    user1_schedule_json: &str,
    user2_schedule_json: &str,
) -> Vec<ConflictResult> {
    let time_slots = initialize_time_slots();
    let lunch_periods = initialize_lunch_periods();

    let user1_schedule: CompactTimetable = serde_json::from_str(user1_schedule_json)
        .unwrap_or_else(|_| CompactTimetable {
            u: "".to_string(),
            t: "".to_string(),
            o: vec![],
        });

    let user2_schedule: CompactTimetable = serde_json::from_str(user2_schedule_json)
        .unwrap_or_else(|_| CompactTimetable {
            u: "".to_string(),
            t: "".to_string(),
            o: vec![],
        });

    let mut all_conflicts: Vec<ConflictResult> = Vec::new();

    // Check conflicts for all days
    for day in 1..=7 {
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

        // Check conflicts
        for slot1 in &user1_day_slots {
            if slot1.p == 0 {
                continue;
            }

            if let Some((slot1_start, slot1_end)) =
                get_time_slot_info(slot1.d, slot1.p, &slot1.s, &time_slots, &lunch_periods)
            {
                for slot2 in &user2_day_slots {
                    if slot2.p == 0 {
                        continue;
                    }

                    if let Some((slot2_start, slot2_end)) =
                        get_time_slot_info(slot2.d, slot2.p, &slot2.s, &time_slots, &lunch_periods)
                    {
                        // Check overlap
                        let slot1_start_mins = time_to_minutes(&slot1_start);
                        let slot1_end_mins = time_to_minutes(&slot1_end);
                        let slot2_start_mins = time_to_minutes(&slot2_start);
                        let slot2_end_mins = time_to_minutes(&slot2_end);

                        let overlaps =
                            slot1_start_mins < slot2_end_mins && slot1_end_mins > slot2_start_mins;

                        if overlaps {
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

    all_conflicts
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