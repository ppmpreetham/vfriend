import { invoke } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";
import { getUserBitmap, getUserKindmap } from "../store/timeTableStore";

export interface NextFreeTimeParams {
  bitmap: boolean[];
  currentTime: string;
  kindmap: boolean[];
}

export function nextFreeTime(params: NextFreeTimeParams) {
  return useQuery({
    queryKey: ["nextFreeTime", params],
    queryFn: () =>
      {return invoke<string | null>("next_free_time_after", {
        bitmap: params.bitmap,
        currentTime: params.currentTime,
        kindmap: params.kindmap,
      })
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useUserDayBitmap(day: number) {
  return useQuery({
    queryKey: ["userBitmap", day],
    queryFn: async () => {
      return await getUserBitmap(day);
    },
  });
}

export function useUserDayKindmap(day: number) {
  return useQuery({
    queryKey: ["userKindmap", day],
    queryFn: async () => {
      return await getUserKindmap(day);
    },
  });
}
