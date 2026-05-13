import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Zap, Package, ShoppingCart } from "lucide-react";
import { PageShell } from "@/components/freshon/PageShell";
import { useMe } from "@/hooks/use-me";
import api from "@/utils/api";

const QuickShop = () => {
  const { data: profile } = useMe();

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => api.get("/api/orders/orders/").then((res) => res.data.results ?? res.data),
  });

  // Get only completed orders for quick reorder
  const completedOrders = orders.filter((order: any) => order.status === "DELIVERED");

  return (
    <PageShell>
      <div className="container max-w-4xl pt-6 pb-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-b from-mint to-forest text-white">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-forest">Quick Shop</h1>
              <p className="text-sm text-muted-foreground">Reorder from your favorite purchases</p>
            </div>
          </div>
        </div>

        {/* Recent Orders for Reordering */}
        {completedOrders.length === 0 ? (
          <div className="freshon-card flex flex-col items-center justify-center p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="font-semibold text-base mb-1">No completed orders yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Complete an order to quickly reorder</p>
            <Link
              to="/categories"
              className="inline-flex h-10 items-center rounded-full bg-forest px-6 text-sm font-semibold text-forest-foreground hover:bg-forest/90"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="font-display text-base font-bold mb-4">Your order history</h2>
            {completedOrders.map((order: any) => (
              <Link
                key={order.id || order.tracking_id}
                to={`/track/${order.tracking_id}`}
                className="freshon-card flex items-start gap-4 p-4 hover:bg-mint-soft transition"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-mint-soft text-forest flex-shrink-0">
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">Order #{order.tracking_id}</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-forest font-semibold">
                    <ShoppingCart className="h-3 w-3" />
                    Quick reorder
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-forest">₹{order.total_price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default QuickShop;
