import type { ReactNode } from "react";
import type { TimetableStatus } from "./invokeFunctions";

type TimeFormat = 12 | 24;

interface TimetableStatusTextProps {
  status: TimetableStatus | null | undefined;
  timeFormat?: TimeFormat;
  className?: string;
  highlightClassName?: string;
}

export function formatMinutes(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return "";
  if (minutes <= 0) return "now";
  return minutes === 1 ? "1 min" : `${minutes} mins`;
}

export function formatClockTime(
  time: string | null | undefined,
  timeFormat: TimeFormat = 24
): string {
  if (!time) return "";

  const [hourPart, minutePart] = time.split(":");
  const hour = Number(hourPart);
  if (!Number.isInteger(hour) || !minutePart) return time;

  const minute = minutePart.padStart(2, "0").slice(0, 2);
  if (timeFormat === 24) return `${hourPart.padStart(2, "0")}:${minute}`;

  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${suffix}`;
}

export function getStatusRoute(status: TimetableStatus): {
  from: string;
  to: string;
} {
  const from =
    status.current?.place ??
    status.last_seen?.place ??
    (status.is_lunch ? "Lunch" : "Free");

  const to = status.next?.place ?? (status.free_for_day_after ? "Free all day" : "Free");

  return { from, to };
}

export function getStatusTimeRange(
  status: TimetableStatus,
  timeFormat: TimeFormat = 24
): { from: string; to: string } {
  const from =
    status.state === "free_between_classes" || status.state === "done_for_day"
      ? status.last_seen_at ?? status.from
      : status.from;
  const to = status.next?.start ?? status.until;

  return {
    from: formatClockTime(from, timeFormat) || "Now",
    to: formatClockTime(to, timeFormat) || "Rest of day",
  };
}

export function getTimetableStatusSearchText(status: TimetableStatus): string {
  return [
    status.state,
    status.current?.title,
    status.current?.place,
    status.current_run_end?.title,
    status.current_run_end?.place,
    status.next?.title,
    status.next?.place,
    status.last_seen?.title,
    status.last_seen?.place,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function TimetableStatusText({
  status,
  timeFormat = 24,
  className = "",
  highlightClassName = "font-semibold",
}: TimetableStatusTextProps) {
  if (!status) {
    return <span className={className}>Free for the entire day</span>;
  }

  const strong = (value: ReactNode) => (
    <strong className={highlightClassName}>{value}</strong>
  );
  const minutes = strong(formatMinutes(status.minutes_until));
  const lastSeen = status.last_seen ? (
    <>
      Last seen at {strong(status.last_seen.place)}
      {status.last_seen_at ? (
        <> at {strong(formatClockTime(status.last_seen_at, timeFormat))}</>
      ) : null}
      .
    </>
  ) : null;

  let content: ReactNode;

  switch (status.state) {
    case "in_class": {
      const currentPlace = strong(status.current?.place ?? "class");
      const runEndPlace = status.current_run_end?.place;

      if (status.free_for_day_after) {
        content = (
          <>
            Free for the entire day in {minutes}, currently in {currentPlace}.
          </>
        );
      } else if (
        status.continuous_class_count > 1 &&
        runEndPlace &&
        runEndPlace !== status.current?.place
      ) {
        content = (
          <>
            Free from classes in {minutes}, currently in {currentPlace}; last
            class ends at {strong(runEndPlace)}.
          </>
        );
      } else {
        content = (
          <>
            Free from {currentPlace} in {minutes}.
          </>
        );
      }
      break;
    }

    case "in_transition":
      content = (
        <>
          Class at {strong(status.next?.place ?? "class")} in {minutes}. {lastSeen}
        </>
      );
      break;

    case "free_before_first_class":
      content = (
        <>
          Currently free. Class at {strong(status.next?.place ?? "class")} in {minutes}.
        </>
      );
      break;

    case "free_between_classes":
      content = (
        <>
          Currently free. {lastSeen} Class at {strong(status.next?.place ?? "class")} in {minutes}.
        </>
      );
      break;

    case "lunch":
      content = status.next ? (
        <>
          Lunch break. Class at {strong(status.next.place)} in {minutes}. {lastSeen}
        </>
      ) : (
        <>
          Lunch break, then free for the day. {lastSeen}
        </>
      );
      break;

    case "done_for_day":
      content = (
        <>
          Free for the rest of today. {lastSeen}
        </>
      );
      break;

    case "free_day":
      content = <>Free for the entire day.</>;
      break;

    default:
      content = <>Status unavailable.</>;
  }

  return <span className={className}>{content}</span>;
}