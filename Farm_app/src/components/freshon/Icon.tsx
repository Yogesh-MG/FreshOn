import { cn } from "@/lib/utils";

interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
  weight?: 300 | 400 | 500 | 600 | 700;
}

export const Icon = ({ name, className, filled, weight = 400 }: IconProps) => (
  <span
    className={cn("material-symbols-outlined select-none", className)}
    style={{
      fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
    }}
  >
    {name}
  </span>
);
