import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserProfile,
  saveUserProfile,
  getCurrentUserProfile,
  hasCompletedOnboarding,
  markOnboardingComplete,
  initializeUserProfile,
  type UserProfile,
} from "../store/timeTableStore";

// Query keys
export const profileKeys = {
  all: ["profiles"] as const,
  user: (username: string) => [...profileKeys.all, username] as const,
  currentUser: () => [...profileKeys.all, "current"] as const,
  onboardingStatus: () => ["onboarding", "status"] as const,
};

// Get user profile
export function useUserProfile(username?: string) {
  return useQuery({
    queryKey: username ? profileKeys.user(username) : [],
    queryFn: () => getUserProfile(username!),
    enabled: !!username,
  });
}

// Get current user profile
export function useCurrentUserProfile() {
  return useQuery({
    queryKey: profileKeys.currentUser(),
    queryFn: getCurrentUserProfile,
  });
}

// Check onboarding status
export function useOnboardingStatus() {
  return useQuery({
    queryKey: profileKeys.onboardingStatus(),
    queryFn: hasCompletedOnboarding,
  });
}

// Initialize user profile
export function useInitializeProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      username,
      hobbies,
      tagline,
    }: {
      username: string;
      hobbies: string[];
      tagline: string;
    }) => initializeUserProfile(username, hobbies, tagline),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      queryClient.invalidateQueries({
        queryKey: profileKeys.onboardingStatus(),
      });
    },
  });
}

// Save user profile
export function useSaveProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: UserProfile) => saveUserProfile(profile),
    onSuccess: (_, profile) => {
      queryClient.invalidateQueries({
        queryKey: profileKeys.user(profile.username),
      });
      queryClient.invalidateQueries({ queryKey: profileKeys.currentUser() });
    },
  });
}

// Mark onboarding complete
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
