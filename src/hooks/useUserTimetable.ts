import { useQuery } from "@tanstack/react-query";
import { getUserTimetable as fetchTimetable } from "../store/newtimeTableStore";

export function useUserTimetable() {
  return useQuery({
    queryKey: ["userTimetable"],
    queryFn: fetchTimetable,
    staleTime: 60_000,
    retry: false,
  });
}