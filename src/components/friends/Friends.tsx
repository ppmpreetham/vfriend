import FriendCardFriend from "./FriendCardFriend";
import { UserPlus, Search } from "lucide-react";

const Friends = () => {
  return (
    <div className="w-screen h-full">
      <div className="flex flex-row mx-4 gap-2">
        <div className="flex items-center justify-center gap-2 rounded-full bg-primary text-black w-1/2 p-2 cursor-pointer">
          Search Friends
          <div className="py-2 rounded-full cursor-pointer">
            <Search color="black" />
          </div>
        </div>
        <div className="flex  items-center justify-center gap-2 rounded-full bg-primary text-black w-1/2 p-2 cursor-pointer">
          Add Friends
          <div className="py-2 rounded-full cursor-pointer">
            <UserPlus color="black" />
          </div>
        </div>
      </div>
      <FriendCardFriend name="PPM" registrationNumber="23BRS1346" />
      <FriendCardFriend name="AYUSH" registrationNumber="22BRS1346" />
      <FriendCardFriend name="SIGMA" registrationNumber="21BRS1346" />
      <div></div>
    </div>
  );
};

export default Friends;
