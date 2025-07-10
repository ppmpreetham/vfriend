import { useMemo, useState, useEffect } from "react";
import ScheduleGrid from "./ScheduleGrid";
import { useUserProfile } from "../../hooks/useUserProfile";
import { nextFreeTime as useNextFreeTime } from "../../utils/invokeFunctions";
import { useUserTimetable } from "../../hooks/useUserTimetable";
import {
  resetAllStores,
  viewAllStores,
  getUserBitmap,
  getUserKindmap,
} from "../../store/newtimeTableStore";

const Profile = () => {
  // Get current time in HH:MM format
  const { currentTime, currentDay } = useMemo(() => {
    const now = new Date();
    return {
      currentTime: `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`,
      currentDay: now.getDay() === 0 ? 7 : now.getDay(),
    };
  }, []);

  // Use states for bitmap and kindmap
  const [bitmap, setBitmap] = useState<boolean[]>([]);
  const [kindmap, setKindmap] = useState<boolean[]>([]);
  const [bitmapLoading, setBitmapLoading] = useState(true);
  const [kindmapLoading, setKindmapLoading] = useState(true);
  const [allBitmaps, setAllBitmaps] = useState<Record<number, boolean[]>>({});
  const [allKindmaps, setAllKindmaps] = useState<Record<number, boolean[]>>({});

  // Use the new hook for user profile
  const userData = useUserProfile();

  // Fetch bitmap and kindmap directly
  useEffect(() => {
    async function fetchData() {
      try {
        setBitmapLoading(true);
        setKindmapLoading(true);

        // Get bitmap for current day
        const dayBitmap = await getUserBitmap(currentDay);
        setBitmap(dayBitmap);
        setBitmapLoading(false);

        // Get kindmap for current day
        const dayKindmap = await getUserKindmap(currentDay);
        setKindmap(dayKindmap);
        setKindmapLoading(false);

        // Fetch all bitmaps for the schedule grid
        const bitmaps: Record<number, boolean[]> = {};
        const kindmaps: Record<number, boolean[]> = {};
        
        for (let day = 1; day <= 6; day++) {
          try {
            bitmaps[day] = await getUserBitmap(day);
            kindmaps[day] = await getUserKindmap(day);
          } catch (error) {
            console.error(`Failed to get bitmap for day ${day}:`, error);
            bitmaps[day] = [];
            kindmaps[day] = [];
          }
        }
        setAllBitmaps(bitmaps);
        setAllKindmaps(kindmaps);
      } catch (error) {
        console.error("Error fetching bitmap/kindmap data:", error);
        setBitmapLoading(false);
        setKindmapLoading(false);
      }
    }

    fetchData();
  }, [currentDay]);

  // Only call useNextFreeTime when bitmap and kindmap are available
  const { data: nextFreeTimeRaw, isLoading: nextFreeLoading } = useNextFreeTime(
    {
      bitmap: bitmap || [],
      currentTime,
      kindmap: kindmap || [],
    }
  );

  const nextFreeTime = useMemo(() => {
    if (!nextFreeTimeRaw) return null;

    // Split the time string safely
    const parts = nextFreeTimeRaw.split(":");
    const hours = parts[0];
    const minutes = parts[1];

    // Check if we have valid hour and minutes
    if (!hours || isNaN(parseInt(hours, 10))) {
      return "RIGHT NOW";
    }

    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;

    // Use "00" as default if minutes are undefined
    const formattedMinutes =
      minutes && !isNaN(parseInt(minutes, 10)) ? minutes : "00";

    return `${hour12}:${formattedMinutes} ${ampm}`;
  }, [nextFreeTimeRaw]);

  // Replace the direct function call with the hook
  const {
    data: timetableData,
    isLoading: timetableLoading,
    error: timetableError,
  } = useUserTimetable();

  if (
    userData.isLoading ||
    timetableLoading ||
    bitmapLoading ||
    kindmapLoading
  ) {
    return (
      <div className="w-screen h-full flex items-center justify-center">
        <div className="text-2xl">Loading profile...</div>
      </div>
    );
  }

  if (userData.error || timetableError) {
    return (
      <div className="w-screen h-full flex items-center justify-center">
        <div className="text-2xl text-red-500">Error loading profile data</div>
      </div>
    );
  }

  // Check if timetable data exists before rendering ScheduleGrid.
  if (!timetableData) {
    return (
      <div className="w-screen h-full flex flex-col overflow-y-auto scrollbar-hide">
        <div className="flex h-fit w-full gap-2 uppercase">
          <div className="ml-4 w-1/2 flex flex-col gap-2">
            <div className="p-4 bg-primary text-black flex flex-col w-full flex-1 rounded-xl justify-center">
              <div className="text-3xl">{userData.data?.u || "UNKNOWN"}</div>
              <div>{timetableData ? "TIMETABLE FOUND" : "UNKNOWN"}</div>
              <div>SEM 4</div>
            </div>
            <div className="p-4 bg-white text-black flex flex-col w-full flex-2 rounded-xl justify-center">
              <div className="text-3xl">Free Places</div>
              <ul className="list-disc pl-5">
                {userData.data?.h?.map((hobby: string, index: number) => (
                  <li key={index}>{hobby}</li>
                )) || <li>No hobbies listed</li>}
              </ul>
            </div>
          </div>
          <div className="mr-4 w-1/2 flex flex-col gap-2">
            <div className="p-4 bg-white text-black flex flex-col w-full flex-2 rounded-xl justify-center">
              <div>{userData.data?.q || "No tagline set"}</div>
            </div>
            <div className="p-4 bg-primary text-black flex flex-col w-full flex-1 rounded-xl justify-center">
              <div className="text-xl">NEXT FREE</div>
              <div className="text-3xl">No timetable</div>
            </div>
          </div>
        </div>
        <div className="mx-4 my-2 text-4xl">TIME TABLE</div>
        <div className="mx-4 p-8 bg-white text-black rounded-xl text-center">
          <div className="text-xl">No timetable uploaded</div>
          <div className="text-sm text-gray-600 mt-2">
            Upload your timetable to see your schedule
          </div>
        </div>
        <div
          className="bg-red-500 text-black m-4 p-2 rounded-xl text-2xl cursor-pointer"
          onClick={() => {
            resetAllStores();
          }}
        >
          Reset everything
        </div>
        <div
          className="bg-green-500 text-black m-4 p-2 rounded-xl text-2xl cursor-pointer"
          onClick={() => {
            viewAllStores();
          }}
        >
          VIEW STORES
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-full flex flex-col overflow-y-auto pb-8">
      <div className="flex w-full gap-2 uppercase">
        <div className="ml-4 w-1/2 flex flex-col gap-2">
          <div className="p-4 bg-primary text-black flex flex-col w-full flex-1 rounded-xl justify-center">
            <div className="text-3xl">{userData.data?.u || "UNKNOWN"}</div>
            <div>{userData ? userData.data?.r : "UNKNOWN"}</div>
            <div>SEM {userData.data?.s}</div>
          </div>
          <div className="p-4 bg-white text-black flex flex-col w-full flex-2 rounded-xl gap-4">
            <div className="text-[clamp(1.25rem,1vh,1.875rem)]">I'll be at...</div>
            <ul className="list-disc pl-5">
              {userData.data?.h?.map((hobby, index) => (
                <li key={index}>{hobby}</li>
              )) || <li>No hobbies listed</li>}
            </ul>
          </div>
        </div>
        <div className="mr-4 w-1/2 flex flex-col gap-2">
          <div className="p-4 bg-white text-black flex flex-col w-full flex-2 rounded-xl justify-center">
            <div>{userData.data?.q || "No tagline set"}</div>
          </div>
          <div className="p-4 bg-primary text-black flex flex-col w-full flex-1 rounded-xl justify-center">
            <div className="text-xl">NEXT FREE</div>
            <div className="text-3xl">
              {bitmapLoading || kindmapLoading || nextFreeLoading
                ? "Loading..."
                : nextFreeTime || "Not available"}
            </div>
          </div>
        </div>
      </div>
      <ScheduleGrid bitmaps={allBitmaps} kindmaps={allKindmaps} />
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
  );
};

export default Profile;
