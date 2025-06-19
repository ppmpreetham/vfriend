import { useMemo } from "react";
import ScheduleGrid from "./ScheduleGrid";
import { useCurrentUserProfile } from "../../hooks/useUserQueries";
import { useUserDayBitmap, useUserDayKindmap, nextFreeTime as useNextFreeTime} from "../../hooks/timetablenewBitmap";
import {
  useCurrentUserTimetable,
} from "../../hooks/useTimeTableQueries";
import { resetAllStores, viewStoreContents } from "../../store/timeTableStore";

const Profile = () => {
  // Get current time in HH:MM format
 const { currentTime, currentDay } = useMemo(() => {
    const now = new Date();
    return {
      currentTime: `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`,
      currentDay: now.getDay() === 0 ? 7 : now.getDay()
    };
  }, []);
  
  // Get user bitmap and kindmap using React Query
  const { data: bitmap, isLoading: bitmapLoading } = useUserDayBitmap(currentDay);
  const { data: kindmap, isLoading: kindmapLoading } = useUserDayKindmap(currentDay);
  
  // Only call useNextFreeTime when bitmap and kindmap are available
  const { data: nextFreeTimeRaw, isLoading: nextFreeLoading } = useNextFreeTime({
    bitmap: bitmap || [], 
    currentTime, 
    kindmap: kindmap || []
  });

  const nextFreeTime = useMemo(() => {
    if (!nextFreeTimeRaw) return null;
    
    // Split the time string safely
    const parts = nextFreeTimeRaw.split(':');
    const hours = parts[0];
    const minutes = parts[1];
    
    // Check if we have valid hour and minutes
    if (!hours || isNaN(parseInt(hours, 10))) {
      return "RIGHT NOW";
    }
    
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    // Use "00" as default if minutes are undefined
    const formattedMinutes = minutes && !isNaN(parseInt(minutes, 10)) 
      ? minutes 
      : "00";
      
    return `${hour12}:${formattedMinutes} ${ampm}`;
  }, [nextFreeTimeRaw]);

  const userData = useCurrentUserProfile();
  const {
    data: timetableData,
    isLoading: timetableLoading,
    error: timetableError,
  } = useCurrentUserTimetable();
  
  currentTime;
  if (userData.isLoading || timetableLoading) {
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

  // Check if timetable data exists before rendering ScheduleGrid
  if (!timetableData) {
    return (
      <div className="w-screen h-full flex flex-col">
        <div className="flex h-2/5 w-full gap-2 uppercase">
          <div className="ml-4 w-1/2 flex flex-col gap-2">
            <div className="p-4 bg-primary text-black flex flex-col w-full flex-1 rounded-xl justify-center">
              <div className="text-3xl">
                {userData.data?.username || "UNKNOWN"}
              </div>
              <div>{timetableData ? "TIMETABLE FOUND" : "UNKNOWN"}</div>
              <div>SEM 4</div>
            </div>
            <div className="p-4 bg-white text-black flex flex-col w-full flex-2 rounded-xl justify-center">
              <div className="text-3xl">HOBBIES</div>
              <ul className="list-disc pl-5">
                {userData.data?.hobbies?.map((hobby, index) => (
                  <li key={index}>{hobby}</li>
                )) || <li>No hobbies listed</li>}
              </ul>
            </div>
          </div>
          <div className="mr-4 w-1/2 flex flex-col gap-2">
            <div className="p-4 bg-white text-black flex flex-col w-full flex-2 rounded-xl justify-center">
              <div>{userData.data?.tagline || "No tagline set"}</div>
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
      </div>
    );
  }

  return (
    <div className="w-screen h-full flex flex-col">
      <div className="flex h-2/5 w-full gap-2 uppercase">
        <div className="ml-4 w-1/2 flex flex-col gap-2">
          <div className="p-4 bg-primary text-black flex flex-col w-full flex-1 rounded-xl justify-center">
            <div className="text-3xl">
              {userData.data?.username || "UNKNOWN"}
            </div>
            <div>{timetableData ? timetableData.r : "UNKNOWN"}</div>
            <div>SEM {timetableData.s}</div>
          </div>
          <div className="p-4 bg-white text-black flex flex-col w-full flex-2 rounded-xl justify-center">
            <div className="text-3xl">HOBBIES</div>
            <ul className="list-disc pl-5">
              {userData.data?.hobbies?.map((hobby, index) => (
                <li key={index}>{hobby}</li>
              )) || <li>No hobbies listed</li>}
            </ul>
          </div>
        </div>
        <div className="mr-4 w-1/2 flex flex-col gap-2">
          <div className="p-4 bg-white text-black flex flex-col w-full flex-2 rounded-xl justify-center">
            <div>{userData.data?.tagline || "No tagline set"}</div>
          </div>
          <div className="p-4 bg-primary text-black flex flex-col w-full flex-1 rounded-xl justify-center">
            <div className="text-xl">NEXT FREE</div>
            <div className="text-3xl">
              {bitmapLoading || kindmapLoading || nextFreeLoading ? 
                "Loading..." : 
                nextFreeTime || "Not available"}
            </div>
          </div>
        </div>
      </div>
      <div className="mx-4 my-2 text-4xl">TIME TABLE</div>
      <ScheduleGrid data={timetableData} />
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
          viewStoreContents();
        }}
      >
        VIEW STORES
      </div>
    </div>
  );
};

export default Profile;
