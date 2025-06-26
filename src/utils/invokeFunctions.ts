import { invoke } from "@tauri-apps/api/core";
import type { CompactSlot } from "../types/timeTable";
import { useQuery } from "@tanstack/react-query";

export interface NextFreeTimeParams {
  bitmap: boolean[];
  currentTime: string;
  kindmap: boolean[];
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

export interface FreeStatus {
  is_busy: boolean;
  from: string;
  until: string | null;
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
