import { motion } from "framer-motion";
import { useState } from "react";
import { StepHeader } from "../freshon/StepHeader";
import { Icon } from "@/components/freshon/Icon";
import founderPoster from "@/assets/founder-poster.jpg";

export const FounderStep = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const [playing, setPlaying] = useState(false);

  return (
    <motion.div
      key="founder"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="min-h-dvh md:min-h-[860px] flex flex-col"
    >
      <StepHeader current={2} total={6} onBack={onBack} label="Founder's Mission" />

      <div className="px-7 pt-8 flex-1 flex flex-col">
        <span className="pill bg-secondary/10 text-secondary w-fit">
          <Icon name="favorite" className="text-sm" filled />
          A Personal Note
        </span>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground leading-tight">
          A Message from <span className="text-secondary">Sattya</span>
        </h2>
        <p className="mt-2 text-foreground/60 font-medium">
          Founder & Chief Cultivator, FreshOn
        </p>

        {/* Video player */}
        <div className="mt-8 relative rounded-[28px] overflow-hidden aspect-[4/5] shadow-deep">
          <img
            src={founderPoster}
            alt="Founder holding soil with sprout"
            className="w-full h-full object-cover"
            loading="lazy"
            width={1024}
            height={576}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary-deep via-secondary-deep/20 to-transparent" />

          {/* Play */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setPlaying((p) => !p)}
            className="absolute inset-0 m-auto size-20 rounded-full bg-primary shadow-glow flex items-center justify-center"
            aria-label={playing ? "Pause" : "Play"}
          >
            <Icon
              name={playing ? "pause" : "play_arrow"}
              className="text-secondary-deep text-4xl"
              filled
              weight={600}
            />
          </motion.button>

          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-background">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              {playing ? "Now playing" : "1 min 24 sec"}
            </div>
            <p className="font-semibold text-balance leading-snug">
              "Every farmer who joins us is a guardian of the soil. Together, we feed families with truth."
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-6" />

        <button
          onClick={onNext}
          className="w-full h-16 rounded-full bg-gradient-forest text-background font-semibold text-base shadow-deep flex items-center justify-center gap-2 tap mb-6"
        >
          Continue
          <Icon name="arrow_forward" weight={600} />
        </button>
      </div>
    </motion.div>
  );
};
