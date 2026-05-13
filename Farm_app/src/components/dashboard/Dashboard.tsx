import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "./EmptyState";
import produceImg from "@/assets/produce-flatlay.jpg";
import { useAuth } from "@/context/AuthContext";
import { useBatches, useCreateBatch, useDashboard, useProfile } from "@/hooks/useFarmer";
import { toast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/services/api";
import { Batch, CreateBatchPayload } from "@/types/api";
import { Icon } from "@/components/freshon/Icon";
import { NotificationsDrawer } from "./NotificationsDrawer";
import { ProfileScreen } from "./screens/ProfileScreen";
import { ShopScreen } from "./screens/ShopScreen";
import { WalletScreen } from "./screens/WalletScreen";
import { AddProductSheet } from "./sheets/AddProductSheet";
import { ManageDeliverySheet } from "./sheets/ManageDeliverySheet";
import { Product, ProductStatus } from "./types";


interface Props {
  onSignOut: () => void;
  farmerName?: string;
}

type Tab = "home" | "shop" | "wallet" | "profile";
type SheetState =
  | { kind: "none" }
  | { kind: "add"; mode: "product" | "harvest" }
  | { kind: "manage"; product: Product };

const formatCurrency = (value?: number | string) => {
  const n = Number(value || 0);
  return Number.isFinite(n) ? `Rs ${n.toLocaleString("en-IN")}` : "Rs 0";
};

const statusFromBatch = (status?: string): ProductStatus => {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("pending")) return "Pending";
  if (normalized.includes("deliver")) return "In Delivery";
  if (normalized.includes("sold") || normalized.includes("completed")) return "Delivered";
  if (normalized.includes("out") || normalized.includes("expired")) return "Out";
  if (normalized.includes("approved")) return "Approved";
  return "Live";
};

const batchToProduct = (batch: Batch): Product => {
  const unit = batch.unit || "kg";
  const quantity = batch.quantity ?? batch.stock ?? 0;
  const price = batch.price_per_unit ?? batch.price ?? 0;

  return {
    id: String(batch.id),
    productId: batch.product_id,
    name: String(batch.product_name || batch.crop_name || batch.name || "Fresh produce"),
    category: batch.category || "Produce",
    price: `Rs ${price}/${unit}`,
    unit,
    stock: `${quantity} ${unit}`,
    harvestDate: batch.harvest_date,
    description: batch.description,
    image: batch.image || produceImg,
    status: statusFromBatch(batch.status),
  };
};

const productToBatchPayload = (product: Product) => {
  const payload: Record<string, unknown> = {
    product_id: Number(product.productId || product.id) || 0,
    stock_level: Number.parseFloat(product.stock) || 0,
    price: Number.parseFloat(product.price.replace(/[^\d.]/g, "")) || 0,
    harvest_date: product.harvestDate ? new Date(product.harvestDate).toISOString() : new Date().toISOString(),
    is_organic: true,
  };

  // If this is a custom product (not from the catalog), pass the name
  if (product.customProductName) {
    payload.custom_product_name = product.customProductName;
    payload.product_id = 0;
  }

  return payload;
};

export const Dashboard = ({ onSignOut, farmerName = "Ramesh" }: Props) => {
  const { logout, user } = useAuth();
  const { data: profile } = useProfile();
  const { data: dashboard } = useDashboard();
  const { data: batches, isLoading: batchesLoading } = useBatches();
  const createBatch = useCreateBatch();
  const [range, setRange] = useState<"7d" | "30d">("7d");
  const [notifOpen, setNotifOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [sheet, setSheet] = useState<SheetState>({ kind: "none" });

  const displayName = profile?.name || user?.name || user?.username || farmerName;
  const liveProducts = batches?.length ? batches.map(batchToProduct) : [];
  const hasChartData = dashboard?.sales_7d?.length || dashboard?.sales_30d?.length;
  const chart7 = dashboard?.sales_7d?.length ? dashboard.sales_7d : [];
  const chart30 = dashboard?.sales_30d?.length ? dashboard.sales_30d : [];
  const recentTransactions = dashboard?.recent_transactions?.length
    ? dashboard.recent_transactions.map((t) => ({
        id: String(t.id),
        desc: t.description || t.desc || "Farmer transaction",
        amt: `${t.type === "debit" ? "-" : "+"}${formatCurrency(t.amount)}`,
        date: t.date || (t.created_at ? new Date(t.created_at).toLocaleDateString("en-IN") : ""),
        in: t.type !== "debit",
      }))
    : [];

  const handleAdd = async (p: Product) => {
    try {
      await createBatch.mutateAsync(productToBatchPayload(p) as CreateBatchPayload);
      setSheet({ kind: "none" });
      toast({ title: "Submitted for approval", description: `${p.name} is pending FreshOn quality review.` });
    } catch (error) {
      setSheet({ kind: "none" });
      toast({
        title: "Error",
        description: getApiErrorMessage(error, "Could not add product. Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleSaveDelivery = (p: Product) => {
    setSheet({ kind: "none" });
    toast({ title: "Status updated", description: `${p.name} -> ${p.status}` });
  };

  const openManage = (p: Product) => {
    if (p.status === "Pending") {
      toast({ title: "Awaiting approval", description: "FreshOn is reviewing this product." });
      return;
    }
    setSheet({ kind: "manage", product: p });
  };

  const signOut = () => {
    logout();
    onSignOut();
  };

  return (
    <div className="min-h-dvh md:min-h-[860px] bg-background pb-24 relative">
      <header className="sticky top-0 z-30 px-5 pt-6 pb-4 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="size-12 rounded-2xl bg-gradient-golden flex items-center justify-center font-extrabold text-secondary-deep text-lg shadow-glow">
              {displayName[0]}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-secondary border-2 border-background" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 rounded-full bg-secondary animate-ping opacity-75" />
                <span className="relative rounded-full bg-secondary size-1.5" />
              </span>
              Live - Verified
            </p>
            <h1 className="text-base font-extrabold tracking-tight text-foreground truncate">
              Namaste, {displayName}
            </h1>
          </div>
          <button onClick={() => setNotifOpen(true)} className="relative size-11 rounded-full glass flex items-center justify-center tap">
            <Icon name="notifications" className="text-secondary text-lg" weight={500} />
            {dashboard?.unread_notifications_count !== undefined && dashboard.unread_notifications_count > 0 && (
              <span className="absolute top-1.5 right-1.5 size-5 rounded-full bg-destructive border-2 border-background flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                {dashboard.unread_notifications_count > 9 ? '9+' : dashboard.unread_notifications_count}
              </span>
            )}
          </button>
          <button onClick={signOut} className="size-11 rounded-full glass flex items-center justify-center tap" aria-label="Sign out">
            <Icon name="logout" className="text-foreground/60 text-lg" />
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {tab === "home" && (
          <motion.div key="home" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <main className="px-5 pt-6 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-[28px] p-6 overflow-hidden bg-gradient-forest text-background shadow-deep"
              >
                <div className="absolute -top-12 -right-12 size-44 rounded-full bg-primary/30 blur-3xl" />
                <div className="absolute -bottom-16 -left-8 size-44 rounded-full bg-primary/15 blur-3xl" />
                <div className="relative flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Total Earnings</span>
                  <span className="pill bg-primary text-secondary-deep">
                    <Icon name="trending_up" className="text-sm" weight={700} />
                    +24.8%
                  </span>
                </div>
                <div className="relative flex items-baseline gap-2 mt-2">
                  <span className="text-5xl font-extrabold tracking-tight tabular-nums">
                    {formatCurrency(dashboard?.total_sales ?? dashboard?.lifetime_earnings ?? dashboard?.total_earnings ?? 0)}
                  </span>
                </div>
                <p className="relative mt-2 text-background/70 text-sm font-medium">
                  <span className="text-primary font-bold">{formatCurrency(dashboard?.monthly_earnings ?? dashboard?.current_month_earnings ?? 0)}</span> earned this month
                </p>
                <div className="relative mt-6 flex gap-3">
                  <button onClick={() => setTab("wallet")} className="flex-1 h-12 rounded-full bg-primary text-secondary-deep font-bold text-sm tap flex items-center justify-center gap-2">
                    <Icon name="account_balance_wallet" className="text-base" filled weight={600} />
                    Withdraw
                  </button>
                  <button onClick={() => setTab("wallet")} className="h-12 px-5 rounded-full bg-background/15 border border-background/20 text-background font-semibold text-sm tap flex items-center gap-2">
                    <Icon name="receipt_long" className="text-base" />
                    History
                  </button>
                </div>
              </motion.div>

              <div className="grid grid-cols-2 gap-3">
                <StatTile icon="shopping_basket" label="Orders" value={String(dashboard?.total_orders ?? 0)} delta="+12" tone="primary" />
                <StatTile
                  icon="inventory_2"
                  label="Products"
                  value={String(dashboard?.total_products ?? liveProducts.length)}
                  delta={`${liveProducts.filter((p) => p.status === "Live" || p.status === "Approved").length} live`}
                  tone="secondary"
                />
              </div>

              <section className="rounded-[28px] glass p-5">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">Sales Volume</p>
                    <h3 className="text-lg font-extrabold tracking-tight text-foreground">
                      {range === "7d" ? "Last 7 days" : "Last 30 days"}
                    </h3>
                  </div>
                  <div className="flex p-1 rounded-full bg-muted text-xs font-bold">
                    {(["7d", "30d"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setRange(r)}
                        className={`px-3 py-1.5 rounded-full transition-all ${range === r ? "bg-secondary text-background shadow-sm" : "text-foreground/60"}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                {hasChartData ? (
                  <div className="h-44 mt-3 -ml-3">
                    <ResponsiveContainer width="100%" height="100%">
                      {range === "7d" ? (
                        <LineChart data={chart7}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 600 }} />
                          <YAxis hide />
                          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12, fontWeight: 600 }} />
                          <Line type="monotone" dataKey="v" stroke="hsl(var(--secondary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 5, strokeWidth: 2, stroke: "hsl(var(--secondary))" }} />
                        </LineChart>
                      ) : (
                        <BarChart data={chart30}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 600 }} />
                          <YAxis hide />
                          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                          <Bar dataKey="v" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState
                    icon="trending_up"
                    title="No sales data yet"
                    description="Your sales analytics will appear here once you get your first orders."
                  />
                )}
              </section>

              <section>
                <div className="flex items-center justify-between mb-3 px-1">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">Inventory</p>
                    <h3 className="text-lg font-extrabold tracking-tight">My Products</h3>
                  </div>
                  <span className="text-xs font-bold text-foreground/50">
                    {batchesLoading ? "Loading" : `${liveProducts.length} items`}
                  </span>
                </div>
                {liveProducts.length > 0 ? (
                  <div className="space-y-3">
                    {liveProducts.map((p) => (
                      <motion.button key={p.id} whileTap={{ scale: 0.99 }} onClick={() => openManage(p)} className="w-full glass rounded-[20px] p-3 flex items-center gap-3 text-left">
                        <div className="size-14 rounded-2xl overflow-hidden bg-muted shrink-0">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground text-sm truncate">{p.name}</p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-secondary font-extrabold text-sm tabular-nums">{p.price}</p>
                            <span className="text-[11px] text-foreground/50 font-medium">- {p.stock}</span>
                          </div>
                        </div>
                        <StatusPill status={p.status} />
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon="inventory_2"
                    title="No products yet"
                    description="Add your first product to start selling on FreshOn."
                    action={{
                      label: "Add Product",
                      onClick: () => setSheet({ kind: "add", mode: "product" }),
                    }}
                  />
                )}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button onClick={() => setSheet({ kind: "add", mode: "product" })} className="h-14 rounded-2xl bg-gradient-golden text-secondary-deep font-bold text-sm shadow-glow flex items-center justify-center gap-2 tap">
                    <Icon name="add" className="text-xl" weight={700} />
                    Add Product
                  </button>
                  <button onClick={() => setSheet({ kind: "add", mode: "harvest" })} className="h-14 rounded-2xl bg-secondary text-background font-bold text-sm flex items-center justify-center gap-2 tap">
                    <Icon name="agriculture" className="text-xl" filled />
                    Update Harvest
                  </button>
                </div>
              </section>

              <section className="rounded-[28px] glass p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">Wallet</p>
                    <h3 className="text-lg font-extrabold tracking-tight">Recent Activity</h3>
                  </div>
                  <span className="pill bg-secondary/10 text-secondary">
                    <Icon name="schedule" className="text-sm" />
                    Next payout Fri
                  </span>
                </div>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-2">
                    {recentTransactions.map((t) => (
                      <div key={t.id} className="flex items-center gap-3 py-2">
                        <div className={`size-10 rounded-xl flex items-center justify-center ${t.in ? "bg-secondary/10 text-secondary" : "bg-destructive/10 text-destructive"}`}>
                          <Icon name={t.in ? "south_west" : "north_east"} className="text-base" weight={700} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{t.desc}</p>
                          <p className="text-[11px] font-medium text-foreground/50">{t.id} - {t.date}</p>
                        </div>
                        <p className={`text-sm font-extrabold tabular-nums ${t.in ? "text-secondary" : "text-foreground/70"}`}>{t.amt}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon="receipt_long"
                    title="No transactions yet"
                    description="Your wallet activity will appear here once you make your first sale."
                  />
                )}
              </section>
            </main>
          </motion.div>
        )}

        {tab === "shop" && (
          <motion.div key="shop" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ShopScreen />
          </motion.div>
        )}
        {tab === "wallet" && (
          <motion.div key="wallet" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <WalletScreen />
          </motion.div>
        )}
        {tab === "profile" && (
          <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ProfileScreen farmerName={displayName} onSignOut={signOut} />
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed md:absolute bottom-4 left-4 right-4 md:left-3 md:right-3 z-30">
        <div className="glass rounded-full px-2 py-2 flex items-center justify-around shadow-deep">
          <NavBtn icon="dashboard" label="Home" active={tab === "home"} onClick={() => setTab("home")} />
          <NavBtn icon="storefront" label="Shop" active={tab === "shop"} onClick={() => setTab("shop")} />
          <button onClick={() => setSheet({ kind: "add", mode: "product" })} className="size-12 rounded-full bg-gradient-golden text-secondary-deep flex items-center justify-center shadow-glow tap -mt-6">
            <Icon name="add" className="text-2xl" weight={700} />
          </button>
          <NavBtn icon="account_balance_wallet" label="Wallet" active={tab === "wallet"} onClick={() => setTab("wallet")} />
          <NavBtn icon="person" label="Profile" active={tab === "profile"} onClick={() => setTab("profile")} />
        </div>
      </nav>

      <AnimatePresence>
        {notifOpen && <NotificationsDrawer onClose={() => setNotifOpen(false)} />}
        {sheet.kind === "add" && (
          <AddProductSheet mode={sheet.mode} onClose={() => setSheet({ kind: "none" })} onSubmit={handleAdd} />
        )}
        {sheet.kind === "manage" && (
          <ManageDeliverySheet product={sheet.product} onClose={() => setSheet({ kind: "none" })} onSave={handleSaveDelivery} />
        )}
      </AnimatePresence>
    </div>
  );
};

const StatTile = ({
  icon,
  label,
  value,
  delta,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  delta: string;
  tone: "primary" | "secondary";
}) => (
  <div className="glass rounded-[20px] p-4">
    <div className="flex items-center justify-between mb-3">
      <div className={`size-9 rounded-xl flex items-center justify-center ${tone === "primary" ? "bg-primary/20 text-secondary-deep" : "bg-secondary/10 text-secondary"}`}>
        <Icon name={icon} className="text-lg" filled />
      </div>
      <span className="text-[10px] font-bold text-secondary">{delta}</span>
    </div>
    <p className="text-2xl font-extrabold tabular-nums tracking-tight">{value}</p>
    <p className="text-[11px] font-bold uppercase tracking-wider text-foreground/50 mt-0.5">{label}</p>
  </div>
);

const StatusPill = ({ status }: { status: ProductStatus }) => {
  const map: Record<ProductStatus, { c: string; dot: string }> = {
    Live: { c: "bg-secondary/12 text-secondary", dot: "bg-secondary animate-pulse" },
    Approved: { c: "bg-secondary/12 text-secondary", dot: "bg-secondary" },
    "In Delivery": { c: "bg-primary/25 text-secondary-deep", dot: "bg-secondary-deep animate-pulse" },
    Delivered: { c: "bg-muted text-foreground/60", dot: "bg-foreground/40" },
    Pending: { c: "bg-primary/25 text-secondary-deep", dot: "bg-primary-foreground animate-pulse" },
    Out: { c: "bg-destructive/12 text-destructive", dot: "bg-destructive" },
  };
  const s = map[status];

  return (
    <span className={`pill ${s.c}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

const NavBtn = ({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full tap ${active ? "text-secondary" : "text-foreground/50"}`}>
    <Icon name={icon} className="text-xl" filled={active} weight={active ? 600 : 400} />
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);
