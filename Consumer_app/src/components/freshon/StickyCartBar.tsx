import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";

export const StickyCartBar = ({ ctaLabel = "View Cart", to = "/cart" }: { ctaLabel?: string; to?: string }) => {
  const count = useCart((s) => s.count());
  const subtotal = useCart((s) => s.subtotal());
  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-[64px] z-50 animate-slide-up px-4 md:bottom-6 md:px-6">
      <Link
        to={to}
        className="mx-auto flex max-w-lg items-center justify-between rounded-2xl bg-forest px-4 py-4 text-forest-foreground shadow-cta transition-all hover:scale-[1.02] active:scale-95"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-mint">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="text-xs opacity-80">{count} item{count > 1 ? "s" : ""}</div>
            <div className="font-display text-base font-bold">₹{subtotal}</div>
          </div>
        </div>
        <span className="rounded-full bg-mint px-4 py-2 text-sm font-semibold">{ctaLabel} →</span>
      </Link>
    </div>
  );
};
