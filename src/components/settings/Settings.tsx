import useNavStore from "../../store/useNavStore";
import { Star } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useUserProfile } from "../../hooks/useUserProfile";
import { userStore } from "../../store/newtimeTableStore";
import { useState, useEffect } from "react";

const Settings = () => {
  const { activeTab } = useNavStore();
  const currentUserData = useUserProfile();
  const [themeUpdated, setThemeUpdated] = useState(false);
  const [timeFormatUpdated, setTimeFormatUpdated] = useState(false);
  const [userData, setUserData] = useState(currentUserData.data);
  
  useEffect(() => {
    setUserData(currentUserData.data);
    
    // Turn off welcome flag after first visit to settings
    if (currentUserData.data?.welcome) {
      disableWelcomeFlag();
    }
  }, [currentUserData.data]);

  // Function to disable welcome flag
  const disableWelcomeFlag = async () => {
    try {
      if (!currentUserData.data) return;
      
      await userStore.set("userData", {
        ...currentUserData.data,
        welcome: false
      });
      await userStore.save();
      
      setUserData({
        ...currentUserData.data,
        welcome: false
      });
    } catch (error) {
      console.error("Failed to update welcome flag:", error);
    }
  };

  if (activeTab !== "settings") return null;

  const toggleTheme = async () => {
    try {
      if (!currentUserData.data) return;
      
      // Toggle theme between Dark and Light
      const newTheme = currentUserData.data.theme === "Dark" ? "Light" : "Dark";
      
      await userStore.set("userData", {
        ...currentUserData.data,
        theme: newTheme
      });
      await userStore.save();
      
      // Update local state to force re-render
      setUserData({
        ...currentUserData.data,
        theme: newTheme
      });
      
      // Show feedback and reset after 2 seconds
      setThemeUpdated(true);
      setTimeout(() => setThemeUpdated(false), 2000);
    } catch (error) {
      console.error("Failed to update theme:", error);
    }
  };

  const toggleTimeFormat = async () => {
    try {
      if (!currentUserData.data) return;

      // Toggle time format between 12 and 24
      const newTimeFormat = currentUserData.data.timeFormat === 12 ? 24 : 12;
      
      await userStore.set("userData", {
        ...currentUserData.data,
        timeFormat: newTimeFormat
      });
      await userStore.save();
      
      // Update local state to force re-render
      setUserData({
        ...currentUserData.data,
        timeFormat: newTimeFormat
      });
      
      // Show feedback and reset after 2 seconds
      setTimeFormatUpdated(true);
      setTimeout(() => setTimeFormatUpdated(false), 2000);
    } catch (error) {
      console.error("Failed to update time format:", error);
    }
  };

  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-4 ">Settings</h2>

      <div className="space-y-2 uppercase text-xl">
        <button 
          className={`w-full text-left p-4 ${themeUpdated ? 'bg-primary text-black' : 'bg-gray-800 hover:bg-gray-700'} rounded-md cursor-pointer flex justify-between items-center`}
          onClick={toggleTheme}
        >
          <span>Theme</span> 
          <span>{userData?.theme || 'Dark'}</span>
        </button>
        
        <button 
          className={`w-full text-left p-4 ${timeFormatUpdated ? 'bg-primary text-black' : 'bg-gray-800 hover:bg-gray-700'} rounded-md cursor-pointer flex justify-between items-center`}
          onClick={toggleTimeFormat}
        >
          <span>Time Format</span>
          <span>{userData?.timeFormat || 12} Hour</span>
        </button>
        
        <button
          className="flex flex-row items-center w-full text-left p-4 bg-primary text-black rounded-md cursor-pointer"
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