import { LucideRefreshCw } from "lucide-react";
import type { FriendPageFriend } from "../../types/friendCard";
import { useFriendStore } from "../../store/friendStore";

const FriendCardFriend = ({ name, registrationNumber }: FriendPageFriend) => {
  const selectFriend = useFriendStore((state) => state.selectFriend);

  const handleClick = () => {
    selectFriend(registrationNumber);
  };

  return (
    <div
      className="flex flex-row p-6 m-4 justify-between items-center bg-background2 rounded-xl cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex flex-col">
        <div className="font-bold text-primary text-xl">{name}</div>
        <div>{registrationNumber}</div>
      </div>
      <div
        className="cursor-pointer rounded-full bg-primary p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <LucideRefreshCw color="#000" />
      </div>
    </div>
  );
};

export default FriendCardFriend;
