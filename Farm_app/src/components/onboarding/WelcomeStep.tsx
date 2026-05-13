import farmHero from "@/assets/farm-hero.jpg";
import { motion } from "framer-motion";
import { Icon } from "@/components/freshon/Icon";

export const WelcomeStep = ({ onNext }: { onNext: () => void }) => {
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
            Welcome to FreshOn
          </span>
          <h1 className="text-[2.4rem] leading-[1.05] font-extrabold tracking-tight text-foreground text-balance">
            Thank you for being an organic farmer.
            <span className="block text-secondary mt-1">You are the heart of FreshOn.</span>
          </h1>
          <p className="mt-5 text-foreground/70 text-pretty leading-relaxed max-w-[34ch] font-medium">
            A premium platform built to honor your craft and connect your harvest with the families who cherish it.
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
          Begin Journey
          <span className="size-9 rounded-full bg-primary flex items-center justify-center text-secondary-deep transition-transform group-hover:translate-x-1">
            <Icon name="arrow_forward" className="text-base" weight={600} />
          </span>
        </motion.button>

        <p className="text-center text-xs text-foreground/50 font-medium">
          By continuing you agree to our farm partnership terms
        </p>
      </div>
    </motion.div>
  );
};
