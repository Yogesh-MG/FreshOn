import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Zap, Package, ShoppingCart, X, History } from "lucide-react";
import { useState } from "react";
import api from "@/utils/api";
import { cn } from "@/lib/utils";
import { useMe } from "@/hooks/use-me";

export const QuickShopWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: user } = useMe();

  const { data: orders = [] } = useQuery({
    queryKey: ["orders", "quick-shop"],
    enabled: !!user && isOpen,
    queryFn: () => api.get("/api/orders/orders/").then((res) => res.data.results ?? res.data),
  });

  const completedOrders = orders.filter((order: any) => order.status === "DELIVERED");

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 active:scale-95",
          isOpen ? "bg-background text-foreground rotate-90" : "bg-forest text-white"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[320px] max-h-[480px] overflow-hidden rounded-2xl bg-background shadow-2xl border border-border animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gradient-to-r from-mint to-forest p-4 text-white">
            <h3 className="font-display text-lg font-bold">Quick Shop</h3>
            <p className="text-xs opacity-90">Reorder your favorites instantly</p>
          </div>

          <div className="overflow-y-auto p-3 max-h-[380px] scrollbar-hidden">
            {orders.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingCart className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No orders yet</p>
              </div>
            ) : completedOrders.length === 0 ? (
              <div className="py-12 text-center">
                <History className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No completed orders found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {completedOrders.slice(0, 5).map((order: any) => (
                  <Link
                    key={order.id || order.tracking_id}
                    to={`/track/${order.tracking_id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-xl bg-surface p-3 hover:bg-mint-soft transition group"
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-white group-hover:bg-mint text-forest group-hover:text-white transition-colors">
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">Order #{order.tracking_id}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()} · ₹{order.total_price}
                      </p>
                    </div>
                    <ShoppingCart className="h-4 w-4 text-mint" />
                  </Link>
                ))}
              </div>
            )}
            
            <Link
              to="/profile?section=orders"
              onClick={() => setIsOpen(false)}
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-surface py-2.5 text-xs font-bold hover:bg-mint-soft transition"
            >
              View all orders
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
