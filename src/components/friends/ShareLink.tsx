import { invoke } from "@tauri-apps/api/core";
import { useShareUserProfile } from "../../hooks/useShareUserProfile";
import { shareData } from "../../store/newtimeTableStore";
import { compress } from "../../utils/compressor";

export interface SharesheetOptions {
  mimeType?: string;
  thumbnailUri?: string;
  title?: string;
}

async function shareText(text: string, options?: SharesheetOptions) {
  await invoke("plugin:sharesheet|share_text", { text, ...options });
}

async function shareUserData(userData: shareData | null) {
  const getTimetableJsonString = () => {
    if (!userData) return "";

    try {
      const shareableData: shareData = (({ u, r, s, h, q, t, o }) => ({
        u,
        r,
        s,
        h,
        q,
        t,
        o,
      }))(userData);
      console.log("Compressing shareableData:", shareableData);
      return compress(shareableData);
    } catch (error) {
      console.error("Error converting timetable to JSON:", error);
      return "";
    }
  };

  try {
    await shareText(
      `Hey, umm,👉🏻👈🏻... I've been using the vfriend app which lets me check other's time tables. you can add me via https://vfriend.preetham.top/${getTimetableJsonString()}`
      // {
      //   title: "VFriend",
      //   thumbnailUri: "https://example.com/thumbnail.jpg",
      //   mimeType: "text/plain",
      // }
    );
    console.log("Content shared successfully");
  } catch (error) {
    console.error("Failed to share content:", error);
  }
}

export function useShare() {
  const { data: userData, isLoading, error } = useShareUserProfile();

  const handleShare = async () => {
    console.log(isLoading, error);
    await shareUserData(userData);
  };

  return { handleShare, isLoading, error };
}

// function for backward compatibility
export async function handleShare() {
  console.warn("Deprecated: Use useShare hook instead");
  const { handleShare: share } = useShare();
  await share();
}
