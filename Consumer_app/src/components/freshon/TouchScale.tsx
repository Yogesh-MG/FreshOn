import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TouchScaleProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

/**
 * A wrapper that adds a subtle scale-down effect when touched/clicked,
 * giving a "haptic" or "physical" feel to interactive elements.
 */
export const TouchScale = ({ children, className = "", scale = 0.96 }: TouchScaleProps) => {
  return (
    <motion.div
      whileTap={{ scale }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
