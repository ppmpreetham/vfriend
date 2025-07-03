import FriendCardHome from "./friendCardHome";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { getFreeTimeOfAllFriends } from "../../store/newtimeTableStore";
import type { FriendStatusData } from "../../store/newtimeTableStore";

const Home = () => {
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [friends, setFriends] = useState<FriendStatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const now = new Date();
        const formattedTime = `${now.getHours()
          .toString()
          .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
        
        console.log("Current formatted time:", formattedTime);
        const friendsData = await getFreeTimeOfAllFriends(formattedTime);
        console.log("Friends data returned:", friendsData);
        setFriends(friendsData);
      } catch (error) {
        console.error("Failed to load friends data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, []);

  const filteredFriends = friends
    .filter((friend) => {
      if (showOnlyAvailable && !friend.available) {
        return false;
      }

      if (searchTerm.trim() !== "") {
        const searchLower = searchTerm.toLowerCase();
        return (
          friend.username.toLowerCase().includes(searchLower) ||
          friend.location.toLowerCase().includes(searchLower)
        );
      }

      return true;
    })
    .sort((a, b) => a.username.localeCompare(b.username));

  return (
    <div className="h-full w-full overflow-y-auto scrollbar-hide">
      <div className="p-4 flex flex-col gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="search"
            className="block w-full p-2 ps-10 text-sm rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search friends by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <label className="inline-flex items-center cursor-pointer">
            <span className="mr-3 text-sm font-medium text-white">
              Show Available Only
            </span>
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showOnlyAvailable}
                onChange={() => setShowOnlyAvailable(!showOnlyAvailable)}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </div>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 my-8">Loading friends...</div>
      ) : filteredFriends.length > 0 ? (
        filteredFriends.map((friend, index) => (
          <FriendCardHome
            key={index}
            name={friend.username}
            available={friend.available}
            location={friend.location}
            time={friend.time}
            until={friend.until}
          />
        ))
      ) : (
        <div className="text-center text-gray-400 my-8">
          No friends match your search criteria
        </div>
      )}
    </div>
  );
};

export default Home;
