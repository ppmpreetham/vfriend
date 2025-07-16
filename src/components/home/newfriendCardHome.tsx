import { Dot } from "lucide-react";
import type { FriendCardProps } from "../../types/friendCard";

const FriendCardHome = ({
  name,
  available,
  location,
  nextLocation,
  time,
  nextTime,
  distance,
}: FriendCardProps & { nextLocation: string; nextTime: string }) => {
  return (
    <div className="flex p-4 bg-background2 rounded-xl m-4 flex-row items-center justify-between text-foreground select-none">
      <div className="flex flex-col">
        <div className="text-xl font-medium">{name}</div>

        <div className="text-sm text-muted-foreground">
          {location || "—"} → {nextLocation || "—"}
        </div>
        <div className="text-sm text-muted-foreground">
          {time || "—"} → {nextTime || "—"}
        </div>

        {distance && (
          <div className="text-xs mt-1 text-muted-foreground">
            <Dot className="inline-block mx-1 align-middle" color="#ebff57" />
            <span className="align-middle">{distance}m</span>
          </div>
        )}
      </div>

      <div className="flex items-center ml-2">
        <span className="relative flex h-3 w-3">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              available ? "bg-primary" : "bg-red-400"
            }`}
          ></span>
          <span
            className={`relative inline-flex rounded-full h-3 w-3 ${
              available ? "bg-primary" : "bg-red-500"
            }`}
          ></span>
        </span>
      </div>
    </div>
  );
};

export default FriendCardHome;
