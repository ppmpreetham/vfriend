import { create } from "zustand";

type NavTab = "home" | "calendar" | "users" | "profile";

interface NavState {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

const useNavStore = create<NavState>((set) => ({
  activeTab: "home",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

export default useNavStore;
