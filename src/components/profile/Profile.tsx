import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ScheduleGrid from "./ScheduleGrid";
import { useUserProfile } from "../../hooks/useUserProfile";
import { getTimetableStatus, parseHTMLTimetable } from "../../utils/invokeFunctions";
import { useUserTimetable } from "../../hooks/useUserTimetable";
import { TimetableStatusText } from "../../utils/timetableDisplay";
import {
  getUserBitmap,
  getUserKindmap,
} from "../../store/newtimeTableStore";

const isDevelopment = import.meta.env.DEV;

const Profile = () => {
  const queryClient = useQueryClient();
  const [bitmapLoading, setBitmapLoading] = useState(true);
  const [kindmapLoading, setKindmapLoading] = useState(true);
  const [allBitmaps, setAllBitmaps] = useState<Record<number, boolean[]>>({});
  const [allKindmaps, setAllKindmaps] = useState<Record<number, boolean[]>>({});

  const userData = useUserProfile();
  const {
    data: timetableData,
    isLoading: timetableLoading,
    error: timetableError,
  } = useUserTimetable();
  const { data: timetableStatus, isLoading: statusLoading } = getTimetableStatus({
    schedule: userData.data?.o || [],
    showGapsAsFree: userData.data?.showGapsAsFree ?? false,
  });

  const fetchDayMaps = useCallback(async () => {
    setBitmapLoading(true);
    setKindmapLoading(true);

    const bitmaps: Record<number, boolean[]> = {};
    const kindmaps: Record<number, boolean[]> = {};

    for (let day = 1; day <= 5; day++) {
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
    setBitmapLoading(false);
    setKindmapLoading(false);
  }, []);

  useEffect(() => {
    fetchDayMaps();
  }, [fetchDayMaps, timetableData]);



  if (userData.isLoading || timetableLoading || bitmapLoading || kindmapLoading) {
    return (
      <div className="w-screen h-full flex items-center justify-center">
        <div className="text-2xl">Loading profile...</div>
      </div>
    );
  }

  if (userData.error) {
    return (
      <div className="w-screen h-full flex items-center justify-center">
        <div className="text-2xl text-red-500">Error loading profile data</div>
      </div>
    );
  }

  if (!timetableData || timetableError) {
    return (
      <div className="w-screen h-full flex flex-col overflow-y-auto scrollbar-hide">
        <div className="flex h-fit w-full gap-2 uppercase">
          <div className="ml-4 w-1/2 flex flex-col gap-2">
            <div className="p-4 bg-primary text-black flex flex-col w-full flex-1 rounded-xl justify-center">
              <div className="text-3xl">{userData.data?.u || "UNKNOWN"}</div>
              <div>{userData.data?.r || "UNKNOWN"}</div>
              <div>SEM {userData.data?.s || "UNKNOWN"}</div>
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
        </div>
    );
  }

  return (
    <div className="w-screen h-full flex flex-col overflow-y-auto pb-8">
      <div className="flex w-full gap-2 uppercase">
        <div className="ml-4 w-1/2 flex flex-col gap-2">
          <div className="p-4 bg-primary text-black flex flex-col w-full flex-1 rounded-xl justify-center">
            <div className="text-[clamp(1.25rem,7vw,1.875rem)]">
              {userData.data?.u || "UNKNOWN"}
            </div>
            <div>{userData.data?.r || "UNKNOWN"}</div>
            <div>SEM {userData.data?.s}</div>
          </div>
          <div className="p-4 bg-white text-black flex flex-col w-full flex-2 rounded-xl gap-4">
            <div className="text-[clamp(1.25rem,1vw,1.875rem)]">I'll be at...</div>
            <ul className="list-disc pl-5">
              {userData.data?.h?.map((hobby, index) => (
                <li key={index}>{hobby}</li>
              )) || <li>No hobbies listed</li>}
            </ul>
          </div>
        </div>
        <div className="mr-4 w-1/2 flex flex-col gap-2">
          <div className="p-4 bg-white text-black flex flex-col w-full flex-2 rounded-xl justify-center">
            <div>MOST FREE</div>
            <div>{userData.data?.q || "No tagline set"}</div>
          </div>
          <div className="p-4 bg-primary text-black flex flex-col w-full flex-1 rounded-xl justify-center">
            <div className="text-xl">NEXT FREE</div>
            <div className="text-md">
              {statusLoading ? (
                "Loading..."
              ) : timetableStatus ? (
                <TimetableStatusText
                  status={timetableStatus}
                  timeFormat={userData.data?.timeFormat ?? 24}
                />
              ) : (
                "FREE DAY"
              )}
            </div>
          </div>
        </div>
      </div>
      <ScheduleGrid bitmaps={allBitmaps} kindmaps={allKindmaps} />
    </div>
  );
};

export default Profile;