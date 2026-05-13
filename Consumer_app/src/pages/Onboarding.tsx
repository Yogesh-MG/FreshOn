import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ONBOARDED_KEY = "freshon_onboarded";

type Slide = {
  bg: string; text: string;
  kn?: string[]; en?: string[];
  attribution?: string; quote?: boolean;
  cta?: string;
  emoji?: string;
  stats?: Array<[string, string]>;
};

const slides: Slide[] = [
  {
    bg: "bg-gradient-fresh", text: "text-foreground", emoji: "🌱",
    kn: ["ಬೆಂಗಳೂರಿನ ಅತಿ ದೊಡ್ಡ ಏಕ-ಬ್ರ್ಯಾಂಡ್ ಸಾವಯವ ಸಂಸ್ಥೆಗೆ ಸ್ವಾಗತ", "2014 ರಿಂದ ನಿಮ್ಮ ಆರೋಗ್ಯಕ್ಕಾಗಿ"],
    en: ["Welcome to Bengaluru's biggest single-brand organic company", "Serving honest organic food since 2014"],
  },
  {
    bg: "bg-gradient-forest", text: "text-forest-foreground", quote: true,
    kn: ["ಕೆಲವರಿಗೆ ಇದು ವ್ಯಾಪಾರ ಮಾತ್ರ, ಆದರೆ ನಮಗೆ ಆರೋಗ್ಯಕರ ಆಹಾರದ ಜವಾಬ್ದಾರಿಯು ಕೂಡ."],
    en: ["Others may see a business here. We see a responsibility — to your health, and to the farmer who feeds you."],
    attribution: "— Sattya, Founder & CEO, FreshOn.in",
  },
  {
    bg: "bg-gradient-fresh", text: "text-foreground", emoji: "🥬🥕🌾",
    kn: ["ನಾವು ಬೇರೆ ಬ್ರ್ಯಾಂಡ್‌ಗಳನ್ನು ಮಾರುವುದಿಲ್ಲ — ನಿಜವಾದ ಆರ್ಗಾನಿಕ್ ರೈತರೊಂದಿಗೆ ನಮ್ಮದೇ ಉತ್ಪನ್ನಗಳನ್ನು ಸೃಷ್ಟಿಸುತ್ತೇವೆ."],
    en: ["We don't sell other brands — we work with genuine organic farmers to create our own."],
  },
  {
    bg: "bg-mint-soft", text: "text-foreground", emoji: "🤝",
    kn: ["ನಮ್ಮ ಪ್ರಯತ್ನ — ಗ್ರಾಹಕರನ್ನೂ ರೈತರನ್ನೂ ಬೆಳೆಸುವುದು, ಬಳಸಿಕೊಳ್ಳುವುದಲ್ಲ."],
    en: ["Our purpose — to grow with our customers and farmers, not profit at their expense."],
  },
  {
    bg: "bg-gradient-fresh", text: "text-foreground", emoji: "📖",
    kn: ["ಪ್ರತಿ ಉತ್ಪನ್ನಕ್ಕೂ ಒಂದು ಕಥೆ ಇದೆ.", "ಮೂಲದಿಂದ ನಿಮ್ಮ ಮನೆಯವರೆಗೆ — ಪ್ರತಿ ಹಂತದಲ್ಲೂ ಗುಣಮಟ್ಟ."],
    en: ["Every product has a story. From sourcing to your doorstep — every step honestly tested."],
    stats: [["1,600+", "Products"], ["14", "Categories"], ["10+", "Years"]],
  },
  {
    bg: "bg-gradient-pride", text: "text-forest-foreground", emoji: "👑",
    kn: ["PRIDE ಸದಸ್ಯರಿಗೆ — ನಿಜ MRP ಮೇಲೆ 50% ವರೆಗೂ ಉಳಿತಾಯ. ಪ್ರತಿ ಖರೀದಿಯಲ್ಲೂ."],
    en: ["For those who believe in what we do — PRIDE Membership. Save up to 50% on every purchase."],
  },
  {
    bg: "bg-gradient-forest", text: "text-forest-foreground", emoji: "🌿",
    kn: ["ಸಾವಯವ ಅಡುಗೆಮನೆ — ಆರೋಗ್ಯ ಕುಟುಂಬ."],
    en: ["Organic kitchen. Healthy family."],
    cta: "ಈಗಲೇ ಆರ್ಡರ್ ಮಾಡಿ → / Order Now →",
  },
];

const Onboarding = () => {
  const nav = useNavigate();
  const [i, setI] = useState(0);
  const slide = slides[i];
  const last = i === slides.length - 1;

  const finish = () => {
    localStorage.setItem(ONBOARDED_KEY, "1");
    nav("/welcome", { replace: true });
  };

  return (
    <div className={`min-h-screen ${slide.bg} ${slide.text} flex flex-col relative overflow-hidden`}>
      <div className="flex justify-between items-center px-5 pt-5 z-10 relative">
        <span className="font-display font-bold text-lg">FreshOn<span className="opacity-70">.in</span></span>
        {!last && (
          <button onClick={finish} className="text-sm opacity-80 underline-offset-2 hover:underline">Skip</button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col items-center justify-center px-7 text-center relative"
        >
          {slide.emoji && <div className="text-7xl mb-6">{slide.emoji}</div>}

          {slide.quote ? (
            <>
              <p className="font-kannada font-semibold text-2xl leading-relaxed mb-6">{slide.kn?.[0]}</p>
              <p className="font-serif italic text-base opacity-90 mb-3">{slide.en?.[0]}</p>
              <p className="text-xs opacity-70">{slide.attribution}</p>
            </>
          ) : (
            <>
              <div className="space-y-3 mb-5">
                {slide.kn?.map((k, idx) => (
                  <p key={idx} className={`font-kannada font-bold ${idx === 0 ? "text-2xl" : "text-base opacity-90"} leading-snug`}>{k}</p>
                ))}
              </div>
              <div className="space-y-1.5">
                {slide.en?.map((e, idx) => (
                  <p key={idx} className={`${idx === 0 ? "text-sm font-medium" : "text-xs opacity-75"}`}>{e}</p>
                ))}
              </div>
              {slide.stats && (
                <div className="grid grid-cols-3 gap-2 mt-6 w-full">
                  {slide.stats.map(([n, l]) => (
                    <div key={l} className="bg-white/20 backdrop-blur-sm rounded-xl py-3">
                      <div className="font-display font-bold text-lg">{n}</div>
                      <div className="text-[10px] opacity-80">{l}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="px-7 pb-8 z-10 relative">
        <div className="flex justify-center gap-1.5 mb-5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-current" : "w-1.5 bg-current opacity-30"}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {last ? (
          <button onClick={finish} className="w-full bg-harvest text-harvest-foreground rounded-full py-4 font-display font-bold shadow-lg active:scale-[0.98] transition-transform">
            {slide.cta}
          </button>
        ) : (
          <button onClick={() => setI(i + 1)} className="w-full bg-white/95 text-foreground rounded-full py-4 font-semibold shadow-lg active:scale-[0.98] transition-transform">
            Next →
          </button>
        )}

        {last && (
          <p className="font-kannada text-[10px] text-center mt-4 opacity-70">
            ಇದು ವ್ಯಾಪಾರವಲ್ಲ. ಇದು ಆತ್ಮಸಾಕ್ಷಿ. — This is not commerce. This is conscience.
          </p>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
