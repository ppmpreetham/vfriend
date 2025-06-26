import { useState, useEffect } from "react";
import { userStore } from "../store/newtimeTableStore";
import type { userData } from "../store/newtimeTableStore";

export function useOnboardingStatus() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(false);

  async function checkStatus() {
    try {
      setIsLoading(true);
      const userData = (await userStore.get("userData")) as userData | null;
      console.log("Checking onboarding status:", userData);
      setData(userData !== null && userData.welcome === true);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setData(false);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkStatus();
  }, []);

  const refetch = async () => {
    console.log("Refetching onboarding status");
    await checkStatus();
  };

  return { data, isLoading, refetch };
}
