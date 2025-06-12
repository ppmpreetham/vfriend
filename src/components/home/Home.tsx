import FriendCard from "./friendCard";
import { useState } from "react";

const Home = () => {
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

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

  const filteredFriends = showOnlyAvailable
    ? friends
        .filter((friend) => friend.available)
        .sort((a, b) => a.name.localeCompare(b.name))
    : friends.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="h-full w-full overflow-y-auto scrollbar-hide">
      <div className="flex justify-end p-4">
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

      {filteredFriends.map((friend, index) => (
        <FriendCard
          key={index}
          available={friend.available}
          name={friend.name}
          location={friend.location}
          distance={friend.distance}
          time={friend.time}
        />
      ))}
    </div>
  );
};

export default Home;
