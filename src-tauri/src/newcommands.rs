use chrono::{DateTime, Duration, NaiveDateTime, NaiveTime, Timelike, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::command;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ScheduleEntry {
    pub d: u8,     // day
    pub s: String, // session type ("t" or "l")
    pub p: u8,     // period
    pub f: String, // full info
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Student {
    pub u: String,             // username
    pub t: DateTime<Utc>,      // timestamp
    pub o: Vec<ScheduleEntry>, // schedule
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserStatus {
    pub name: String,
    pub available: bool,
    pub location: String,
    pub time: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FreeTimeSlot {
    pub start: String,
    pub end: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StudentFreeTime {
    pub student_id: String,
    pub free_minutes: u32,
}

// Period timings
const THEORY_PERIODS: [(u8, &str, &str); 12] = [
    (1, "08:00", "08:50"),
    (2, "08:55", "09:45"),
    (3, "09:50", "10:40"),
    (4, "10:45", "11:35"),
    (5, "11:40", "12:30"),
    (6, "12:35", "13:25"),
    (7, "14:00", "14:50"),
    (8, "14:55", "15:45"),
    (9, "15:50", "16:40"),
    (10, "16:45", "17:35"),
    (11, "17:40", "18:30"),
    (12, "18:35", "19:25"),
];

const LAB_PERIODS: [(u8, &str, &str); 12] = [
    (1, "08:00", "08:50"),
    (2, "08:50", "09:40"),
    (3, "09:50", "10:40"),
    (4, "10:40", "11:30"),
    (5, "11:40", "12:30"),
    (6, "12:30", "13:20"),
    (7, "14:00", "14:50"),
    (8, "14:50", "15:40"),
    (9, "15:50", "16:40"),
    (10, "16:40", "17:30"),
    (11, "17:40", "18:30"),
    (12, "18:30", "19:20"),
];

fn get_slot_index(time: NaiveTime) -> Option<usize> {
    let total_minutes = time.hour() * 60 + time.minute();

    // Before 8:00 or after 19:25 or during lunch break (13:25-14:00)
    if total_minutes < 480 || total_minutes >= 1165 || (805 <= total_minutes && total_minutes < 840)
    {
        return None;
    }

    // Adjust for times after lunch break
    if total_minutes >= 840 {
        // After 14:00
        Some(((total_minutes - 480 - 35) / 5) as usize)
    } else {
        Some(((total_minutes - 480) / 5) as usize)
    }
}

fn build_bitmap(schedule: &[ScheduleEntry]) -> (Vec<u8>, HashMap<usize, String>) {
    let mut bitmap = vec![0u8; 130];
    let mut slot_map = HashMap::new();

    for entry in schedule {
        let periods = if entry.s == "t" {
            &THEORY_PERIODS
        } else {
            &LAB_PERIODS
        };
        let period_info = periods.iter().find(|(p, _, _)| *p == entry.p);

        if let Some((_, start_str, end_str)) = period_info {
            let start = NaiveTime::parse_from_str(start_str, "%H:%M").unwrap();
            let end = NaiveTime::parse_from_str(end_str, "%H:%M").unwrap();

            let mut current = start;
            while current < end {
                if let Some(idx) = get_slot_index(current) {
                    if idx < bitmap.len() {
                        bitmap[idx] = 1;
                        slot_map.insert(idx, entry.f.clone());
                    }
                }
                current = current + Duration::minutes(5);
            }
        }
    }

    (bitmap, slot_map)
}

#[command]
pub fn is_student_free(
    students: Vec<Student>,
    student_id: String,
    time: String,
) -> Result<(bool, Option<String>), String> {
    let student = students
        .iter()
        .find(|s| s.u == student_id)
        .ok_or("Student not found")?;

    let time = NaiveTime::parse_from_str(&time, "%H:%M").map_err(|_| "Invalid time format")?;

    let (bitmap, slot_map) = build_bitmap(&student.o);

    match get_slot_index(time) {
        None => Ok((true, None)),
        Some(idx) => {
            if idx >= bitmap.len() {
                Ok((true, None))
            } else {
                Ok((bitmap[idx] == 0, slot_map.get(&idx).cloned()))
            }
        }
    }
}

#[command]
pub fn find_free_students(
    students: Vec<Student>,
    time: String,
) -> Result<Vec<(String, Option<String>)>, String> {
    let time = NaiveTime::parse_from_str(&time, "%H:%M").map_err(|_| "Invalid time format")?;

    let idx = get_slot_index(time);
    let mut result = Vec::new();

    for student in students {
        let (bitmap, slot_map) = build_bitmap(&student.o);

        match idx {
            None => result.push((student.u, None)),
            Some(i) => {
                if i >= bitmap.len() || bitmap[i] == 0 {
                    result.push((student.u, None));
                } else {
                    result.push((student.u, slot_map.get(&i).cloned()));
                }
            }
        }
    }

    Ok(result)
}

#[command]
pub fn find_mutual_free(
    students: Vec<Student>,
    student_id1: String,
    student_id2: String,
) -> Result<Vec<FreeTimeSlot>, String> {
    let student1 = students
        .iter()
        .find(|s| s.u == student_id1)
        .ok_or("Student 1 not found")?;
    let student2 = students
        .iter()
        .find(|s| s.u == student_id2)
        .ok_or("Student 2 not found")?;

    let (bitmap1, _) = build_bitmap(&student1.o);
    let (bitmap2, _) = build_bitmap(&student2.o);

    let mutual: Vec<u8> = bitmap1
        .iter()
        .zip(&bitmap2)
        .map(|(a, b)| 1 - (a | b))
        .collect();

    let mut result = Vec::new();
    let mut i = 0;
    let base = NaiveTime::from_hms_opt(8, 0, 0).unwrap();

    while i < mutual.len() {
        if mutual[i] == 1 {
            let start = i;
            while i < mutual.len() && mutual[i] == 1 {
                i += 1;
            }

            let offset1 = if start >= 76 { 4 } else { 0 };
            let offset2 = if i >= 76 { 4 } else { 0 };

            let t1 = base + Duration::minutes((5 * start + offset1 * 5) as i64);
            let t2 = base + Duration::minutes((5 * i + offset2 * 5) as i64);

            result.push(FreeTimeSlot {
                start: t1.format("%H:%M").to_string(),
                end: t2.format("%H:%M").to_string(),
            });
        } else {
            i += 1;
        }
    }

    Ok(result)
}

#[command]
pub fn next_free_time(
    students: Vec<Student>,
    student_id: String,
    time: String,
    day: u8,
) -> Result<Option<String>, String> {
    let student = students
        .iter()
        .find(|s| s.u == student_id)
        .ok_or("Student not found")?;

    let time = NaiveTime::parse_from_str(&time, "%H:%M").map_err(|_| "Invalid time format")?;

    let idx = get_slot_index(time);
    if idx.is_none() {
        return Ok(Some(time.format("%H:%M").to_string()));
    }

    let day_schedule: Vec<ScheduleEntry> = student
        .o
        .iter()
        .filter(|entry| entry.d == day)
        .cloned()
        .collect();

    let (bitmap, _) = build_bitmap(&day_schedule);
    let idx = idx.unwrap();

    // Look for the next free slot on the current day
    for i in (idx + 1)..bitmap.len() {
        if bitmap[i] == 0 {
            // Properly calculate time from bitmap index
            let base = NaiveTime::from_hms_opt(8, 0, 0).unwrap();
            let offset = 5 * i as i64;
            let result_time = base + Duration::minutes(offset);

            // Validate that the time calculation is correct
            println!(
                "Current time: {}, Index: {}, Calculated time: {}",
                time, i, result_time
            );

            return Ok(Some(result_time.format("%H:%M").to_string()));
        }
    }

    // If no free time found today, check next day
    let next_day = day + 1;
    let next_day_schedule: Vec<ScheduleEntry> = student
        .o
        .iter()
        .filter(|entry| entry.d == next_day)
        .cloned()
        .collect();

    let (next_day_bitmap, _) = build_bitmap(&next_day_schedule);

    for i in 0..next_day_bitmap.len() {
        if next_day_bitmap[i] == 0 {
            let base = NaiveTime::from_hms_opt(8, 0, 0).unwrap();
            let offset = 5 * i as i64;
            let result_time = base + Duration::minutes(offset);

            return Ok(Some(result_time.format("%H:%M").to_string()));
        }
    }

    Ok(None)
}

#[command]
pub fn earliest_common_free_time(
    students: Vec<Student>,
    student_ids: Vec<String>,
) -> Result<Option<String>, String> {
    let mut bitmaps = Vec::new();

    for id in &student_ids {
        let student = students
            .iter()
            .find(|s| s.u == *id)
            .ok_or(format!("Student {} not found", id))?;
        let (bitmap, _) = build_bitmap(&student.o);
        bitmaps.push(bitmap);
    }

    for i in 0..130 {
        let all_free = bitmaps
            .iter()
            .all(|bitmap| i < bitmap.len() && bitmap[i] == 0);
        if all_free {
            let base = NaiveTime::from_hms_opt(8, 0, 0).unwrap();
            let offset = 5 * i as i64 + if i < 76 { 0 } else { -35 };
            let result_time = base + Duration::minutes(offset);
            return Ok(Some(result_time.format("%H:%M").to_string()));
        }
    }

    Ok(None)
}

#[command]
pub fn student_with_most_free_time(students: Vec<Student>) -> Result<StudentFreeTime, String> {
    let mut max_free_time = 0;
    let mut result_student = String::new();

    for student in &students {
        let (bitmap, _) = build_bitmap(&student.o);
        let free_time = bitmap.iter().filter(|&&bit| bit == 0).count() * 5;

        if free_time > max_free_time {
            max_free_time = free_time;
            result_student = student.u.clone();
        }
    }

    Ok(StudentFreeTime {
        student_id: result_student,
        free_minutes: max_free_time as u32,
    })
}

#[command]
pub fn get_heatmap(students: Vec<Student>) -> Result<Vec<u32>, String> {
    let mut heatmap = vec![0u32; 130];

    for student in &students {
        let (bitmap, _) = build_bitmap(&student.o);
        for (i, &bit) in bitmap.iter().enumerate() {
            if i < heatmap.len() {
                heatmap[i] += bit as u32;
            }
        }
    }

    Ok(heatmap)
}

#[command]
pub fn students_free_for(
    students: Vec<Student>,
    duration_mins: u32,
    time: String,
) -> Result<Vec<String>, String> {
    let time = NaiveTime::parse_from_str(&time, "%H:%M").map_err(|_| "Invalid time format")?;

    let slots_needed = (duration_mins / 5) as usize;
    let start_idx = get_slot_index(time);

    if start_idx.is_none() {
        return Ok(Vec::new());
    }

    let start_idx = start_idx.unwrap();
    let mut result = Vec::new();

    for student in &students {
        let (bitmap, _) = build_bitmap(&student.o);

        if start_idx + slots_needed <= bitmap.len() {
            let all_free = (start_idx..start_idx + slots_needed).all(|i| bitmap[i] == 0);

            if all_free {
                result.push(student.u.clone());
            }
        }
    }

    Ok(result)
}

#[command]
pub fn overbooked_students(
    students: Vec<Student>,
    threshold: u32,
) -> Result<Vec<(String, u32)>, String> {
    let mut results = Vec::new();

    for student in &students {
        let (bitmap, _) = build_bitmap(&student.o);
        let mut max_streak = 0;
        let mut current_streak = 0;

        for &bit in &bitmap {
            if bit == 1 {
                current_streak += 1;
                max_streak = max_streak.max(current_streak);
            } else {
                current_streak = 0;
            }
        }

        if max_streak >= threshold {
            results.push((student.u.clone(), max_streak * 5));
        }
    }

    Ok(results)
}

#[command]
pub fn get_status_bitmap(
    user: Student,
    current_day: u8,
    current_time: String,
) -> Result<UserStatus, String> {
    let current_time =
        NaiveTime::parse_from_str(&current_time, "%H:%M").map_err(|_| "Invalid time format")?;

    let mut slot_info = HashMap::new();

    for entry in &user.o {
        if entry.d != current_day {
            continue;
        }

        let periods = if entry.s == "t" {
            &THEORY_PERIODS
        } else {
            &LAB_PERIODS
        };
        let period_info = periods.iter().find(|(p, _, _)| *p == entry.p);

        if let Some((_, start_str, end_str)) = period_info {
            let start_time = NaiveTime::parse_from_str(start_str, "%H:%M").unwrap();
            let end_time = NaiveTime::parse_from_str(end_str, "%H:%M").unwrap();

            // Extract location from the f field (assuming format like "A2-BMAT201L-TH-AB3-206-ALL")
            let location = entry.f.split('-').nth(4).unwrap_or("Unknown").to_string();

            slot_info.insert(entry.p, (start_time, end_time, location));
        }
    }

    // Check if currently busy
    for (_, (start, end, location)) in &slot_info {
        if current_time >= *start && current_time <= *end {
            return Ok(UserStatus {
                name: user.u,
                available: false,
                location: location.clone(),
                time: format!("busy till {}", end.format("%H:%M")),
            });
        }
    }

    // Check last seen location
    let mut last_end_time = None;
    let mut last_location = String::new();

    for (_, (_, end, location)) in &slot_info {
        if current_time > *end {
            if last_end_time.is_none() || *end > last_end_time.unwrap() {
                last_end_time = Some(*end);
                last_location = location.clone();
            }
        }
    }

    if let Some(end_time) = last_end_time {
        Ok(UserStatus {
            name: user.u,
            available: true,
            location: last_location,
            time: format!("free from {}", end_time.format("%H:%M")),
        })
    } else {
        Ok(UserStatus {
            name: user.u,
            available: true,
            location: "Unknown".to_string(),
            time: "free whole day".to_string(),
        })
    }
}
