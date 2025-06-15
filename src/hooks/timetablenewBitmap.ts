import { invoke } from "@tauri-apps/api/core";
import { useQuery } from "@tanstack/react-query";

export interface NextFreeTimeParams {
  bitmap: boolean[];
  currentTime: string;
  kindmap: boolean[];
}

export function nextFreeTime(params: NextFreeTimeParams) {
  return useQuery({
    queryKey: ["nextFreeTime", params],
    queryFn: () =>
      invoke<string | null>("next_free_time_after", {
        bitmap: params.bitmap,
        currentTime: params.currentTime,
        kindmap: params.kindmap,
      }),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}
