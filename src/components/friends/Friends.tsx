import { useState } from "react";
import FriendCardFriend from "./FriendCardFriend";
import { UserPlus, Search, ChevronLeft } from "lucide-react";

const Friends = () => {
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSearchMode = () => {
    setIsSearchMode(!isSearchMode);
    if (isSearchMode) {
      setSearchQuery(""); // everytime clear the search query
    }
  };

  return (
    <div className="w-screen h-full">
      <div className="flex flex-row mx-4 gap-2 mb-4">
        {!isSearchMode ? (
          <>
            <div
              className="flex items-center justify-center gap-2 rounded-full bg-primary text-black w-1/2 p-2 cursor-pointer"
              onClick={toggleSearchMode}
            >
              Search Friends
              <div className="py-2 rounded-full cursor-pointer">
                <Search color="black" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-full bg-primary text-black w-1/2 p-2 cursor-pointer">
              Add Friends
              <div className="py-2 rounded-full cursor-pointer">
                <UserPlus color="black" />
              </div>
            </div>
          </>
        ) : (
          // Search mode with full-width search input
          <div className="flex items-center justify-between rounded-full bg-primary text-black w-full p-2">
            <div className="p-2 cursor-pointer" onClick={toggleSearchMode}>
              <ChevronLeft color="black" />
            </div>
            <input
              type="text"
              placeholder="Search friends..."
              className="bg-transparent outline-none flex-grow px-2 text-black placeholder:text-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <div className="p-2">
              <Search color="black" />
            </div>
          </div>
        )}
      </div>
      <FriendCardFriend name="PPM" registrationNumber="23BRS1346" />
      <FriendCardFriend name="AYUSH" registrationNumber="22BRS1346" />
      <FriendCardFriend name="SIGMA" registrationNumber="21BRS1346" />
      <div></div>
    </div>
  );
};

export default Friends;
