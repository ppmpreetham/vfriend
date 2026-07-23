use chrono::{Datelike, Local, NaiveTime};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, PartialEq, Eq)]
pub struct CompactSlot {
    d: u8,     // day (1-7, Monday-Sunday)
    s: String, // "t" or "l"
    p: u8,     // period (1-12)
    f: String, // compact course/location text
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct ClassInfo {
    pub period: u8,
    pub slot_type: String,
    pub raw: String,
    pub title: String,
    pub place: String,
    pub start: String,
    pub end: String,
}

#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum StatusState {
    InClass,
    InTransition,
    FreeBeforeFirstClass,
    FreeBetweenClasses,
    Lunch,
    DoneForDay,
    FreeDay,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct TimetableStatus {
    pub state: StatusState,
    pub is_busy: bool,
    pub is_lunch: bool,
    pub is_transition: bool,
    pub current: Option<ClassInfo>,
    pub current_run_end: Option<ClassInfo>,
    pub next: Option<ClassInfo>,
    pub last_seen: Option<ClassInfo>,
    pub last_seen_at: Option<String>,
    pub from: String,
    pub until: Option<String>,
    pub minutes_until: Option<i64>,
    pub continuous_class_count: usize,
    pub free_for_day_after: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct FreeStatus {
    pub is_busy: bool,
    pub from: NaiveTime,
    pub until: Option<NaiveTime>,
    pub is_lunch: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
struct ClassEvent {
    slot: CompactSlot,
    start: NaiveTime,
    end: NaiveTime,
}

#[derive(Debug, Clone, Copy)]
struct StatusOptions {
    show_gaps_as_free: bool,
}

#[derive(Debug)]
struct DaySchedule {
    events: Vec<ClassEvent>,
}

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

const LUNCH_START: &str = "13:20";
const LUNCH_END: &str = "14:00";

#[tauri::command]
pub fn build_bitmap(schedule: Vec<CompactSlot>, target_day: u8) -> Vec<bool> {
    let mut bitmap = vec![false; 12];
    for slot in schedule {
        if slot.d == target_day && (1..=12).contains(&slot.p) {
            bitmap[(slot.p - 1) as usize] = true;
        }
    }
    bitmap
}

#[tauri::command]
pub fn build_kindmap(schedule: Vec<CompactSlot>, target_day: u8) -> Vec<bool> {
    let mut kindmap = vec![false; 12];
    for slot in schedule {
        if slot.d == target_day && (1..=12).contains(&slot.p) {
            kindmap[(slot.p - 1) as usize] = slot.s.eq_ignore_ascii_case("l");
        }
    }
    kindmap
}

#[tauri::command]
pub fn currentbit(bitmap: [bool; 12], kindmap: [bool; 12]) -> Result<u8, String> {
    let current_time = Local::now().time();

    for i in 0..12 {
        let (start_str, end_str) = period_bounds(i + 1, kindmap[i]);
        let start = parse_time(start_str)?;
        let end = parse_time(end_str)?;

        if current_time >= start && current_time < end && bitmap[i] {
            return Ok((i + 1) as u8);
        }
    }

    if is_lunch_time(current_time) {
        return Ok(13);
    }

    Ok(0)
}

#[tauri::command]
pub fn timetable_status_now(
    schedule: Vec<CompactSlot>,
    show_gaps_as_free: Option<bool>,
) -> Result<TimetableStatus, String> {
    let now = Local::now();
    timetable_status(
        schedule,
        now.weekday().number_from_monday() as u8,
        now.time().format("%H:%M").to_string(),
        show_gaps_as_free,
    )
}

#[tauri::command]
pub fn timetable_status(
    schedule: Vec<CompactSlot>,
    day: u8,
    current_time: String,
    show_gaps_as_free: Option<bool>,
) -> Result<TimetableStatus, String> {
    let current_time = parse_time(&current_time)?;
    let options = StatusOptions {
        show_gaps_as_free: show_gaps_as_free.unwrap_or(false),
    };
    Ok(compute_timetable_status(
        &schedule,
        day,
        current_time,
        options,
    ))
}

#[tauri::command]
pub fn next_free_time_after(
    bitmap: [bool; 12],
    kindmap: [bool; 12],
    current_time: NaiveTime,
) -> String {
    let status = status_from_maps(bitmap, kindmap, current_time);
    if !status.is_busy {
        "YOU ARE FREE".to_string()
    } else {
        status
            .until
            .map(|time| time.format("%H:%M").to_string())
            .unwrap_or_else(|| "NO FREE TIME AVAILABLE".to_string())
    }
}

#[tauri::command]
pub fn get_free_status(
    bitmap: [bool; 12],
    kindmap: [bool; 12],
    current_time: NaiveTime,
) -> Option<FreeStatus> {
    Some(status_from_maps(bitmap, kindmap, current_time))
}

#[tauri::command]
pub fn new_get_free_status(
    bitmap: [bool; 12],
    kindmap: [bool; 12],
    current_time: NaiveTime,
) -> Option<FreeStatus> {
    get_free_status(bitmap, kindmap, current_time)
}

#[tauri::command]
pub fn currently_at(
    time: &str,
    time_table: Vec<CompactSlot>,
    day: u8,
    is_end_time: bool,
) -> Option<String> {
    let time = NaiveTime::parse_from_str(time, "%H:%M").ok()?;
    let schedule = DaySchedule::new(&time_table, day);

    if !is_end_time {
        return schedule
            .events
            .iter()
            .find(|event| time >= event.start && time < event.end)
            .map(|event| event.slot.f.clone());
    }

    schedule
        .next_index_at_or_after(time)
        .map(|index| schedule.events[index].slot.f.clone())
}

fn compute_timetable_status(
    raw_schedule: &[CompactSlot],
    day: u8,
    current_time: NaiveTime,
    options: StatusOptions,
) -> TimetableStatus {
    let schedule = DaySchedule::new(raw_schedule, day);

    if schedule.events.is_empty() {
        return TimetableStatus::free_day(current_time);
    }

    if let Some(current_index) = schedule.current_index(current_time) {
        return schedule.in_class_status(current_index, current_time, options);
    }

    if let Some((previous_index, next_index)) = schedule.transition_gap(current_time) {
        if options.show_gaps_as_free {
            return schedule.free_between_classes_status(previous_index, next_index, current_time);
        }
        return schedule.transition_status(previous_index, next_index, current_time);
    }

    if is_lunch_time(current_time) {
        return schedule.lunch_status(current_time);
    }

    schedule.free_status(current_time)
}

impl DaySchedule {
    fn new(raw_schedule: &[CompactSlot], day: u8) -> Self {
        let mut events: Vec<ClassEvent> = raw_schedule
            .iter()
            .filter(|slot| slot.d == day && (1..=12).contains(&slot.p))
            .filter_map(|slot| {
                let is_lab = slot.s.eq_ignore_ascii_case("l");
                let (start, end) = period_bounds(slot.p as usize, is_lab);
                Some(ClassEvent {
                    slot: slot.clone(),
                    start: parse_time(start).ok()?,
                    end: parse_time(end).ok()?,
                })
            })
            .collect();

        events.sort_by_key(|event| (event.start, event.end));
        Self { events }
    }

    fn current_index(&self, time: NaiveTime) -> Option<usize> {
        self.events
            .iter()
            .enumerate()
            .filter(|(_, event)| time >= event.start && time < event.end)
            .max_by_key(|(_, event)| event.end)
            .map(|(index, _)| index)
    }

    fn previous_index_at_or_before(&self, time: NaiveTime) -> Option<usize> {
        self.events
            .iter()
            .enumerate()
            .filter(|(_, event)| event.end <= time)
            .max_by_key(|(_, event)| event.end)
            .map(|(index, _)| index)
    }

    fn next_index_at_or_after(&self, time: NaiveTime) -> Option<usize> {
        self.events.iter().position(|event| event.start >= time)
    }

    fn transition_gap(&self, time: NaiveTime) -> Option<(usize, usize)> {
        self.events
            .windows(2)
            .enumerate()
            .find_map(|(index, pair)| {
                let previous = &pair[0];
                let next = &pair[1];
                let in_gap = time >= previous.end && time < next.start;
                (in_gap && is_transition_gap(previous, next)).then_some((index, index + 1))
            })
    }

    fn continuous_run_end_index(&self, start_index: usize) -> usize {
        let mut index = start_index;
        while let Some(next) = self.events.get(index + 1) {
            if !is_transition_gap(&self.events[index], next) {
                break;
            }
            index += 1;
        }
        index
    }

    fn in_class_status(
        &self,
        current_index: usize,
        current_time: NaiveTime,
        options: StatusOptions,
    ) -> TimetableStatus {
        let run_end_index = if options.show_gaps_as_free {
            current_index
        } else {
            self.continuous_run_end_index(current_index)
        };
        let current = &self.events[current_index];
        let run_end = &self.events[run_end_index];
        let next_index = self.next_index_at_or_after(run_end.end);
        let minutes = minutes_between(current_time, run_end.end);

        TimetableStatus {
            state: StatusState::InClass,
            is_busy: true,
            is_lunch: false,
            is_transition: false,
            current: Some(class_info(current)),
            current_run_end: Some(class_info(run_end)),
            next: next_index.map(|index| class_info(&self.events[index])),
            last_seen: self
                .previous_index_at_or_before(current_time)
                .map(|index| class_info(&self.events[index])),
            last_seen_at: self
                .previous_index_at_or_before(current_time)
                .map(|index| format_time(self.events[index].end)),
            from: format_time(current.start),
            until: Some(format_time(run_end.end)),
            minutes_until: Some(minutes),
            continuous_class_count: run_end_index - current_index + 1,
            free_for_day_after: next_index.is_none(),
        }
    }

    fn transition_status(
        &self,
        previous_index: usize,
        next_index: usize,
        current_time: NaiveTime,
    ) -> TimetableStatus {
        let previous = &self.events[previous_index];
        let next = &self.events[next_index];
        TimetableStatus {
            state: StatusState::InTransition,
            is_busy: true,
            is_lunch: false,
            is_transition: true,
            current: None,
            current_run_end: Some(class_info(previous)),
            next: Some(class_info(next)),
            last_seen: Some(class_info(previous)),
            last_seen_at: Some(format_time(previous.end)),
            from: format_time(previous.end),
            until: Some(format_time(next.start)),
            minutes_until: Some(minutes_between(current_time, next.start)),
            continuous_class_count: 0,
            free_for_day_after: false,
        }
    }

    fn free_between_classes_status(
        &self,
        previous_index: usize,
        next_index: usize,
        current_time: NaiveTime,
    ) -> TimetableStatus {
        let previous = &self.events[previous_index];
        let next = &self.events[next_index];
        TimetableStatus {
            state: StatusState::FreeBetweenClasses,
            is_busy: false,
            is_lunch: false,
            is_transition: false,
            current: None,
            current_run_end: None,
            next: Some(class_info(next)),
            last_seen: Some(class_info(previous)),
            last_seen_at: Some(format_time(previous.end)),
            from: format_time(current_time),
            until: Some(format_time(next.start)),
            minutes_until: Some(minutes_between(current_time, next.start)),
            continuous_class_count: 0,
            free_for_day_after: false,
        }
    }

    fn lunch_status(&self, current_time: NaiveTime) -> TimetableStatus {
        let next_index = self.next_index_at_or_after(current_time);
        let last_index = self.previous_index_at_or_before(current_time);
        TimetableStatus {
            state: StatusState::Lunch,
            is_busy: false,
            is_lunch: true,
            is_transition: false,
            current: None,
            current_run_end: None,
            next: next_index.map(|index| class_info(&self.events[index])),
            last_seen: last_index.map(|index| class_info(&self.events[index])),
            last_seen_at: last_index.map(|index| format_time(self.events[index].end)),
            from: format_time(current_time),
            until: next_index.map(|index| format_time(self.events[index].start)),
            minutes_until: next_index
                .map(|index| minutes_between(current_time, self.events[index].start)),
            continuous_class_count: 0,
            free_for_day_after: next_index.is_none(),
        }
    }

    fn free_status(&self, current_time: NaiveTime) -> TimetableStatus {
        let next_index = self.next_index_at_or_after(current_time);
        let last_index = self.previous_index_at_or_before(current_time);
        let state = match (last_index, next_index) {
            (None, Some(_)) => StatusState::FreeBeforeFirstClass,
            (Some(_), Some(_)) => StatusState::FreeBetweenClasses,
            (Some(_), None) => StatusState::DoneForDay,
            (None, None) => StatusState::FreeDay,
        };

        TimetableStatus {
            state,
            is_busy: false,
            is_lunch: false,
            is_transition: false,
            current: None,
            current_run_end: None,
            next: next_index.map(|index| class_info(&self.events[index])),
            last_seen: last_index.map(|index| class_info(&self.events[index])),
            last_seen_at: last_index.map(|index| format_time(self.events[index].end)),
            from: format_time(current_time),
            until: next_index.map(|index| format_time(self.events[index].start)),
            minutes_until: next_index
                .map(|index| minutes_between(current_time, self.events[index].start)),
            continuous_class_count: 0,
            free_for_day_after: next_index.is_none(),
        }
    }
}

impl TimetableStatus {
    fn free_day(current_time: NaiveTime) -> Self {
        Self {
            state: StatusState::FreeDay,
            is_busy: false,
            is_lunch: false,
            is_transition: false,
            current: None,
            current_run_end: None,
            next: None,
            last_seen: None,
            last_seen_at: None,
            from: format_time(current_time),
            until: None,
            minutes_until: None,
            continuous_class_count: 0,
            free_for_day_after: true,
        }
    }
}

fn status_from_maps(
    bitmap: [bool; 12],
    kindmap: [bool; 12],
    current_time: NaiveTime,
) -> FreeStatus {
    let lunch = lunch_interval();

    if is_lunch_time(current_time) {
        return FreeStatus {
            is_busy: false,
            from: current_time,
            until: Some(lunch.1),
            is_lunch: true,
        };
    }

    for i in 0..12 {
        let (start_str, end_str) = period_bounds(i + 1, kindmap[i]);
        let start = parse_time(start_str).expect("static period start parses");
        let end = parse_time(end_str).expect("static period end parses");

        if current_time >= start && current_time < end {
            return FreeStatus {
                is_busy: bitmap[i],
                from: if bitmap[i] { start } else { current_time },
                until: Some(end),
                is_lunch: false,
            };
        }
    }

    let next_free_period = (0..12).find_map(|i| {
        let (start_str, _) = period_bounds(i + 1, kindmap[i]);
        let start = parse_time(start_str).expect("static period start parses");
        (current_time < start && !bitmap[i]).then_some(start)
    });

    FreeStatus {
        is_busy: false,
        from: current_time,
        until: next_free_period,
        is_lunch: false,
    }
}

fn is_transition_gap(previous: &ClassEvent, next: &ClassEvent) -> bool {
    if next.start <= previous.end {
        return true;
    }

    let gap = minutes_between(previous.end, next.start);
    let threshold =
        if previous.slot.s.eq_ignore_ascii_case("l") || next.slot.s.eq_ignore_ascii_case("l") {
            10
        } else {
            5
        };

    gap <= threshold
}

fn class_info(event: &ClassEvent) -> ClassInfo {
    let (title, place) = split_class_text(&event.slot.f);
    ClassInfo {
        period: event.slot.p,
        slot_type: event.slot.s.clone(),
        raw: event.slot.f.clone(),
        title,
        place,
        start: format_time(event.start),
        end: format_time(event.end),
    }
}

fn split_class_text(raw: &str) -> (String, String) {
    let parts: Vec<&str> = raw
        .split('-')
        .map(str::trim)
        .filter(|part| !part.is_empty())
        .collect();

    match parts.as_slice() {
        [] => ("Class".to_string(), "Campus".to_string()),
        [single] => ((*single).to_string(), "Campus".to_string()),
        [title, place] => ((*title).to_string(), (*place).to_string()),
        [title, rest @ ..] => ((*title).to_string(), rest.join("-")),
    }
}

fn period_bounds(period: usize, is_lab: bool) -> (&'static str, &'static str) {
    if is_lab {
        LAB_PERIODS[period - 1]
    } else {
        THEORY_PERIODS[period - 1]
    }
}

fn parse_time(time: &str) -> Result<NaiveTime, String> {
    NaiveTime::parse_from_str(time, "%H:%M")
        .map_err(|error| format!("Invalid time '{}': {}", time, error))
}

fn lunch_interval() -> (NaiveTime, NaiveTime) {
    (
        parse_time(LUNCH_START).expect("static lunch start parses"),
        parse_time(LUNCH_END).expect("static lunch end parses"),
    )
}

fn is_lunch_time(time: NaiveTime) -> bool {
    let (start, end) = lunch_interval();
    time >= start && time < end
}

fn minutes_between(from: NaiveTime, to: NaiveTime) -> i64 {
    (to - from).num_minutes().max(0)
}

fn format_time(time: NaiveTime) -> String {
    time.format("%H:%M").to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn time(value: &str) -> NaiveTime {
        parse_time(value).unwrap()
    }

    fn slot(day: u8, slot_type: &str, period: u8, full_text: &str) -> CompactSlot {
        CompactSlot {
            d: day,
            s: slot_type.to_string(),
            p: period,
            f: full_text.to_string(),
        }
    }

    fn options(show_gaps_as_free: bool) -> StatusOptions {
        StatusOptions { show_gaps_as_free }
    }

    #[test]
    fn reports_busy_until_free_with_current_class_and_place() {
        let schedule = vec![
            slot(1, "t", 2, "MAT1001-AB1-301"),
            slot(1, "t", 5, "PHY1001-AB3-101"),
        ];

        let status = compute_timetable_status(&schedule, 1, time("09:10"), options(false));

        assert_eq!(status.state, StatusState::InClass);
        assert!(status.is_busy);
        assert_eq!(status.minutes_until, Some(35));
        assert_eq!(status.current.unwrap().place, "AB1-301");
        assert_eq!(status.current_run_end.unwrap().place, "AB1-301");
        assert!(!status.free_for_day_after);
    }

    #[test]
    fn before_8am_is_free_before_first_class() {
        let schedule = vec![slot(1, "t", 1, "MAT1001-AB1-301")];

        let status = compute_timetable_status(&schedule, 1, time("07:50"), options(false));

        assert_eq!(status.state, StatusState::FreeBeforeFirstClass);
        assert!(!status.is_busy);
        assert_eq!(status.minutes_until, Some(10));
        assert_eq!(status.next.unwrap().place, "AB1-301");
    }

    #[test]
    fn lunch_counts_as_free_time() {
        let schedule = vec![slot(1, "t", 7, "PHY1001-AB3-101")];

        let status = compute_timetable_status(&schedule, 1, time("13:25"), options(false));

        assert_eq!(status.state, StatusState::Lunch);
        assert!(!status.is_busy);
        assert!(status.is_lunch);
        assert_eq!(status.minutes_until, Some(35));
        assert_eq!(status.next.unwrap().place, "AB3-101");
    }

    #[test]
    fn theory_class_overrides_lunch_overlap_until_1325() {
        let schedule = vec![slot(1, "t", 6, "ENG1001-AB1-204")];

        let status = compute_timetable_status(&schedule, 1, time("13:22"), options(false));

        assert_eq!(status.state, StatusState::InClass);
        assert!(status.is_busy);
        assert!(!status.is_lunch);
        assert_eq!(status.minutes_until, Some(3));
        assert_eq!(status.until, Some("13:25".to_string()));
    }

    #[test]
    fn reports_rest_of_day_after_last_lab() {
        let schedule = vec![slot(1, "l", 6, "EEE1001-AB4-205")];

        let status = compute_timetable_status(&schedule, 1, time("19:30"), options(false));

        assert_eq!(status.state, StatusState::DoneForDay);
        assert!(!status.is_busy);
        assert_eq!(status.minutes_until, None);
        assert_eq!(status.last_seen.unwrap().place, "AB4-205");
        assert_eq!(status.last_seen_at, Some("13:20".to_string()));
        assert!(status.free_for_day_after);
    }

    #[test]
    fn hides_theory_transition_gaps_by_default() {
        let schedule = vec![
            slot(1, "t", 2, "MAT1001-AB1-301"),
            slot(1, "t", 3, "CSE2001-AB2-402"),
        ];

        let status = compute_timetable_status(&schedule, 1, time("09:47"), options(false));

        assert_eq!(status.state, StatusState::InTransition);
        assert!(status.is_busy);
        assert!(status.is_transition);
        assert_eq!(status.minutes_until, Some(3));
        assert_eq!(status.last_seen.unwrap().place, "AB1-301");
        assert_eq!(status.next.unwrap().place, "AB2-402");
    }

    #[test]
    fn can_show_theory_transition_gaps_as_free() {
        let schedule = vec![
            slot(1, "t", 2, "MAT1001-AB1-301"),
            slot(1, "t", 3, "CSE2001-AB2-402"),
        ];

        let status = compute_timetable_status(&schedule, 1, time("09:47"), options(true));

        assert_eq!(status.state, StatusState::FreeBetweenClasses);
        assert!(!status.is_busy);
        assert_eq!(status.minutes_until, Some(3));
        assert_eq!(status.last_seen.unwrap().place, "AB1-301");
    }

    #[test]
    fn hides_lab_ten_minute_transition_gaps_by_default() {
        let schedule = vec![
            slot(1, "l", 2, "CHY1001-SJT-601"),
            slot(1, "l", 3, "PHY1001-PRP-202"),
        ];

        let status = compute_timetable_status(&schedule, 1, time("09:45"), options(false));

        assert_eq!(status.state, StatusState::InTransition);
        assert!(status.is_busy);
        assert_eq!(status.minutes_until, Some(5));
        assert_eq!(status.last_seen.unwrap().place, "SJT-601");
        assert_eq!(status.next.unwrap().place, "PRP-202");
    }

    #[test]
    fn busy_class_runs_through_continuous_classes_when_gaps_are_hidden() {
        let schedule = vec![
            slot(1, "t", 2, "MAT1001-AB1-301"),
            slot(1, "t", 3, "CSE2001-AB2-402"),
        ];

        let status = compute_timetable_status(&schedule, 1, time("09:10"), options(false));

        assert_eq!(status.state, StatusState::InClass);
        assert!(status.is_busy);
        assert_eq!(status.minutes_until, Some(90));
        assert_eq!(status.until, Some("10:40".to_string()));
        assert_eq!(status.continuous_class_count, 2);
        assert_eq!(status.current.unwrap().place, "AB1-301");
        assert_eq!(status.current_run_end.unwrap().place, "AB2-402");
    }

    #[test]
    fn shows_gap_after_single_class_when_setting_is_enabled() {
        let schedule = vec![
            slot(1, "t", 2, "MAT1001-AB1-301"),
            slot(1, "t", 3, "CSE2001-AB2-402"),
        ];

        let status = compute_timetable_status(&schedule, 1, time("09:10"), options(true));

        assert_eq!(status.state, StatusState::InClass);
        assert!(status.is_busy);
        assert_eq!(status.minutes_until, Some(35));
        assert_eq!(status.until, Some("09:45".to_string()));
        assert_eq!(status.continuous_class_count, 1);
    }

    #[test]
    fn last_class_reports_free_for_day_after() {
        let schedule = vec![slot(1, "t", 12, "CSE3001-AB2-402")];

        let status = compute_timetable_status(&schedule, 1, time("19:00"), options(false));

        assert_eq!(status.state, StatusState::InClass);
        assert!(status.is_busy);
        assert_eq!(status.minutes_until, Some(25));
        assert!(status.free_for_day_after);
        assert!(status.next.is_none());
    }

    #[test]
    fn exact_next_class_boundary_is_busy() {
        let schedule = vec![slot(1, "t", 3, "CSE2001-AB2-402")];

        let status = compute_timetable_status(&schedule, 1, time("09:50"), options(false));

        assert_eq!(status.state, StatusState::InClass);
        assert!(status.is_busy);
        assert_eq!(status.current.unwrap().place, "AB2-402");
    }
}
