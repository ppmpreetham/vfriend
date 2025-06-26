import { create } from "zustand";

type AddFriendTab = "main" | "share" | "qr" | "code" | "p2p";

interface AddFriendState {
  activeTab: AddFriendTab;
  setActiveTab: (tab: AddFriendTab) => void;
  goBack: () => void;
  reset: () => void;
}

const useAddFriendStore = create<AddFriendState>((set) => ({
  activeTab: "main",
  setActiveTab: (tab) => set({ activeTab: tab }),
  goBack: () => set({ activeTab: "main" }),
  reset: () => set({ activeTab: "main" }),
}));

export default useAddFriendStore;
