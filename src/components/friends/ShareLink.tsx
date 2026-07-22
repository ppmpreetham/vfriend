import { invoke } from "@tauri-apps/api/core";
import { platform } from "@tauri-apps/plugin-os";
import { useShareUserProfile } from "../../hooks/useShareUserProfile";
import type { shareData } from "../../store/newtimeTableStore";
import { compress } from "../../utils/compressor";

export interface SharesheetOptions {
  mimeType?: string;
  thumbnailUri?: string;
  title?: string;
}

function isMobilePlatform() {
  const currentPlatform = platform();
  return currentPlatform === "android" || currentPlatform === "ios";
}

function buildShareCode(userData: shareData | null): string {
  if (!userData) return "";

  const shareableData: shareData = (({ u, r, s, h, q, t, o }) => ({
    u,
    r,
    s,
    h,
    q,
    t,
    o,
  }))(userData);

  return compress(shareableData);
}

function buildShareText(userData: shareData | null): string {
  const code = buildShareCode(userData);
  return `Hey, add me on VFriend: https://vfriend.preetham.top/${code}`;
}

async function shareText(text: string, options?: SharesheetOptions) {
  if (isMobilePlatform()) {
    await invoke("plugin:sharesheet|share_text", { text, ...options });
    return;
  }

  if (navigator.share) {
    await navigator.share({ text, title: options?.title ?? "VFriend" });
    return;
  }

  await navigator.clipboard.writeText(text);
}

async function shareUserData(userData: shareData | null) {
  try {
    await shareText(buildShareText(userData), {
      title: "VFriend",
      mimeType: "text/plain",
    });
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