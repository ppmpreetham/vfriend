import { share } from "@inkibra/tauri-plugin-sharing";

export async function handleShare() {
  try {
    await share("Check out this cool app!", "https://example.com");
    console.log("Content shared successfully");
  } catch (error) {
    console.error("Failed to share content:", error);
  }
}

export function ShareLink() {
  return handleShare();
}
