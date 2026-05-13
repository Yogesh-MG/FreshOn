import { create } from "zustand";

interface UIStore {
  isAuthModalOpen: boolean;
  authModalTab: "login" | "signup";
  openAuthModal: (tab?: "login" | "signup") => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: "login" | "signup") => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isAuthModalOpen: false,
  authModalTab: "login",
  openAuthModal: (tab = "login") => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setAuthModalTab: (tab) => set({ authModalTab: tab }),
}));
