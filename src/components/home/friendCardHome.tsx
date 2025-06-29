import { Dot } from "lucide-react";
import type { FriendCardProps } from "../../types/friendCard";

const FriendCardHome = ({
  name,
  available,
  location,
  distance,
  time,
  
}: FriendCardProps) => {
  return (
    <div className="flex p-4 bg-gray-900 rounded-xl m-4 flex-row items-center justify-between text-white select-none">
      <div className="flex flex-col">
        <div className="text-xl">{name}</div>
        <div>
          {!available ? `Currently at ${location}` : `Last seen at ${location}`}
          {distance && (
            <>
              <Dot className="inline-block mx-1 align-middle" color="#ebff57" />
              <span className="align-middle">{`${distance}m`}</span>
            </>
          )}
        </div>
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
              available ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
        </span>
        <span className="ml-2">{time}</span>
      </div>
    </div>
  );
};

export default FriendCardHome;
