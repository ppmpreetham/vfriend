import { Calendar, User, Users, Home } from "lucide-react";
import useNavStore from "../store/useNavStore";

const Footer = () => {
  const { activeTab, setActiveTab } = useNavStore();

  return (
    <div className="flex px-6 py-4 justify-between items-center">
      <div
        onClick={() => setActiveTab("home")}
        className="flex-1 flex justify-center my-2"
      >
        <button
          className={`p-2 rounded-full w-14 h-14 flex items-center justify-center cursor-pointer ${
            activeTab === "home"
              ? "bg-primary bg-opacity-20"
              : "hover:bg-gray-700"
          }`}
          aria-label="Home"
        >
          <Home
            color={activeTab === "home" ? "black" : "white"}
            className="pointer-events-none"
          />
        </button>
      </div>

      <div
        onClick={() => setActiveTab("calendar")}
        className="flex-1 flex justify-center my-2"
      >
        <button
          className={`p-2 rounded-full w-14 h-14 flex items-center justify-center cursor-pointer ${
            activeTab === "calendar"
              ? "bg-primary bg-opacity-20"
              : "hover:bg-gray-700"
          }`}
          aria-label="Calendar"
        >
          <Calendar
            color={activeTab === "calendar" ? "black" : "white"}
            className="pointer-events-none"
          />
        </button>
      </div>

      <div
        onClick={() => setActiveTab("friends")}
        className="flex-1 flex justify-center my-2"
      >
        <button
          className={`p-2 rounded-full w-14 h-14 flex items-center justify-center cursor-pointer ${
            activeTab === "friends"
              ? "bg-primary bg-opacity-20"
              : "hover:bg-gray-700"
          }`}
          aria-label="Friends"
        >
          <Users
            color={activeTab === "friends" ? "black" : "white"}
            className="pointer-events-none"
          />
        </button>
      </div>

      <div
        onClick={() => setActiveTab("profile")}
        className="flex-1 flex justify-center my-2"
      >
        <button
          className={`p-2 rounded-full w-14 h-14 flex items-center justify-center cursor-pointer ${
            activeTab === "profile"
              ? "bg-primary bg-opacity-20"
              : "hover:bg-gray-700"
          }`}
          aria-label="Profile"
        >
          <User
            color={activeTab === "profile" ? "black" : "white"}
            className="pointer-events-none"
          />
        </button>
      </div>
    </div>
  );
};

export default Footer;
