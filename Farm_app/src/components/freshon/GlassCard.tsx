import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "light" | "dark" | "solid";
  interactive?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "light", interactive = false, children, ...props }, ref) => {
    const base =
      variant === "dark"
        ? "glass-dark text-background"
        : variant === "solid"
        ? "bg-card border border-border shadow-soft"
        : "glass";
    return (
      <motion.div
        ref={ref}
        whileTap={interactive ? { scale: 0.98 } : undefined}
        className={cn(
          "rounded-[24px] p-6",
          base,
          interactive && "cursor-pointer transition-shadow hover:shadow-deep",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";
