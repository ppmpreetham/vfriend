import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import ScheduleGrid from "../profile/ScheduleGrid";
import { getTimetableStatus } from "../../utils/invokeFunctions";
import { useFriendStore } from "../../store/friendStore";
import { useFriendData } from "../../hooks/useFriendData";
import { useUserProfile } from "../../hooks/useUserProfile";
import QRCodeGenerator from "./QRCodeGenerator";
import { compress } from "../../utils/compressor";
import { TimetableStatusText } from "../../utils/timetableDisplay";

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

  const [bitmapLoading, setBitmapLoading] = useState(true);
  const [kindmapLoading, setKindmapLoading] = useState(true);
  const [allBitmaps, setAllBitmaps] = useState<Record<number, boolean[]>>({});
  const [allKindmaps, setAllKindmaps] = useState<Record<number, boolean[]>>({});
  const userSettings = useUserProfile();

  const { data: timetableStatus, isLoading: statusLoading } = getTimetableStatus({
    schedule: selectedFriend?.o || [],
    showGapsAsFree: userSettings.data?.showGapsAsFree ?? false,
  });

  const getTimetableJsonString = () => {
    if (!selectedFriend) return "";

    try {
      return compress(JSON.stringify(selectedFriend));
    } catch (error) {
      console.error("Error converting timetable to JSON:", error);
      return "";
    }
  };

  useEffect(() => {
    if (!selectedFriend) return;

    setBitmapLoading(true);
    setKindmapLoading(true);
    setAllBitmaps(selectedFriend.b || {});
    setAllKindmaps(selectedFriend.k || {});
    setBitmapLoading(false);
    setKindmapLoading(false);
  }, [selectedFriend]);

  if (friendLoading) {
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
          className="flex m-2 p-2 rounded-full items-center gap-2 text-primary hover:bg-background3"
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
              {bitmapLoading || kindmapLoading || statusLoading ? (
                "Loading..."
              ) : timetableStatus ? (
                <TimetableStatusText
                  status={timetableStatus}
                  timeFormat={userSettings.data?.timeFormat ?? 24}
                />
              ) : (
                "Not available"
              )}
            </div>
          </div>
        </div>
      </div>
      <ScheduleGrid bitmaps={allBitmaps} kindmaps={allKindmaps} />
    </div>
  );
};

export default FriendPage;
