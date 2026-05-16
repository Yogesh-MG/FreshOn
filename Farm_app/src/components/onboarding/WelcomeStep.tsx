import farmHero from "@/assets/farm-hero.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/freshon/Icon";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useLanguageStore, SupportedLang } from "@/stores/languageStore";

const LANGUAGES: { id: SupportedLang; native: string }[] = [
  { id: "en", native: "English" },
  { id: "hi", native: "हिन्दी" },
  { id: "kn", native: "ಕನ್ನಡ" },
  { id: "te", native: "తెలుగు" },
];

export const WelcomeStep = ({ onNext }: { onNext: () => void }) => {
  const { t, i18n } = useTranslation();
  const { setLang } = useLanguageStore();
  const [showLangPicker, setShowLangPicker] = useState(false);

  const handleSelectLang = (id: SupportedLang) => {
    setLang(id);
    i18n.changeLanguage(id);
    setShowLangPicker(false);
  };

  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-dvh md:min-h-[860px] flex flex-col"
    >
      {/* Hero image */}
      <div className="absolute inset-0">
        <img
          src={farmHero}
          alt="Sun-drenched organic farm at golden hour"
          className="w-full h-full object-cover"
          width={1024}
          height={1536}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary-deep/40 via-secondary-deep/10 to-background" />
      </div>

      {/* Top brand */}
      <div className="relative z-10 flex items-center gap-2 px-7 pt-12">
        <div className="size-10 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
          <Icon name="compost" className="text-secondary-deep text-xl" filled weight={600} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-background/80">FreshOn</p>
          <p className="text-[11px] font-medium text-background/60">Farmer App</p>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => setShowLangPicker(true)}
          className="size-10 rounded-full glass flex items-center justify-center tap text-background"
        >
          <Icon name="translate" className="text-lg" />
        </button>
      </div>

      <div className="flex-1" />

      {/* Bottom content */}
      <div className="relative z-10 px-7 pb-10 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="pill bg-primary/95 text-secondary-deep mb-5">
            <span className="size-1.5 rounded-full bg-secondary-deep" />
            {t("welcome.tag")}
          </span>
          <h1 className="text-[2.4rem] leading-[1.05] font-extrabold tracking-tight text-foreground text-balance">
            {t("welcome.title")}
            <span className="block text-secondary mt-1">{t("welcome.highlight")}</span>
          </h1>
          <p className="mt-5 text-foreground/70 text-pretty leading-relaxed max-w-[34ch] font-medium">
            {t("welcome.subtitle")}
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="group w-full h-16 rounded-full bg-gradient-forest text-background font-semibold text-base shadow-deep flex items-center justify-center gap-3 tap"
        >
          {t("welcome.cta")}
          <span className="size-9 rounded-full bg-primary flex items-center justify-center text-secondary-deep transition-transform group-hover:translate-x-1">
            <Icon name="arrow_forward" className="text-base" weight={600} />
          </span>
        </motion.button>

        <p className="text-center text-xs text-foreground/50 font-medium">
          {t("welcome.terms")}
        </p>
      </div>

      {/* Language Picker Overlay */}
      <AnimatePresence>
        {showLangPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLangPicker(false)}
              className="fixed inset-0 z-50 bg-secondary-deep/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-[32px] shadow-deep max-h-[70%] overflow-hidden flex flex-col"
            >
              <div className="px-6 pt-3 pb-2 flex justify-center">
                <div className="h-1.5 w-12 rounded-full bg-muted" />
              </div>
              <div className="px-6 pb-4">
                <h3 className="text-2xl font-extrabold tracking-tight">{t("welcome.selectLanguage")}</h3>
                <p className="text-xs text-foreground/50 font-medium mt-1">Choose your preferred language</p>
              </div>
              <div className="overflow-y-auto px-4 pb-8 space-y-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleSelectLang(lang.id)}
                    className="w-full h-16 rounded-2xl border-2 px-5 flex items-center justify-between tap transition-all duration-200 border-border/40 bg-muted/20 hover:border-border"
                  >
                    <div className="text-left">
                      <p className="font-bold text-sm">{lang.native}</p>
                    </div>
                    {i18n.language === lang.id && (
                      <div className="size-6 rounded-full bg-primary flex items-center justify-center text-background">
                        <Icon name="check" className="text-sm font-bold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
