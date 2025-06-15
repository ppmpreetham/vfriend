import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUser,
  setCurrentUser,
  getFriendsList,
  getCurrentUserTimetable,
  saveTimetable,
} from "../store/timeTableStore";
import { useTimetableStore } from "../store/useTimeTableStore";

// Query Keys
export const QUERY_KEYS = {
  currentUser: ["currentUser"] as const,
  friendsList: ["friendsList"] as const,
  currentUserTimetable: ["currentUserTimetable"] as const,
};

// Core queries
export function useCurrentUser() {
  const { syncCurrentUser } = useTimetableStore();

  return useQuery({
    queryKey: QUERY_KEYS.currentUser,
    queryFn: async () => {
      const user = await getCurrentUser();
      syncCurrentUser(user);
      return user;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFriendsList() {
  const { syncFriendsList } = useTimetableStore();

  return useQuery({
    queryKey: QUERY_KEYS.friendsList,
    queryFn: async () => {
      const friends = await getFriendsList();
      syncFriendsList(friends);
      return friends;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCurrentUserTimetable() {
  const { syncCurrentUserTimetable } = useTimetableStore();

  return useQuery({
    queryKey: QUERY_KEYS.currentUserTimetable,
    queryFn: async () => {
      const timetable = await getCurrentUserTimetable();
      syncCurrentUserTimetable(timetable);
      return timetable;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Core mutations
export function useSetCurrentUser() {
  const queryClient = useQueryClient();
  const { syncCurrentUser } = useTimetableStore();

  return useMutation({
    mutationFn: setCurrentUser,
    onSuccess: (_, username) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentUser });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.currentUserTimetable,
      });

      // Update Zustand store
      syncCurrentUser(username);
    },
  });
}

export function useSaveTimetable() {
  const queryClient = useQueryClient();
  const { syncCurrentUserTimetable } = useTimetableStore();

  return useMutation({
    mutationFn: saveTimetable,
    onSuccess: async (_, timetable) => {
      const currentUser = await getCurrentUser();

      if (currentUser) {
        queryClient.setQueryData(QUERY_KEYS.currentUserTimetable, timetable);
        syncCurrentUserTimetable(timetable);
      }
    },
  });
}
