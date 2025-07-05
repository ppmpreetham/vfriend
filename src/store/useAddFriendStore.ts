import { create } from "zustand";

type AddFriendTab = "main" | "share" | "qr" | "code" | "p2p";

interface AddFriendState {
  activeTab: AddFriendTab;
  friendAdded: boolean;
  setActiveTab: (tab: AddFriendTab) => void;
  goBack: () => void;
  reset: () => void;
  setFriendAdded: (value: boolean) => void;
}

const useAddFriendStore = create<AddFriendState>((set) => ({
  activeTab: "main",
  friendAdded: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  goBack: () => set({ activeTab: "main" }),
  reset: () => set({ activeTab: "main" }),
  setFriendAdded: (value) => set({ friendAdded: value }),
}));

export default useAddFriendStore;
