import useNavStore from "../../store/useNavStore";
import { Star } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useState, useEffect } from "react";
import {
  getCurrentUserProfile,
  resetAllStores,
  updateUserPreferences,
  viewAllStores,
  updateCurrentUserTimetable,
} from "../../store/newtimeTableStore";
import { useQueryClient } from "@tanstack/react-query";
import { ReadHTMLFile } from "../../utils/inputHelper";
import { parseHTMLTimetable } from "../../utils/invokeFunctions";

const isDevelopment = import.meta.env.DEV;

const Settings = () => {
  const { activeTab } = useNavStore();
  const [currentTheme, setCurrentTheme] = useState("dark");
  const [timeFormat, setTimeFormat] = useState<12 | 24>(12);
  const [showGapsAsFree, setShowGapsAsFree] = useState(false);
  const queryClient = useQueryClient();
  const [updatingTimetable, setUpdatingTimetable] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const localStorageTheme = localStorage.getItem("theme");
      const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark)");
      const userProfile = await getCurrentUserProfile();

      const initialTheme = calculateThemeSetting(
        localStorageTheme || userProfile?.theme || null,
        systemSettingDark
      );
      setCurrentTheme(initialTheme);
      updateThemeOnDocument(initialTheme);

      const savedTimeFormat = localStorage.getItem("timeFormat");
      const initialTimeFormat =
        savedTimeFormat === "24" || savedTimeFormat === "12"
          ? (parseInt(savedTimeFormat, 10) as 12 | 24)
          : userProfile?.timeFormat || 12;
      setTimeFormat(initialTimeFormat);

      const savedGapSetting = localStorage.getItem("showGapsAsFree");
      const initialGapSetting =
        savedGapSetting === null
          ? userProfile?.showGapsAsFree ?? false
          : savedGapSetting === "true";
      setShowGapsAsFree(initialGapSetting);
    }

    loadSettings();
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
      await updateUserPreferences({ theme: newTheme as "dark" | "light" });
    } catch (error) {
      console.error("Failed to update theme:", error);
    }
  };

  const toggleTimeFormat = async () => {
    try {
      const newTimeFormat = timeFormat === 12 ? 24 : 12;
      localStorage.setItem("timeFormat", newTimeFormat.toString());
      setTimeFormat(newTimeFormat);
      await updateUserPreferences({ timeFormat: newTimeFormat });
    } catch (error) {
      console.error("Failed to update time format:", error);
    }
  };

  const toggleGapDisplay = async () => {
    try {
      const nextValue = !showGapsAsFree;
      localStorage.setItem("showGapsAsFree", String(nextValue));
      setShowGapsAsFree(nextValue);
      await updateUserPreferences({ showGapsAsFree: nextValue });
    } catch (error) {
      console.error("Failed to update class gap setting:", error);
    }
  };

  const handleUpdateTimetable = async () => {
    if (updatingTimetable) return;

    setUpdatingTimetable(true);
    setUpdateMessage(null);
    setUpdateError(null);

    try {
      const content = await ReadHTMLFile();
      if (!content) {
        setUpdateMessage("No file selected.");
        return;
      }

      const timetable = await parseHTMLTimetable(content);
      const updated = await updateCurrentUserTimetable(timetable);

      if (!updated) {
        throw new Error("Could not update the saved timetable.");
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
        queryClient.invalidateQueries({ queryKey: ["userTimetable"] }),
        queryClient.invalidateQueries({ queryKey: ["shareUserProfile"] }),
        queryClient.invalidateQueries({ queryKey: ["timetableStatus"] }),
      ]);
      setUpdateMessage("Timetable updated.");
    } catch (error) {
      console.error("Failed to update timetable:", error);
      setUpdateError(
        error instanceof Error ? error.message : "Failed to update timetable."
      );
    } finally {
      setUpdatingTimetable(false);
    }
  };

  return (
    <div className="p-4 text-foreground">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>

      <div className="space-y-2 space-block-2 uppercase text-xl">
        <button
          data-theme-toggle
          className="w-full text-start p-4 bg-background3 hover:bg-gray-700 rounded-md cursor-pointer flex justify-between items-center"
          onClick={toggleTheme}
        >
          <span>Theme</span>
          <span>
            {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}
          </span>
        </button>

        <button
          className="w-full text-start p-4 bg-background3 hover:bg-gray-700 rounded-md cursor-pointer flex justify-between items-center"
          onClick={toggleTimeFormat}
        >
          <span>Time Format</span>
          <span>{timeFormat} Hour</span>
        </button>

        <button
          className="w-full text-start p-4 bg-background3 hover:bg-gray-700 rounded-md cursor-pointer flex justify-between items-center"
          onClick={toggleGapDisplay}
        >
          <span>Class Gaps</span>
          <span>{showGapsAsFree ? "Shown" : "Hidden"}</span>
        </button>

        <button
          className="flex flex-row items-center w-full text-start p-4 bg-primary text-black rounded-md cursor-pointer"
          onClick={async () => {
            await openUrl("https://github.com/ppmpreetham/vfriend");
          }}
        >
          <Star className="w-6 h-6 mr-2" />
          <div>STAR US ON GITHUB</div>
        </button>

        <div className="flex flex-col gap-2 mt-4">
          <button
            className="w-full bg-background3 text-foreground p-4 rounded-md cursor-pointer hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed uppercase"
            onClick={handleUpdateTimetable}
            disabled={updatingTimetable}
          >
            {updatingTimetable ? "Updating timetable..." : "Update Timetable"}
          </button>
          {updateMessage && <div className="text-sm text-primary px-4">{updateMessage}</div>}
          {updateError && <div className="text-sm text-red-400 px-4">{updateError}</div>}
        </div>

        <div className="flex gap-4 mt-4">
          <button
            className="bg-red-500 text-black p-3 rounded-md cursor-pointer flex-1 text-center"
            onClick={() => {
              resetAllStores();
            }}
          >
            Reset everything
          </button>
          <button
            className="bg-green-500 text-black p-3 rounded-md cursor-pointer flex-1 text-center"
            onClick={() => {
              viewAllStores();
            }}
          >
            VIEW STORES
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;