import { Settings } from "lucide-react";
import darkLogo from "../assets/dark_logo.svg";
import useNavStore from "../store/useNavStore";

const Header = () => {
  const { activeTab, setActiveTab } = useNavStore();

  return (
    <div className="flex items-center justify-between">
      <div
        onClick={() => setActiveTab("home")}
        className="flex items-center m-4 mb-3 cursor-pointer"
      >
        <img src={darkLogo} alt="Logo" className="h-10" />
        <div className="text-3xl text-primary transform -translate-x-1.5 translate-y-0.5">riend</div>
      </div>
      <div className="m-4 mb-3 items-center flex">
        <button
          onClick={() => setActiveTab("settings")}
          className={`p-2 rounded-full flex items-center justify-center cursor-pointer ${
            activeTab === "settings" ? "bg-primary bg-opacity-20" : ""
          }`}
          aria-label="Settings"
        >
          <Settings
            color={activeTab === "settings" ? "black" : "white"}
            size={24}
            className="pointer-events-none"
          />
        </button>
      </div>
    </div>
  );
};

export default Header;
