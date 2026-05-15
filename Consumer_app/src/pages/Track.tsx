import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { orders as ordersModule } from "@freshon/api";
import { PageShell } from "@/components/freshon/PageShell";
import { Check, Package, Truck, Home, MapPin, Phone, Trash2, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrderModification } from "@/hooks/useOrderModification";

const Track = () => {
  const { id } = useParams();
  const { removeItem, updateItem, isLoading: isModifying } = useOrderModification();

  // 1. Fetch Order Details
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersModule.getOrder(id!),
    enabled: !!id && id !== "undefined",
    refetchInterval: 10000, // Refresh every 10s for tracking
  });

  // ETA Calculation from backend or fallback
  const eta = order?.eta_minutes || 12;

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
        <div className="flex items-center justify-between">
          <span className="freshon-chip bg-mint-soft text-forest">Order #{id}</span>
          {canModifyOrder && (
            <Link 
              to={`/categories?modify_order_id=${id}`}
              className="flex items-center gap-1.5 text-xs font-bold text-forest hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Add Items
            </Link>
          )}
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold">
          {order?.status === 'DELIVERED' ? 'Order Delivered' : `Arriving in ${eta} minutes`}
        </h1>
        <p className="text-sm text-muted-foreground">
          {order?.status === 'DELIVERED' ? 'Hope you enjoy your fresh produce! 🌿' : 'Your fresh order is on its way 🌿'}
        </p>

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
                <span className="freshon-chip bg-mint-soft text-forest text-[10px] px-2 py-0.5">Modify items before packing</span>
              )}
            </div>

            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={item.id || idx} className="flex items-center justify-between p-3 rounded-lg bg-surface">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.unit} · ₹{item.price} each
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {canModifyOrder ? (
                      <div className="flex items-center gap-2 rounded-full bg-white border border-border p-1">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateItem(id!, item.id, item.quantity - 1);
                            } else {
                              removeItem(id!, item.id);
                            }
                          }}
                          disabled={isModifying}
                          className="grid h-6 w-6 place-items-center rounded-full hover:bg-surface disabled:opacity-50"
                        >
                          {item.quantity === 1 ? <Trash2 className="h-3 w-3 text-destructive" /> : <Minus className="h-3 w-3" />}
                        </button>
                        <span className="text-xs font-bold min-w-[12px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(id!, item.id, item.quantity + 1)}
                          disabled={isModifying}
                          className="grid h-6 w-6 place-items-center rounded-full hover:bg-surface disabled:opacity-50"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-bold">{item.quantity} × ₹{item.price}</span>
                    )}
                    {!canModifyOrder && (
                      <span className="text-sm font-bold ml-2">₹{(Number(item.quantity) * Number(item.price)).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{Number(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">
                  {Number(order.delivery_fee) === 0 ? 'FREE' : `₹${Number(order.delivery_fee).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-forest">₹{Number(order.total || 0).toFixed(2)}</span>
              </div>
            </div>

            {Number(order.wallet_amount_used) > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-mint/10 border border-mint/20">
                <p className="text-xs font-medium text-forest">
                  ₹{Number(order.wallet_amount_used).toFixed(2)} paid from wallet
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
