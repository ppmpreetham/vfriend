import { LucideRefreshCw } from "lucide-react";
import type { FriendPageFriend } from "../../types/friendCard";

const FriendCardFriend = ({ name, registrationNumber }: FriendPageFriend) => {
  return (
    <div className="flex flex-row p-6 m-4 justify-between items-center bg-gray-900 rounded-xl">
      <div className="flex flex-col">
        <div className="font-bold text-primary text-xl">{name}</div>
        <div>{registrationNumber}</div>
      </div>
      <div className="cursor-pointer rounded-full bg-primary p-2">
        <LucideRefreshCw color="#000" />
      </div>
    </div>
  );
};

export default FriendCardFriend;
