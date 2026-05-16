import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Zap, Package, ShoppingCart, X, History } from "lucide-react";
import { useState } from "react";
import api from "@/utils/api";
import { cn } from "@/lib/utils";
import { useMe } from "@/hooks/use-me";
import { ProductCard } from "./ProductCard";

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
        <div className="absolute bottom-16 right-0 w-[340px] max-h-[520px] overflow-hidden rounded-3xl bg-background shadow-2xl border border-border animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gradient-to-r from-mint to-forest p-5 text-white">
            <h3 className="font-display text-xl font-bold">Quick Reorder</h3>
            <p className="text-xs opacity-90">Your past favorites, one tap away</p>
          </div>
          
          <div className="overflow-y-auto p-4 max-h-[420px] scrollbar-hidden">
            {orders.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Past Products Grid */}
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3 flex items-center gap-2">
                    <History className="h-3 w-3" /> Based on your orders
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {(() => {
                      const uniqueProducts = new Map();
                      orders.forEach((order: any) => {
                        order.items?.forEach((item: any) => {
                          if (item.batch && !uniqueProducts.has(item.batch.product_id)) {
                            // Map API batch to ProductCard format
                            uniqueProducts.set(item.batch.product_id, {
                              id: item.batch.product_id,
                              name: item.batch.product_name,
                              price: Number(item.batch.price),
                              mrp: Number(item.batch.mrp),
                              unit: item.batch.variant?.unit || item.unit,
                              image: item.batch.base_image || item.batch.batch_image,
                              organic: item.batch.is_organic,
                              farmFresh: item.batch.is_farm_fresh,
                              harvestDate: item.batch.harvest_date_display,
                              variants: [{
                                id: item.batch.id,
                                unit: item.batch.variant?.unit || item.unit,
                                price: Number(item.batch.price),
                                mrp: Number(item.batch.mrp)
                              }]
                            });
                          }
                        });
                      });

                      const productList = Array.from(uniqueProducts.values()).slice(0, 6);
                      
                      if (productList.length === 0) {
                        return <p className="text-[10px] text-muted-foreground col-span-2 py-4 text-center">Items from your orders will appear here</p>;
                      }

                      return productList.map((product) => (
                        <div key={product.id} className="scale-90 origin-top-left -mr-[10%] -mb-[10%]">
                           <ProductCard product={product} compact />
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                <Link
                  to="/profile?section=orders"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center rounded-2xl bg-surface py-3 text-xs font-bold hover:bg-mint-soft transition border border-border/50"
                >
                  View Order History
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
