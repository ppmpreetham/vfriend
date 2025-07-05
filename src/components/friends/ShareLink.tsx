import { invoke } from "@tauri-apps/api/core";
export interface SharesheetOptions {
    mimeType?: string;
    thumbnailUri?: string;
    title?: string;
}

async function shareText(text:string, options?: SharesheetOptions) {
    await invoke("plugin:sharesheet|share_text", {text,...options,});
}

export async function handleShare(text: string = "Check out this cool app!") {
  try {
    await shareText(text, { title: "VFriend", thumbnailUri: "https://example.com/thumbnail.jpg", mimeType: "text/plain" });
    console.log("Content shared successfully");
  } catch (error) {
    console.error("Failed to share content:", error);
  }
}