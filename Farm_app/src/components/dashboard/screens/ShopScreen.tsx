import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import produceImg from "@/assets/produce-flatlay.jpg";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useFarmer";
import { FarmerOrder } from "@/types/api";
import { Icon } from "@/components/freshon/Icon";
import { EmptyState } from "../EmptyState";
import { useTranslation } from "react-i18next";
import { OrderDetailSheet } from "../sheets/OrderDetailSheet";

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
  Packed: "bg-secondary/10 text-secondary",
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
  if (raw === "packed") return "Packed";
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
    raw: order,
  };
};

export const ShopScreen = () => {
  const { t } = useTranslation();
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const cards = orders?.length ? orders.map(orderToCard) : [];
  const newCount = cards.filter((order) => ["New", "Pending", "Confirmed"].includes(order.status)).length;
  const packingCount = cards.filter((order) => ["Processing", "Packed"].includes(order.status)).length;
  const todayTotal = cards.reduce((sum, order) => sum + (Number.parseFloat(order.amt.replace(/[^\d.]/g, "")) || 0), 0);
  const [selectedOrder, setSelectedOrder] = useState<FarmerOrder | null>(null);

  const handleMarkPacked = async (orderId: string | number) => {
    await updateStatus.mutateAsync({ orderId, status: "packed" });
  };

  const handleRequestPickup = async (orderId: string | number) => {
    await updateStatus.mutateAsync({ orderId, status: "pickup_requested" });
  };

  return (
    <>
      <main className="px-5 pt-6 space-y-5 pb-24">
        <section>
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">{t("shop.marketplace")}</p>
          <h3 className="text-2xl font-extrabold tracking-tight">
            {isLoading ? t("shop.loadingOrders") : t("shop.liveOrders")}
          </h3>
        </section>

        {cards.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { v: String(newCount), l: t("shop.new") },
              { v: String(packingCount), l: t("shop.packing") },
              { v: formatCurrency(todayTotal), l: t("shop.today") },
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
              <motion.button
                key={o.id}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedOrder(o.raw)}
                className="w-full glass rounded-2xl p-4 flex items-center gap-3 text-left"
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
              </motion.button>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="shopping_bag"
            title={t("shop.noOrders")}
            description={t("shop.noOrdersDesc")}
          />
        )}
      </main>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailSheet
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onMarkPacked={handleMarkPacked}
            onRequestPickup={handleRequestPickup}
            isUpdating={updateStatus.isPending}
          />
        )}
      </AnimatePresence>
    </>
  );
};
