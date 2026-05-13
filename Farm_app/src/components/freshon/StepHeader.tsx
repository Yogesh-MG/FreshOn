import { motion } from "framer-motion";
import { Icon } from "./Icon";

interface Props {
  current: number;
  total: number;
  onBack?: () => void;
  label?: string;
}

export const StepHeader = ({ current, total, onBack, label }: Props) => (
  <div className="flex items-center gap-4 px-6 pt-6">
    {onBack ? (
      <button
        onClick={onBack}
        className="size-11 rounded-full glass flex items-center justify-center tap"
        aria-label="Back"
      >
        <Icon name="arrow_back" className="text-secondary-deep text-lg" />
      </button>
    ) : (
      <div className="size-11" />
    )}
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
          {label ?? "Onboarding"}
        </span>
        <span className="text-[11px] font-semibold text-muted-foreground tabular-nums">
          {current} / {total}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-gradient-golden rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(current / total) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  </div>
);
