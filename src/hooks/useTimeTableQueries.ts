import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUser,
  setCurrentUser,
  getFriendsList,
  addFriend,
  removeFriend,
  getTimetable,
  getCurrentUserTimetable,
  saveTimetable,
  deleteTimetable,
  importTimetable,
  exportTimetable,
  checkConflictsByUsername,
  findCommonFreeTimesByUsername,
  isUserFreeAtByUsername,
  findFriendsFreeTime,
  viewStoreContents,
} from "../store/timeTableStore";
import { useTimetableStore } from "../store/useTimeTableStore";

// Query Keys
export const QUERY_KEYS = {
  currentUser: ["currentUser"] as const,
  friendsList: ["friendsList"] as const,
  timetable: (username: string) => ["timetable", username] as const,
  currentUserTimetable: ["currentUserTimetable"] as const,
  conflicts: (username1: string, username2: string) =>
    ["conflicts", username1, username2] as const,
  commonFreeTimes: (usernames: string[]) =>
    ["commonFreeTimes", usernames] as const,
  userFreeAt: (username: string, day: number, time: string) =>
    ["userFreeAt", username, day, time] as const,
  friendsFreeTime: ["friendsFreeTime"] as const,
  storeContents: ["storeContents"] as const,
};

// ============= QUERIES =============

export function useCurrentUser() {
  const { syncCurrentUser } = useTimetableStore();

  return useQuery({
    queryKey: QUERY_KEYS.currentUser,
    queryFn: async () => {
      const user = await getCurrentUser();
      syncCurrentUser(user);
      return user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTimetable(username: string) {
  return useQuery({
    queryKey: QUERY_KEYS.timetable(username),
    queryFn: () => getTimetable(username),
    enabled: !!username,
    staleTime: 10 * 60 * 1000, // 10 minutes
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useConflicts(username1: string, username2: string) {
  return useQuery({
    queryKey: QUERY_KEYS.conflicts(username1, username2),
    queryFn: () => checkConflictsByUsername(username1, username2),
    enabled: !!username1 && !!username2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCommonFreeTimes(usernames: string[]) {
  return useQuery({
    queryKey: QUERY_KEYS.commonFreeTimes(usernames),
    queryFn: () => findCommonFreeTimesByUsername(usernames),
    enabled: usernames.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUserFreeAt(username: string, day: number, time: string) {
  return useQuery({
    queryKey: QUERY_KEYS.userFreeAt(username, day, time),
    queryFn: () => isUserFreeAtByUsername(username, day, time),
    enabled: !!username && !!day && !!time,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFriendsFreeTime() {
  return useQuery({
    queryKey: QUERY_KEYS.friendsFreeTime,
    queryFn: findFriendsFreeTime,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useStoreContents() {
  return useQuery({
    queryKey: QUERY_KEYS.storeContents,
    queryFn: viewStoreContents,
    enabled: false, // Only fetch when manually triggered
  });
}

// ============= MUTATIONS =============

export function useSetCurrentUser() {
  const queryClient = useQueryClient();
  const { syncCurrentUser } = useTimetableStore();

  return useMutation({
    mutationFn: setCurrentUser,
    onSuccess: (_, username) => {
      // Invalidate and refetch current user queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentUser });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.currentUserTimetable,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendsFreeTime });

      // Update Zustand store
      syncCurrentUser(username);
    },
  });
}

export function useAddFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addFriend,
    onSuccess: () => {
      // Invalidate friends list and related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendsList });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendsFreeTime });
    },
  });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFriend,
    onSuccess: (_, username) => {
      // Invalidate friends list and related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendsList });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendsFreeTime });

      // Remove timetable cache for removed friend
      queryClient.removeQueries({ queryKey: QUERY_KEYS.timetable(username) });
    },
  });
}

export function useSaveTimetable() {
  const queryClient = useQueryClient();
  const { syncCurrentUserTimetable } = useTimetableStore();

  return useMutation({
    mutationFn: saveTimetable,
    onSuccess: async (_, timetable) => {
      // Get current user (storage key)
      const currentUser = await getCurrentUser();

      if (currentUser) {
        // Update cache using current user as key
        queryClient.setQueryData(QUERY_KEYS.timetable(currentUser), timetable);
        queryClient.setQueryData(QUERY_KEYS.currentUserTimetable, timetable);
        syncCurrentUserTimetable(timetable);
      }

      // Invalidate other related queries
      queryClient.invalidateQueries({ queryKey: ["conflicts"] });
      queryClient.invalidateQueries({ queryKey: ["commonFreeTimes"] });
      queryClient.invalidateQueries({ queryKey: ["userFreeAt"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendsFreeTime });
    },
  });
}

export function useDeleteTimetable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTimetable,
    onSuccess: (_, username) => {
      // Remove all related cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.timetable(username) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendsList });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendsFreeTime });

      // Invalidate conflict and free time queries
      queryClient.invalidateQueries({ queryKey: ["conflicts"] });
      queryClient.invalidateQueries({ queryKey: ["commonFreeTimes"] });
      queryClient.invalidateQueries({ queryKey: ["userFreeAt"] });
    },
  });
}

export function useImportTimetable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importTimetable,
    onSuccess: () => {
      // Invalidate all timetable-related queries since we don't know which user was imported
      queryClient.invalidateQueries({ queryKey: ["timetable"] });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.currentUserTimetable,
      });
      queryClient.invalidateQueries({ queryKey: ["conflicts"] });
      queryClient.invalidateQueries({ queryKey: ["commonFreeTimes"] });
      queryClient.invalidateQueries({ queryKey: ["userFreeAt"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendsFreeTime });
    },
  });
}

export function useExportTimetable() {
  return useMutation({
    mutationFn: exportTimetable,
    // No cache invalidation needed for export
  });
}
