import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { useEffect, useState } from "react";
import { validateAndAddFriend } from "../store/newtimeTableStore";

interface AddFriendResult {
  success: boolean;
  error?: {
    message: string;
  };
}

export const useDeepLink = () => {
  const [processingResult, setProcessingResult] = useState<{
    success: boolean;
    message: string;
    isProcessing: boolean;
  }>({
    success: false,
    message: "",
    isProcessing: false,
  });

  useEffect(() => {
    const handleUrl = async (urls: string[]) => {
      const url = urls[0];
      console.log("Received deep link URL:", url);

      let accessCode = "";

      try {
        setProcessingResult({
          success: false,
          message: "Processing link...",
          isProcessing: true,
        });

        if (url.startsWith("vfriend://")) {
          accessCode = url.replace("vfriend://", "");
        } else if (url.startsWith("https://vfriend.preetham.top/")) {
          accessCode = url.replace("https://vfriend.preetham.top/", "");
        } else if (url.startsWith("http://vfriend.preetham.top/")) {
          accessCode = url.replace("http://vfriend.preetham.top/", "");
        } else {
          setProcessingResult({
            success: false,
            message: "Unsupported URL format",
            isProcessing: false,
          });
          return;
        }

        if (!accessCode) {
          setProcessingResult({
            success: false,
            message: "No access code found in the URL",
            isProcessing: false,
          });
          return;
        }

        const result = (await validateAndAddFriend(
          accessCode
        )) as AddFriendResult;

        if (result.success) {
          setProcessingResult({
            success: true,
            message: "Friend added successfully!",
            isProcessing: false,
          });
        } else {
          setProcessingResult({
            success: false,
            message: result.error?.message || "Failed to add friend",
            isProcessing: false,
          });
        }
      } catch (error) {
        console.error("Error processing deep link:", error);
        setProcessingResult({
          success: false,
          message: `Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          isProcessing: false,
        });
      }
    };

    onOpenUrl(handleUrl);
  }, []);

  return processingResult;
};
