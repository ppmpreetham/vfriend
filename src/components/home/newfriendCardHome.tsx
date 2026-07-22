import { Dot } from "lucide-react";
import type { FriendCardProps } from "../../types/friendCard";
import {
  getStatusRoute,
  getStatusTimeRange,
  TimetableStatusText,
} from "../../utils/timetableDisplay";

const FriendCardHome = ({
  name,
  available,
  status,
  distance,
  timeFormat = 24,
}: FriendCardProps) => {
  const route = getStatusRoute(status);
  const timeRange = getStatusTimeRange(status, timeFormat);

  return (
    <div className="flex p-4 bg-background2 rounded-xl m-4 flex-row items-center justify-between text-foreground select-none">
      <div className="flex flex-col min-w-0 pr-3 gap-1">
        <div className="text-xl font-medium truncate">{name}</div>

        <div className="text-sm text-muted-foreground leading-snug">
          <TimetableStatusText status={status} timeFormat={timeFormat} />
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {route.from} -&gt; {route.to}
        </div>
        <div className="text-xs text-muted-foreground">
          {timeRange.from} -&gt; {timeRange.to}
        </div>

        {distance && (
          <div className="text-xs mt-1 text-muted-foreground">
            <Dot className="inline-block mx-1 align-middle" color="#ebff57" />
            <span className="align-middle">{distance}m</span>
          </div>
        )}
      </div>

      <div className="flex items-center ml-2 shrink-0">
        <span className="relative flex h-3 w-3">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              available ? "bg-primary" : "bg-red-400"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-3 w-3 ${
              available ? "bg-primary" : "bg-red-500"
            }`}
          />
        </span>
      </div>
    </div>
  );
};

export default FriendCardHome;