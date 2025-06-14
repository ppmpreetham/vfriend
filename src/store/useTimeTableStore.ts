import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { CompactTimetable } from "../types/timeTable";

interface TimetableStore {
  // Cached data (synced with React Query)
  currentUser: string | null;
  currentUserTimetable: CompactTimetable | null;
  friendsList: string[];

  // UI state
  selectedFriends: string[];
  viewMode: "week" | "day";
  selectedDay: number;
  showConflicts: boolean;
  isComparingTimetables: boolean;
  compareUsers: string[];

  // Actions for UI state
  setSelectedFriends: (friends: string[]) => void;
  toggleFriendSelection: (username: string) => void;
  setViewMode: (mode: "week" | "day") => void;
  setSelectedDay: (day: number) => void;
  setShowConflicts: (show: boolean) => void;
  setIsComparingTimetables: (comparing: boolean) => void;
  setCompareUsers: (users: string[]) => void;
  addCompareUser: (username: string) => void;
  removeCompareUser: (username: string) => void;

  // Sync actions (called by React Query)
  syncCurrentUser: (user: string) => void;
  syncCurrentUserTimetable: (timetable: CompactTimetable | null) => void;
  syncFriendsList: (friends: string[]) => void;

  // Utility actions
  resetUI: () => void;
  resetAll: () => void;
}

const initialState = {
  // Cached data
  currentUser: null,
  currentUserTimetable: null,
  friendsList: [],

  // UI state
  selectedFriends: [],
  viewMode: "week" as const,
  selectedDay: 1, // Monday
  showConflicts: false,
  isComparingTimetables: false,
  compareUsers: [],
};

export const useTimetableStore = create<TimetableStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // UI state actions
      setSelectedFriends: (friends) =>
        set({ selectedFriends: friends }, false, "setSelectedFriends"),

      toggleFriendSelection: (username) =>
        set(
          (state) => {
            const isSelected = state.selectedFriends.includes(username);
            const newSelectedFriends = isSelected
              ? state.selectedFriends.filter((f) => f !== username)
              : [...state.selectedFriends, username];

            return { selectedFriends: newSelectedFriends };
          },
          false,
          "toggleFriendSelection"
        ),

      setViewMode: (mode) => set({ viewMode: mode }, false, "setViewMode"),

      setSelectedDay: (day) =>
        set({ selectedDay: day }, false, "setSelectedDay"),

      setShowConflicts: (show) =>
        set({ showConflicts: show }, false, "setShowConflicts"),

      setIsComparingTimetables: (comparing) =>
        set(
          { isComparingTimetables: comparing },
          false,
          "setIsComparingTimetables"
        ),

      setCompareUsers: (users) =>
        set({ compareUsers: users }, false, "setCompareUsers"),

      addCompareUser: (username) =>
        set(
          (state) => {
            if (!state.compareUsers.includes(username)) {
              return { compareUsers: [...state.compareUsers, username] };
            }
            return state;
          },
          false,
          "addCompareUser"
        ),

      removeCompareUser: (username) =>
        set(
          (state) => ({
            compareUsers: state.compareUsers.filter((u) => u !== username),
          }),
          false,
          "removeCompareUser"
        ),

      // Sync actions
      syncCurrentUser: (user) =>
        set({ currentUser: user }, false, "syncCurrentUser"),

      syncCurrentUserTimetable: (timetable) =>
        set(
          { currentUserTimetable: timetable },
          false,
          "syncCurrentUserTimetable"
        ),

      syncFriendsList: (friends) =>
        set({ friendsList: friends }, false, "syncFriendsList"),

      // Utility actions
      resetUI: () =>
        set(
          {
            selectedFriends: [],
            viewMode: "week",
            selectedDay: 1,
            showConflicts: false,
            isComparingTimetables: false,
            compareUsers: [],
          },
          false,
          "resetUI"
        ),

      resetAll: () => set(initialState, false, "resetAll"),
    }),
    {
      name: "timetable-store",
    }
  )
);

// Selectors for computed values
export const selectCurrentUserInfo = (state: TimetableStore) => ({
  user: state.currentUser,
  timetable: state.currentUserTimetable,
});

export const selectUIState = (state: TimetableStore) => ({
  selectedFriends: state.selectedFriends,
  viewMode: state.viewMode,
  selectedDay: state.selectedDay,
  showConflicts: state.showConflicts,
  isComparingTimetables: state.isComparingTimetables,
  compareUsers: state.compareUsers,
});

export const selectCachedData = (state: TimetableStore) => ({
  currentUser: state.currentUser,
  currentUserTimetable: state.currentUserTimetable,
  friendsList: state.friendsList,
});
