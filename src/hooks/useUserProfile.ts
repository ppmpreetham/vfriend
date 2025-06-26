import { useState, useEffect } from "react";
import { getCurrentUserProfile as fetchUserProfile } from "../store/newtimeTableStore";
import type { userData } from "../store/newtimeTableStore";

export function useUserProfile() {
  const [data, setData] = useState<userData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true);
        setError(null);
        const userData = await fetchUserProfile();
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
