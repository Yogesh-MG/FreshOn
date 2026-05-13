import { ShoppingBag, ChevronRight } from "lucide-react";
import { useCart } from "@/store/cart";
import { Link } from "react-router-dom";

export const StickyCart = () => {
  const count = useCart((s) => s.count());
  const total = useCart((s) => s.subtotal());

  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg animate-slide-up">
      <Link 
        to="/cart"
        className="flex h-16 w-full items-center justify-between gap-4 rounded-2xl bg-forest px-6 py-4 text-white shadow-cta hover:bg-forest/90 transition-all hover:scale-[1.02] active:scale-95"
      >
        <div className="flex items-center gap-4">
          <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/20">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-full bg-harvest px-1 text-[10px] font-bold text-white border-2 border-forest">
              {count}
            </span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">{count} {count === 1 ? "item" : "items"}</p>
            <p className="font-display text-lg font-bold leading-none">₹{total}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider">
          View Cart <ChevronRight className="h-4 w-4" />
        </div>
      </Link>
    </div>
  );
};
