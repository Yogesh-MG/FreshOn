import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n from "@/i18n";

export type SupportedLang = "en" | "hi" | "kn" | "te";

interface LanguageState {
  lang: SupportedLang;
  setLang: (lang: SupportedLang) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      lang: "en",
      setLang: (lang) => {
        i18n.changeLanguage(lang);
        set({ lang });
      },
    }),
    {
      name: "freshon-lang",
    }
  )
);
