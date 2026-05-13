import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { orders as ordersModule } from "@freshon/api";
import { PageShell } from "@/components/freshon/PageShell";
import { Check, Package, Truck, Home, MapPin, Phone, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrderModification } from "@/hooks/useOrderModification";

const Track = () => {
  const { id } = useParams();
  const { removeItem, isRemovingItem } = useOrderModification();

  // 1. Fetch Order Details
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersModule.getOrder(id!),
    enabled: !!id && id !== "undefined",
    refetchInterval: 10000, // Refresh every 10s for tracking
  });

  // Check if order can be modified (before packing)
  const canModifyOrder = order && ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status);

  const getStages = (status: string) => [
    { icon: Check, t: "Order placed", time: "Confirmed", done: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(status) },
    { icon: Package, t: "Packed at farm hub", time: "Ready", done: ["PROCESSING", "SHIPPED", "DELIVERED"].includes(status), active: status === "PROCESSING" },
    { icon: Truck, t: "Out for delivery", time: "On the way", done: ["SHIPPED", "DELIVERED"].includes(status), active: status === "SHIPPED" },
    { icon: Home, t: "Delivered", time: "Arrival", done: status === "DELIVERED", active: status === "DELIVERED" },
  ];

  const stages = order ? getStages(order.status) : [];
  return (
    <PageShell>
      <div className="container max-w-2xl pt-6 pb-12">
        <span className="freshon-chip bg-mint-soft text-forest">Order #{id}</span>
        <h1 className="mt-3 font-display text-2xl font-bold">Arriving in <span className="text-forest">12 minutes</span></h1>
        <p className="text-sm text-muted-foreground">Your fresh order is on its way 🌿</p>

        <div className="mt-8 freshon-card p-6">
          <ol className="relative space-y-6">
            <span className="absolute left-[19px] top-2 h-[calc(100%-1rem)] w-px bg-border" />
            {stages.map((s) => (
              <li key={s.t} className="relative flex items-start gap-4">
                <span className={cn("relative z-10 grid h-10 w-10 place-items-center rounded-full",
                  s.done ? "bg-mint text-mint-foreground" : s.active ? "bg-forest text-forest-foreground ring-4 ring-mint-soft" : "bg-surface text-muted-foreground")}>
                  <s.icon className="h-4 w-4" />
                </span>
                <div className="pt-1.5">
                  <p className={cn("font-display text-sm font-semibold", s.active && "text-forest")}>{s.t}</p>
                  <p className="text-xs text-muted-foreground">{s.time}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Order Items Section */}
        {order?.items && order.items.length > 0 && (
          <div className="mt-6 freshon-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-sm font-bold">Order Items</h3>
              {canModifyOrder && (
                <span className="freshon-chip bg-mint-soft text-forest text-xs">Editable</span>
              )}
            </div>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-surface">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} {item.unit} @ ₹{item.price} = ₹{(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                  
                  {canModifyOrder && (
                    <button
                      onClick={() => removeItem(id!, item.id)}
                      disabled={isRemovingItem}
                      className="ml-3 p-2 text-destructive hover:bg-destructive/10 rounded-lg disabled:opacity-50 transition-colors"
                      title="Remove from order"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{order.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">{order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-forest">₹{order.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            {order.wallet_amount_used > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-mint/10 border border-mint/20">
                <p className="text-xs font-medium text-forest">
                  ₹{order.wallet_amount_used.toFixed(2)} paid from wallet
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 freshon-card p-5">
          <h3 className="font-display text-sm font-bold">Delivery partner</h3>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-mint-soft text-lg">🚴</div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Arjun K.</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> 1.2 km away</p>
            </div>
            <button className="grid h-10 w-10 place-items-center rounded-full bg-mint text-mint-foreground"><Phone className="h-4 w-4" /></button>
          </div>
        </div>

        <Link to="/" className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-surface text-sm font-semibold">Continue shopping</Link>
      </div>
    </PageShell>
  );
};

export default Track;
