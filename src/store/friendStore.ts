import { create } from "zustand";

interface FriendStoreState {
  selectedFriendRegNumber: string | null;
  isViewingFriend: boolean;
  selectFriend: (registrationNumber: string) => void;
  clearSelectedFriend: () => void;
}

export const useFriendStore = create<FriendStoreState>((set) => ({
  selectedFriendRegNumber: null,
  isViewingFriend: false,
  selectFriend: (registrationNumber) =>
    set({
      selectedFriendRegNumber: registrationNumber,
      isViewingFriend: true,
    }),
  clearSelectedFriend: () =>
    set({
      selectedFriendRegNumber: null,
      isViewingFriend: false,
    }),
}));
