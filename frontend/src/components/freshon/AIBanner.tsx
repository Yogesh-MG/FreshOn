import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export const AIBanner = ({ title, hint, children }: { title: string; hint?: string; children?: ReactNode }) => (
  <section className="rounded-2xl bg-mint-soft p-4">
    <div className="mb-3 flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-forest text-forest-foreground">
        <Sparkles className="h-3.5 w-3.5" />
      </span>
      <div>
        <h3 className="font-display text-sm font-bold text-forest">{title}</h3>
        {hint && <p className="text-xs text-foreground/70">{hint}</p>}
      </div>
    </div>
    {children}
  </section>
);
