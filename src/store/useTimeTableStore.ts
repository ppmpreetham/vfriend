import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { CompactTimetable } from "../types/timeTable";

interface TimetableStore {
  // Cached data
  currentUser: string | null;
  currentUserTimetable: CompactTimetable | null;
  friendsList: string[];

  // Core UI state
  selectedDay: number;

  // Essential actions
  setSelectedDay: (day: number) => void;
  syncCurrentUser: (user: string) => void;
  syncCurrentUserTimetable: (timetable: CompactTimetable | null) => void;
  syncFriendsList: (friends: string[]) => void;
  resetAll: () => void;
}

const initialState = {
  // Cached data
  currentUser: null,
  currentUserTimetable: null,
  friendsList: [],

  // UI state
  selectedDay: 1, // Monday
};

export const useTimetableStore = create<TimetableStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setSelectedDay: (day) => set({ selectedDay: day }, false, "setSelectedDay"),

      // Sync actions
      syncCurrentUser: (user) => set({ currentUser: user }, false, "syncCurrentUser"),

      syncCurrentUserTimetable: (timetable) =>
        set({ currentUserTimetable: timetable }, false, "syncCurrentUserTimetable"),

      syncFriendsList: (friends) =>
        set({ friendsList: friends }, false, "syncFriendsList"),

      // Reset everything
      resetAll: () => set(initialState, false, "resetAll"),
    }),
    {
      name: "timetable-store",
    }
  )
);

// Essential selectors
export const selectCurrentUserInfo = (state: TimetableStore) => ({
  user: state.currentUser,
  timetable: state.currentUserTimetable,
});
