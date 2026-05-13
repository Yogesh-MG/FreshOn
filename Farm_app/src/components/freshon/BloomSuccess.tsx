import { motion } from "framer-motion";

export const BloomSuccess = ({ label = "Saved" }: { label?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center gap-4 py-6"
  >
    <motion.div
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 14 }}
      className="relative size-24 rounded-full bg-gradient-forest flex items-center justify-center shadow-glow"
    >
      <span className="absolute inset-0 rounded-full bg-secondary/40 animate-pulse-ring" />
      <svg viewBox="0 0 64 64" className="size-12 text-background">
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          d="M16 33 L28 45 L48 22"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
    <p className="font-semibold text-secondary-deep text-lg">{label}</p>
  </motion.div>
);
