import { motion } from "framer-motion";
import produceImg from "@/assets/produce-flatlay.jpg";
import { useOrders } from "@/hooks/useFarmer";
import { FarmerOrder } from "@/types/api";
import { Icon } from "@/components/freshon/Icon";
import { EmptyState } from "../EmptyState";

const STATUS_TONE: Record<string, string> = {
  New: "bg-primary/25 text-secondary-deep",
  Packing: "bg-secondary/12 text-secondary",
  "In Delivery": "bg-secondary/15 text-secondary",
  Delivered: "bg-muted text-foreground/60",
  Pending: "bg-primary/25 text-secondary-deep",
  Confirmed: "bg-secondary/12 text-secondary",
  Processing: "bg-secondary/12 text-secondary",
  Shipped: "bg-secondary/15 text-secondary",
  Cancelled: "bg-destructive/12 text-destructive",
};

const formatCurrency = (value?: number | string) => {
  const n = Number(value || 0);
  return Number.isFinite(n) ? `Rs ${n.toLocaleString("en-IN")}` : "Rs 0";
};

const statusLabel = (status?: string) => {
  const raw = String(status || "New").toLowerCase();
  if (raw === "confirmed") return "Confirmed";
  if (raw === "processing") return "Processing";
  if (raw === "shipped") return "In Delivery";
  if (raw === "delivered") return "Delivered";
  if (raw === "cancelled") return "Cancelled";
  if (raw === "pending") return "Pending";
  return "New";
};

const orderToCard = (order: FarmerOrder) => {
  const status = statusLabel(order.status);
  return {
    id: order.tracking_id || `#${order.id}`,
    buyer: order.customer_name || order.buyer || "FreshOn customer",
    items: order.items?.length
      ? order.items.map((item) => `${item.quantity || 0} ${item.unit || ""} ${item.product_name || "item"}`.trim()).join(", ")
      : "Order items",
    amt: formatCurrency(order.total),
    status,
    time: order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN") : "Recent",
  };
};

export const ShopScreen = () => {
  const { data: orders, isLoading } = useOrders();
  const cards = orders?.length ? orders.map(orderToCard) : [];
  const newCount = cards.filter((order) => ["New", "Pending", "Confirmed"].includes(order.status)).length;
  const packingCount = cards.filter((order) => order.status === "Processing").length;
  const todayTotal = cards.reduce((sum, order) => sum + (Number.parseFloat(order.amt.replace(/[^\d.]/g, "")) || 0), 0);

  return (
    <main className="px-5 pt-6 space-y-5">
      <section>
        <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">Marketplace</p>
        <h3 className="text-2xl font-extrabold tracking-tight">
          {isLoading ? "Loading Orders" : "Live Orders"}
        </h3>
      </section>

      {cards.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { v: String(newCount), l: "New" },
            { v: String(packingCount), l: "Packing" },
            { v: formatCurrency(todayTotal), l: "Today" },
          ].map((s) => (
            <div key={s.l} className="glass rounded-2xl p-3 text-center">
              <p className="text-xl font-extrabold tabular-nums">{s.v}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/55">{s.l}</p>
            </div>
          ))}
        </div>
      )}

      {cards.length > 0 ? (
        <div className="space-y-3">
          {cards.map((o) => (
            <motion.div
              key={o.id}
              whileTap={{ scale: 0.99 }}
              className="glass rounded-2xl p-4 flex items-center gap-3"
            >
              <img src={produceImg} alt="" className="size-14 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-extrabold text-sm">{o.id}</p>
                  <span className="text-[10px] font-medium text-foreground/40">- {o.time}</span>
                </div>
                <p className="text-xs font-bold text-foreground/80 truncate">{o.buyer}</p>
                <p className="text-[11px] font-medium text-foreground/55 truncate">{o.items}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <p className="font-extrabold text-secondary text-sm tabular-nums">{o.amt}</p>
                <span className={`pill ${STATUS_TONE[o.status] || STATUS_TONE.New}`}>
                  <Icon name="circle" className="text-[6px]" filled />
                  {o.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="shopping_bag"
          title="No orders yet"
          description="When customers order your products, they'll appear here. Add products to your inventory first!"
        />
      )}
    </main>
  );
};
