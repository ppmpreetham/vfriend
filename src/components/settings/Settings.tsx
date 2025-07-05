import useNavStore from "../../store/useNavStore";
import { Star } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";

const Settings = () => {
  const { activeTab } = useNavStore();

  if (activeTab !== "settings") return null;

  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-4 ">Settings</h2>

      <div className="space-y-2 uppercase text-xl">
        <button className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-md cursor-pointer">
          Theme
        </button>
        <button className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-md cursor-pointer">
          Time Format
        </button>
        <button
          className=" flex flex-row items-center w-full text-left p-4 bg-primary text-black rounded-md cursor-pointer"
          onClick={async (_) => {
            await openUrl("https://github.com/ppmpreetham/vfriend");
          }}
        >
          <Star className="w-6 h-6 me-2" />
          <div>STAR US ON GITHUB</div>
        </button>
      </div>
    </div>
  );
};

export default Settings;
