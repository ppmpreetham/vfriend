import { useState, useEffect } from "react";
import { shareCurrentUserProfile } from "../store/newtimeTableStore";
import type { shareData } from "../store/newtimeTableStore";

export function useShareUserProfile() {
  const [data, setData] = useState<shareData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true);
        setError(null);
        const userData = await shareCurrentUserProfile();
        setData(userData);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, []);

  return { data, isLoading, error };
}
