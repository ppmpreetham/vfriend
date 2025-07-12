import useNavStore from "../../store/useNavStore";
import { Star } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";
// import { useUserProfile } from "../../hooks/useUserProfile";
// import { userStore } from "../../store/newtimeTableStore";
import { useState, useEffect } from "react";
import { resetAllStores, viewAllStores } from "../../store/newtimeTableStore";

const Settings = () => {
  const { activeTab } = useNavStore();
  const [currentTheme, setCurrentTheme] = useState("dark");
  const [timeFormat, setTimeFormat] = useState(12);

  useEffect(() => {
    const localStorageTheme = localStorage.getItem("theme");
    const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark)");

    const initialTheme = calculateThemeSetting(
      localStorageTheme,
      systemSettingDark
    );
    setCurrentTheme(initialTheme);

    updateThemeOnDocument(initialTheme);

    const savedTimeFormat = localStorage.getItem("timeFormat");
    if (savedTimeFormat) {
      setTimeFormat(parseInt(savedTimeFormat));
    }
  }, []);

  if (activeTab !== "settings") return null;

  const calculateThemeSetting = (
    localStorageTheme: string | null,
    systemSettingDark: MediaQueryList
  ) => {
    if (localStorageTheme !== null) {
      return localStorageTheme;
    }

    if (systemSettingDark.matches) {
      return "dark";
    }

    return "light";
  };

  const updateThemeOnDocument = (theme: string) => {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.setAttribute("data-theme", theme);
  };

  const toggleTheme = async () => {
    try {
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", newTheme);
      updateThemeOnDocument(newTheme);
      setCurrentTheme(newTheme);
    } catch (error) {
      console.error("Failed to update theme:", error);
    }
  };

  const toggleTimeFormat = async () => {
    try {
      const newTimeFormat = timeFormat === 12 ? 24 : 12;

      localStorage.setItem("timeFormat", newTimeFormat.toString());

      setTimeFormat(newTimeFormat);
    } catch (error) {
      console.error("Failed to update time format:", error);
    }
  };

  return (
    <div className="p-4 text-foreground">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>

      <div className="space-y-2 space-block-2 uppercase text-xl">
        <button
          data-theme-toggle
          className={`w-full text-start p-4 bg-background3 hover:bg-gray-700 rounded-md cursor-pointer flex justify-between items-center`}
          onClick={toggleTheme}
        >
          <span>Theme</span>
          <span>
            {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}
          </span>
        </button>

        <button
          className={`w-full text-start p-4 bg-background3 hover:bg-gray-700 rounded-md cursor-pointer flex justify-between items-center`}
          onClick={toggleTimeFormat}
        >
          <span>Time Format</span>
          <span>{timeFormat} Hour</span>
        </button>

        <button
          className="flex flex-row items-center w-full text-start p-4 bg-primary text-black rounded-md cursor-pointer"
          onClick={async (_) => {
            await openUrl("https://github.com/ppmpreetham/vfriend");
          }}
        >
          <Star className="w-6 h-6 mr-2" />
          <div>STAR US ON GITHUB</div>
        </button>
        <div className="flex gap-4 mx-4">
          <div
            className="bg-red-500 text-black p-3 rounded-xl text-2xl cursor-pointer flex-1 text-center"
            onClick={() => {
              resetAllStores();
            }}
          >
            Reset everything
          </div>
          <div
            className="bg-green-500 text-black p-3 rounded-xl text-2xl cursor-pointer flex-1 text-center"
            onClick={() => {
              viewAllStores();
            }}
          >
            VIEW STORES
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
