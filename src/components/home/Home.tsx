import FriendCardHome from "./newfriendCardHome";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getFreeTimeOfAllFriends } from "../../store/newtimeTableStore";
import type { FriendStatusData } from "../../store/newtimeTableStore";
import { useUserProfile } from "../../hooks/useUserProfile";
import { getTimetableStatusSearchText } from "../../utils/timetableDisplay";

const currentMinute = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

const Home = () => {
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [friends, setFriends] = useState<FriendStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const userProfile = useUserProfile();
  const timeFormat = userProfile.data?.timeFormat ?? 24;

  useEffect(() => {
    let isMounted = true;

    const loadFriends = async () => {
      try {
        const friendsData = await getFreeTimeOfAllFriends(currentMinute());
        if (isMounted) {
          setFriends(friendsData);
        }
      } catch (error) {
        console.error("Failed to load friends data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFriends();
    const interval = window.setInterval(loadFriends, 60_000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const filteredFriends = friends
    .filter((friend) => {
      if (showOnlyAvailable && !friend.available) {
        return false;
      }

      const searchLower = searchTerm.trim().toLowerCase();
      if (!searchLower) return true;

      return (
        friend.username.toLowerCase().includes(searchLower) ||
        getTimetableStatusSearchText(friend.status).includes(searchLower)
      );
    })
    .sort((a, b) => a.username.localeCompare(b.username));

  return (
    <div className="h-full w-full overflow-y-auto scrollbar-hide">
      <div className="p-4 pt-1 flex flex-col gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="search"
            className="block w-full p-2 ps-10 text-sm rounded-lg bg-background3 border border-gray-700 placeholder-gray-400 text-foreground focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search friends by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <label className="inline-flex items-center cursor-pointer">
            <span className="mr-3 text-sm font-medium text-foreground">
              Show Available Only
            </span>
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showOnlyAvailable}
                onChange={() => setShowOnlyAvailable(!showOnlyAvailable)}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500" />
            </div>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 my-8">Loading friends...</div>
      ) : filteredFriends.length > 0 ? (
        filteredFriends.map((friend) => (
          <FriendCardHome
            key={friend.username}
            name={friend.username}
            available={friend.available}
            status={friend.status}
            timeFormat={timeFormat}
          />
        ))
      ) : (
        <div className="text-center text-gray-400 my-8">
          {friends.length === 0
            ? "Add Friends to get Started"
            : "No friends match your search criteria"}
        </div>
      )}
    </div>
  );
};

export default Home;