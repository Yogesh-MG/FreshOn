import { motion } from "framer-motion";
import { Icon } from "@/components/freshon/Icon";
import { FarmerOrder } from "@/types/api";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

interface Props {
  order: FarmerOrder;
  onClose: () => void;
  onMarkPacked: (orderId: string | number) => Promise<void>;
  onRequestPickup: (orderId: string | number) => Promise<void>;
  isUpdating: boolean;
}

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
  if (raw === "pickup_requested") return "Pickup Requested";
  return "New";
};

export const OrderDetailSheet = ({ order, onClose, onMarkPacked, onRequestPickup, isUpdating }: Props) => {
  const { t } = useTranslation();
  const [showManifest, setShowManifest] = useState(false);
  const [localStatus, setLocalStatus] = useState(order.status);

  const status = statusLabel(localStatus);
  const canPack = ["New", "Pending", "Confirmed", "Processing"].includes(status);
  const canRequestPickup = status === "Packed";

  const handleMarkPacked = async () => {
    await onMarkPacked(order.id);
    setLocalStatus("packed");
  };

  const handleRequestPickup = async () => {
    await onRequestPickup(order.id);
    setLocalStatus("pickup_requested");
  };

  const manifestData = {
    trackingId: order.tracking_id || `FRSH-${order.id}`,
    items: order.items || [],
    customer: order.customer_name || order.buyer || "FreshOn Customer",
    date: order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN"),
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed md:absolute inset-0 z-40 bg-secondary-deep/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed md:absolute bottom-0 left-0 right-0 z-50 bg-background rounded-t-[32px] shadow-deep max-h-[90%] overflow-hidden flex flex-col"
      >
        <div className="px-6 pt-3 pb-2 flex justify-center">
          <div className="h-1.5 w-12 rounded-full bg-muted" />
        </div>
        
        <div className="px-6 pb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">{t("shop.orderDetails")}</p>
            <h3 className="text-2xl font-extrabold tracking-tight">{order.tracking_id || `#${order.id}`}</h3>
          </div>
          <button onClick={onClose} className="size-10 rounded-full glass flex items-center justify-center tap">
            <Icon name="close" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-8 space-y-5">
          {/* Status badge */}
          <div className="flex items-center gap-3">
            <span className={`pill ${status === "Packed" ? "bg-secondary/12 text-secondary" : status === "Pickup Requested" ? "bg-primary/25 text-secondary-deep" : "bg-secondary/10 text-secondary"}`}>
              <span className={`size-1.5 rounded-full ${status === "Packed" ? "bg-secondary" : "bg-primary-foreground animate-pulse"}`} />
              {status}
            </span>
            <span className="text-xs text-foreground/50 font-medium">
              {order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN") : ""}
            </span>
          </div>

          {/* Customer */}
          <div className="glass rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1">Customer</p>
            <p className="font-bold text-foreground">{order.customer_name || order.buyer || "FreshOn Customer"}</p>
          </div>

          {/* Items */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">{t("shop.items")}</p>
            <div className="space-y-2">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="glass rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <Icon name="restaurant" className="text-secondary text-sm" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{item.product_name || "Product"}</p>
                      <p className="text-[11px] text-foreground/50">{item.quantity} {item.unit}</p>
                    </div>
                  </div>
                  <p className="font-extrabold text-sm text-secondary">{formatCurrency(Number(item.price) * Number(item.quantity || 1))}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="glass rounded-2xl p-4 flex items-center justify-between">
            <p className="font-bold text-sm">{t("dashboard.totalEarnings")}</p>
            <p className="text-2xl font-extrabold text-secondary">{formatCurrency(order.total)}</p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            {canPack && (
              <button
                onClick={handleMarkPacked}
                disabled={isUpdating}
                className="h-14 rounded-2xl bg-secondary text-background font-bold text-sm flex items-center justify-center gap-2 tap disabled:opacity-50"
              >
                <Icon name="inventory_2" className="text-base" filled />
                {isUpdating ? t("common.loading") : t("shop.markPacked")}
              </button>
            )}
            {canRequestPickup && (
              <button
                onClick={handleRequestPickup}
                disabled={isUpdating}
                className="h-14 rounded-2xl bg-gradient-golden text-secondary-deep font-bold text-sm flex items-center justify-center gap-2 tap disabled:opacity-50"
              >
                <Icon name="local_shipping" className="text-base" filled />
                {isUpdating ? t("common.loading") : t("shop.requestPickup")}
              </button>
            )}
            <button
              onClick={() => setShowManifest(true)}
              className="h-14 rounded-2xl bg-primary/10 text-secondary-deep font-bold text-sm flex items-center justify-center gap-2 tap"
            >
              <Icon name="receipt_long" className="text-base" />
              {t("shop.generateManifest")}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Manifest Overlay */}
      {showManifest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-background flex flex-col"
        >
          <header className="px-5 h-16 flex items-center gap-4 border-b border-border/60">
            <button onClick={() => setShowManifest(false)} className="size-10 rounded-xl glass flex items-center justify-center tap">
              <Icon name="arrow_back" />
            </button>
            <h1 className="text-xl font-bold">{t("shop.manifestTitle")}</h1>
          </header>
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex flex-col items-center p-4 bg-white rounded-2xl shadow-sm">
                <QRCodeSVG value={manifestData.trackingId} size={160} level="M" />
                <p className="text-xs font-mono mt-2 text-foreground/60">{manifestData.trackingId}</p>
              </div>
            </div>
            <div className="glass rounded-2xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-foreground/50 font-bold uppercase">{t("shop.trackingId")}</span>
                <span className="text-sm font-bold">{manifestData.trackingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-foreground/50 font-bold uppercase">Date</span>
                <span className="text-sm font-bold">{manifestData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-foreground/50 font-bold uppercase">Customer</span>
                <span className="text-sm font-bold">{manifestData.customer}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">{t("shop.items")}</p>
              <div className="space-y-2">
                {manifestData.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <span className="text-sm font-medium">{item.product_name}</span>
                    <span className="text-sm font-bold">{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </motion.div>
      )}
    </>
  );
};
