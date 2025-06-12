import { Calendar, User, Users, Home } from "lucide-react";
import useNavStore from "../store/useNavStore";

const Footer = () => {
  const { activeTab, setActiveTab } = useNavStore();

  return (
    <div className="flex p-6 justify-between items-center">
      <div className="flex-1 flex justify-center">
        <button
          onClick={() => setActiveTab("home")}
          className={`p-2 rounded-full w-14 h-14 flex items-center justify-center ${
            activeTab === "home" ? "bg-primary bg-opacity-20" : ""
          }`}
        >
          <Home color={activeTab === "home" ? "black" : "white"} />
        </button>
      </div>

      <div className="flex-1 flex justify-center">
        <button
          onClick={() => setActiveTab("calendar")}
          className={`p-2 rounded-full w-14 h-14 flex items-center justify-center ${
            activeTab === "calendar" ? "bg-primary bg-opacity-20" : ""
          }`}
        >
          <Calendar color={activeTab === "calendar" ? "black" : "white"} />
        </button>
      </div>

      <div className="flex-1 flex justify-center">
        <button
          onClick={() => setActiveTab("friends")}
          className={`p-2 rounded-full w-14 h-14 flex items-center justify-center ${
            activeTab === "friends" ? "bg-primary bg-opacity-20" : ""
          }`}
        >
          <Users color={activeTab === "friends" ? "black" : "white"} />
        </button>
      </div>

      <div className="flex-1 flex justify-center">
        <button
          onClick={() => setActiveTab("profile")}
          className={`p-2 rounded-full w-14 h-14 flex items-center justify-center ${
            activeTab === "profile" ? "bg-primary bg-opacity-20" : ""
          }`}
        >
          <User color={activeTab === "profile" ? "black" : "white"} />
        </button>
      </div>
    </div>
  );
};

export default Footer;
