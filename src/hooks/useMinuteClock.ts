import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

function currentMinuteStamp() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
}

function msUntilNextMinute() {
  const now = new Date();
  return 60_000 - (now.getSeconds() * 1_000 + now.getMilliseconds());
}

export function useMinuteClock() {
  const [minute, setMinute] = useState(currentMinuteStamp);

  useEffect(() => {
    let timeoutId: number | undefined;

    const scheduleNextTick = () => {
      timeoutId = window.setTimeout(() => {
        setMinute(currentMinuteStamp());
        scheduleNextTick();
      }, msUntilNextMinute() + 25);
    };

    scheduleNextTick();

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return minute;
}

export function useMinuteQueryInvalidation() {
  const minute = useMinuteClock();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["timetableStatus"] });
    queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    queryClient.invalidateQueries({ queryKey: ["userTimetable"] });
  }, [minute, queryClient]);
}