import { useProfile, useUpdateProfile } from "@/hooks/useFarmer";
import { Icon } from "@/components/freshon/Icon";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useLanguageStore, SupportedLang } from "@/stores/languageStore";

interface Props {
  onBack: () => void;
}

const LANGUAGES: { id: SupportedLang; name: string; native: string }[] = [
  { id: "en", name: "English", native: "English" },
  { id: "hi", name: "Hindi", native: "हिन्दी" },
  { id: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { id: "te", name: "Telugu", native: "తెలుగు" },
];

export const LanguageScreen = ({ onBack }: Props) => {
  const { t, i18n } = useTranslation();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const { setLang } = useLanguageStore();
  const currentLang = (profile?.preferred_language as SupportedLang) || "en";

  const handleSelect = async (id: SupportedLang) => {
    try {
      await updateProfile.mutateAsync({ preferred_language: id });
      setLang(id);
      i18n.changeLanguage(id);
      toast.success(t("profile.language") + " preference updated");
      onBack();
    } catch (error) {
      toast.error("Failed to update language");
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <header className="px-5 h-16 flex items-center gap-4 border-b border-border/60">
        <button onClick={onBack} className="size-10 rounded-xl glass flex items-center justify-center tap">
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-xl font-bold">{t("profile.languageTitle")}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-4 px-1">
          {t("profile.selectLanguage")}
        </p>
        
        <div className="grid gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleSelect(lang.id)}
              className={cn(
                "w-full h-16 rounded-2xl border-2 px-5 flex items-center justify-between tap transition-all duration-200",
                currentLang === lang.id 
                  ? "border-primary bg-primary/5 shadow-md" 
                  : "border-border/40 bg-muted/20 hover:border-border"
              )}
            >
              <div className="text-left">
                <p className="font-bold text-sm">{lang.name}</p>
                <p className="text-xs text-foreground/50">{lang.native}</p>
              </div>
              {currentLang === lang.id && (
                <div className="size-6 rounded-full bg-primary flex items-center justify-center text-background">
                  <Icon name="check" className="text-sm font-bold" />
                </div>
              )}
            </button>
          ))}
        </div>
      </main>

      <footer className="p-10 text-center opacity-30">
        <Icon name="translate" className="text-4xl mb-2" />
        <p className="text-[10px] font-bold uppercase tracking-wider">{t("profile.multilingual")}</p>
      </footer>
    </div>
  );
};
