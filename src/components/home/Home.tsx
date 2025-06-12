import FriendCard from "./friendCard";
import { useState } from "react";
import { Search } from "lucide-react";

const Home = () => {
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // sample data
  const friends = [
    {
      available: true,
      name: "Preetham",
      location: "AB1-209",
      time: "11:30PM",
    },
    {
      available: false,
      name: "Sreeyansh",
      location: "AB3-110",
      distance: "30",
      time: "12:30 PM",
    },
    {
      available: false,
      name: "Raghav",
      location: "AB3-110",
      time: "12:30 PM",
    },
    {
      available: true,
      name: "Danny",
      location: "AB2-109",
      time: "11:30PM",
    },
    {
      available: false,
      name: "Ayush",
      location: "AB4-110",
      distance: "30",
      time: "12:30 PM",
    },
    {
      available: false,
      name: "Takuli",
      location: "AB3-110",
      time: "12:30 PM",
    },
    {
      available: true,
      name: "Preetham",
      location: "AB1-209",
      time: "11:30PM",
    },
    {
      available: false,
      name: "Sreeyansh",
      location: "AB3-110",
      distance: "30",
      time: "12:30 PM",
    },
    {
      available: false,
      name: "Raghav",
      location: "AB3-110",
      time: "12:30 PM",
    },
    {
      available: true,
      name: "Preetham",
      location: "AB1-209",
      time: "11:30PM",
    },
    {
      available: false,
      name: "Sreeyansh",
      location: "AB3-110",
      distance: "30",
      time: "12:30 PM",
    },
    {
      available: false,
      name: "Raghav",
      location: "AB3-110",
      time: "12:30 PM",
    },
  ];

  const filteredFriends = friends
    .filter((friend) => {
      if (showOnlyAvailable && !friend.available) {
        return false;
      }

      if (searchTerm.trim() !== "") {
        const searchLower = searchTerm.toLowerCase();
        return (
          friend.name.toLowerCase().includes(searchLower) ||
          friend.location.toLowerCase().includes(searchLower)
        );
      }

      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

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

      {filteredFriends.length > 0 ? (
        filteredFriends.map((friend, index) => (
          <FriendCard
            key={index}
            available={friend.available}
            name={friend.name}
            location={friend.location}
            distance={friend.distance}
            time={friend.time}
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
