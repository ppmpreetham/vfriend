import { useMemo, useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import ScheduleGrid from "../profile/ScheduleGrid";
import { nextFreeTime as useNextFreeTime } from "../../utils/invokeFunctions";
import { useFriendStore } from "../../store/friendStore";
import { useFriendData } from "../../hooks/useFriendData";
import QRCodeGenerator from "./QRCodeGenerator";
import { compress } from "../../utils/compressor";

const FriendPage = () => {
  const selectedFriendRegNumber = useFriendStore(
    (state) => state.selectedFriendRegNumber
  );
  const clearSelectedFriend = useFriendStore(
    (state) => state.clearSelectedFriend
  );

  const {
    selectedFriend,
    isLoading: friendLoading,
    error: friendError,
  } = useFriendData(selectedFriendRegNumber || "");

  const getTimetableJsonString = () => {
      if (!selectedFriend) return "";
  
      try {
        return compress(JSON.stringify(selectedFriend));
      } catch (error) {
        console.error("Error converting timetable to JSON:", error);
        return "";
      }
    };

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
  // Fetch bitmap and kindmap for the selected friend
  useEffect(() => {
    if (!selectedFriend) return;

    setBitmapLoading(true);
    setKindmapLoading(true);

    // Set bitmap for current day
    if (selectedFriend.b && selectedFriend.b[currentDay]) {
      setBitmap(selectedFriend.b[currentDay]);
      setBitmapLoading(false);
    }

    // Set kindmap for current day
    if (selectedFriend.k && selectedFriend.k[currentDay]) {
      setKindmap(selectedFriend.k[currentDay]);
      setKindmapLoading(false);
    }

    // Set all bitmaps for the schedule grid
    if (selectedFriend.b) {
      setAllBitmaps(selectedFriend.b);
    }

    // Set all kindmaps for the schedule grid
    if (selectedFriend.k) {
      setAllKindmaps(selectedFriend.k);
    }
  }, [selectedFriend, currentDay]);

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

  if (friendLoading || bitmapLoading || kindmapLoading) {
    return (
      <div className="w-screen h-full flex items-center justify-center">
        <div className="text-2xl">Loading friend profile...</div>
      </div>
    );
  }

  if (friendError || !selectedFriend) {
    return (
      <div className="w-screen h-full flex items-center justify-center">
        <div className="text-2xl text-red-500">Error loading friend data</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-full flex flex-col overflow-y-auto pb-8">
      <div className="flex items-center">
        <button
          onClick={clearSelectedFriend}
          className="flex m-2 p-2 rounded-full items-center gap-2 text-primary hover:bg-gray-800"
        >
          <ChevronLeft />
          Back to Friends
        </button>
      </div>

      <div className="flex w-full gap-2 uppercase">
        <div className="ml-4 w-1/2 flex flex-col gap-2">
          <div className="p-4 bg-primary text-black flex flex-col w-full flex-1 rounded-xl justify-center">
            <div className="text-3xl">{selectedFriend.u || "UNKNOWN"}</div>
            <div>{selectedFriend.r || "UNKNOWN"}</div>
            <div>SEM {selectedFriend.s}</div>
          </div>
          <div className="p-4 bg-white text-black flex flex-col w-full flex-2 rounded-xl gap-4">
            <div className="text-[clamp(1.25rem,1vh,1.875rem)]">
              I'll be at...
            </div>
            <ul className="list-disc pl-5">
              {selectedFriend.h?.map((hobby, index) => (
                <li key={index}>{hobby}</li>
              )) || <li>No hobbies listed</li>}
            </ul>
          </div>
        </div>
        <div className="mr-4 w-1/2 flex flex-col gap-2">
          <div className="bg-white text-black flex flex-col w-full flex-2 rounded-xl justify-center">
            <QRCodeGenerator
            url={getTimetableJsonString()}
            size={300}
            errorCorrectionLevel="M"
          />
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
      <ScheduleGrid bitmaps={allBitmaps} kindmaps={allKindmaps}/>
    </div>
  );
};

export default FriendPage;
