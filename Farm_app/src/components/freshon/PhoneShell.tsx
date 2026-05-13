import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Mobile-first shell. On small screens it fills the viewport.
 * On larger screens it presents a centered phone-like canvas.
 */
export const PhoneShell = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className="min-h-dvh w-full bg-background md:bg-gradient-to-br md:from-muted md:to-background md:flex md:items-center md:justify-center md:py-8">
    <div
      className={cn(
        "relative w-full min-h-dvh md:min-h-[860px] md:max-w-[440px] md:rounded-[44px] md:shadow-deep md:overflow-hidden md:border md:border-white/60 bg-background",
        className
      )}
    >
      {children}
    </div>
  </div>
);
