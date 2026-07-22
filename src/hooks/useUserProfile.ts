import { useQuery } from "@tanstack/react-query";
import { getCurrentUserProfile as fetchUserProfile } from "../store/newtimeTableStore";

export function useUserProfile() {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    staleTime: 60_000,
  });
}