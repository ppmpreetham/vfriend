import { invoke } from "@tauri-apps/api/core";
import type { CompactSlot } from "../types/timeTable";
import { useQuery } from "@tanstack/react-query";

import { CompactTimetable } from "../types/timeTable";
export interface NextFreeTimeParams {
  bitmap: boolean[];
  currentTime: string;
  kindmap: boolean[];
}
export interface FreeStatus {
  is_busy: boolean;
  from: string;
  until: string | null;
}

/**
 * Builds a bitmap representation of a schedule
 */
export async function buildBitmap(
  schedule: CompactSlot[],
  targetDay: number
): Promise<boolean[]> {
  return invoke<boolean[]>("build_bitmap", {
    schedule,
    targetDay,
  });
}

/**
 * Builds a kindmap representation of a schedule
 */
export async function buildKindmap(
  schedule: CompactSlot[],
  targetDay: number
): Promise<boolean[]> {
  return invoke<boolean[]>("build_kindmap", {
    schedule,
    targetDay,
  });
}

/**
 * Fetches the next free time after a given current time
 */
export function nextFreeTime(params: NextFreeTimeParams) {
  return useQuery({
    queryKey: ["nextFreeTime", params],
    queryFn: () => {
      return invoke<string | null>("next_free_time_after", {
        bitmap: params.bitmap,
        currentTime: params.currentTime,
        kindmap: params.kindmap,
      });
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetches the status of the user's schedule
 */
export function getFreeStatus(params: NextFreeTimeParams) {
  return useQuery({
    queryKey: ["nextFreeTime", params],
    queryFn: () => {
      return invoke<FreeStatus | null>("get_free_status", {
        bitmap: params.bitmap,
        currentTime: params.currentTime,
        kindmap: params.kindmap,
      });
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export async function parseHTMLTimetable(
  htmlContent: string
): Promise<CompactTimetable> {
  try {
    const jsonString = await invoke<string>("parseHTML", { htmlContent });
    const timetable = JSON.parse(jsonString) as CompactTimetable;
    console.log("Parsed timetable:", timetable);
    return timetable;
  } catch (error) {
    console.error("Error parsing HTML timetable:", error);
    throw error;
  }
}
