import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserProfile,
  getCurrentUserProfile,
  hasCompletedOnboarding,
  markOnboardingComplete,
  initializeUserProfile,
  type UserProfile,
} from "../store/timeTableStore";

// Query keys
export const profileKeys = {
  all: ["profiles"] as const,
  currentUser: () => [...profileKeys.all, "current"] as const,
  onboardingStatus: () => ["onboarding", "status"] as const,
};

// Essential queries
export function useCurrentUserProfile() {
  return useQuery({
    queryKey: profileKeys.currentUser(),
    queryFn: getCurrentUserProfile,
  });
}

export function useOnboardingStatus() {
  return useQuery({
    queryKey: profileKeys.onboardingStatus(),
    queryFn: hasCompletedOnboarding,
  });
}

// Essential mutations
export function useInitializeProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      username,
      hobbies,
      tagline,
      semester,
    }: {
      username: string;
      hobbies: string[];
      tagline: string;
      semester?: number;
    }) => initializeUserProfile(username, hobbies, tagline, semester),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      queryClient.invalidateQueries({
        queryKey: profileKeys.onboardingStatus(),
      });
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) => markOnboardingComplete(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      queryClient.invalidateQueries({
        queryKey: profileKeys.onboardingStatus(),
      });
    },
  });
}