import { invoke } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";
import type { CompactSlot, CompactTimetable } from "../types/timeTable";

export interface ClassInfo {
  period: number;
  slot_type: string;
  raw: string;
  title: string;
  place: string;
  start: string;
  end: string;
}

export type TimetableStatusState =
  | "in_class"
  | "in_transition"
  | "free_before_first_class"
  | "free_between_classes"
  | "lunch"
  | "done_for_day"
  | "free_day";

export interface TimetableStatus {
  state: TimetableStatusState;
  is_busy: boolean;
  is_lunch: boolean;
  is_transition: boolean;
  current: ClassInfo | null;
  current_run_end: ClassInfo | null;
  next: ClassInfo | null;
  last_seen: ClassInfo | null;
  last_seen_at: string | null;
  from: string;
  until: string | null;
  minutes_until: number | null;
  continuous_class_count: number;
  free_for_day_after: boolean;
}

export interface TimetableStatusParams {
  schedule: CompactSlot[];
  currentTime?: string;
  day?: number;
  showGapsAsFree?: boolean;
}

export async function buildBitmap(
  schedule: CompactSlot[],
  targetDay: number
): Promise<boolean[]> {
  return invoke<boolean[]>("build_bitmap", {
    schedule,
    targetDay,
  });
}

export async function buildKindmap(
  schedule: CompactSlot[],
  targetDay: number
): Promise<boolean[]> {
  return invoke<boolean[]>("build_kindmap", {
    schedule,
    targetDay,
  });
}

export async function currentBit({
  bitmap,
  kindmap,
}: {
  bitmap: boolean[];
  kindmap: boolean[];
}): Promise<number> {
  return invoke<number>("currentbit", {
    bitmap,
    kindmap,
  });
}

export function getTimetableStatus(params: TimetableStatusParams) {
  const usesCurrentClock =
    params.currentTime === undefined || params.day === undefined;

  return useQuery({
    queryKey: ["timetableStatus", params],
    queryFn: () => {
      if (usesCurrentClock) {
        return invoke<TimetableStatus>("timetable_status_now", {
          schedule: params.schedule,
          showGapsAsFree: params.showGapsAsFree ?? false,
        });
      }

      return invoke<TimetableStatus>("timetable_status", {
        schedule: params.schedule,
        day: params.day,
        currentTime: params.currentTime,
        showGapsAsFree: params.showGapsAsFree ?? false,
      });
    },
    refetchOnWindowFocus: true,
  });
}

export async function getTimetableStatusDirect({
  schedule,
  currentTime,
  day,
  showGapsAsFree,
}: TimetableStatusParams): Promise<TimetableStatus> {
  if (currentTime === undefined || day === undefined) {
    return invoke<TimetableStatus>("timetable_status_now", {
      schedule,
      showGapsAsFree: showGapsAsFree ?? false,
    });
  }

  return invoke<TimetableStatus>("timetable_status", {
    schedule,
    day,
    currentTime,
    showGapsAsFree: showGapsAsFree ?? false,
  });
}

export async function parseHTMLTimetable(
  htmlContent: string
): Promise<CompactTimetable> {
  const jsonString = await invoke<string>("parse_html", { htmlContent });
  return JSON.parse(jsonString) as CompactTimetable;
}