import { useState, useEffect } from "react";
import { getUserTimetable as fetchTimetable } from "../store/newtimeTableStore";
import type { CompactSlot } from "../types/timeTable";

export function useUserTimetable() {
  const [data, setData] = useState<CompactSlot[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadTimetable() {
      try {
        setIsLoading(true);
        setError(null);
        const timetableData = await fetchTimetable();
        setData(timetableData);
      } catch (err) {
        console.error("Error fetching timetable:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setData(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadTimetable();
  }, []);

  return { data, isLoading, error };
}
