import { useQuery } from "@tanstack/react-query";
import { shareCurrentUserProfile } from "../store/newtimeTableStore";

export function useShareUserProfile() {
  return useQuery({
    queryKey: ["shareUserProfile"],
    queryFn: shareCurrentUserProfile,
    staleTime: 60_000,
  });
}