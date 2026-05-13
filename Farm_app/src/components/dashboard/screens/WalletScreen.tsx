import { motion } from "framer-motion";
import { useDashboard, usePayouts } from "@/hooks/useFarmer";
import { Icon } from "@/components/freshon/Icon";
import { EmptyState } from "../EmptyState";

const formatCurrency = (value?: number | string) => {
  const n = Number(value || 0);
  return Number.isFinite(n) ? `Rs ${n.toLocaleString("en-IN")}` : "Rs 0";
};

export const WalletScreen = () => {
  const { data: dashboard } = useDashboard();
  const { data: payouts, isLoading } = usePayouts();
  const txns = payouts?.length
    ? payouts.map((payout) => ({
        id: String(payout.transaction_ref || payout.id),
        desc: payout.notes || `Payout ${payout.status || ""}`.trim(),
        amt: `+${formatCurrency(payout.amount)}`,
        date: payout.date || (payout.created_at ? new Date(payout.created_at).toLocaleDateString("en-IN") : ""),
        in: true,
      }))
    : [];

  return (
    <main className="px-5 pt-6 space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[28px] p-6 overflow-hidden bg-gradient-forest text-background shadow-deep"
      >
        <div className="absolute -top-12 -right-12 size-44 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-8 size-44 rounded-full bg-primary/15 blur-3xl" />

        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary relative">
          Available Balance
        </p>
        <p className="relative text-5xl font-extrabold tabular-nums tracking-tight mt-2">
          {formatCurrency(dashboard?.available_balance || dashboard?.pending_payouts || 0)}
        </p>
        <p className="relative text-background/70 text-sm font-medium mt-1">
          Next payout <span className="text-primary font-bold">Friday</span>
        </p>

        <div className="relative mt-5 flex gap-3">
          <button className="flex-1 h-12 rounded-full bg-primary text-secondary-deep font-bold text-sm tap flex items-center justify-center gap-2">
            <Icon name="account_balance" className="text-base" filled weight={600} />
            Withdraw
          </button>
          <button className="h-12 px-5 rounded-full bg-background/15 border border-background/20 text-background font-semibold text-sm tap flex items-center gap-2">
            <Icon name="qr_code_2" className="text-base" />
            UPI
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4">
          <Icon name="trending_up" className="text-secondary text-lg" weight={700} />
          <p className="text-2xl font-extrabold tabular-nums mt-2">
            {formatCurrency(dashboard?.lifetime_earnings || dashboard?.total_sales || 0)}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/55">Lifetime</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <Icon name="schedule" className="text-primary-foreground text-lg" weight={700} />
          <p className="text-2xl font-extrabold tabular-nums mt-2">
            {formatCurrency(dashboard?.pending_payouts || 0)}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/55">Pending</p>
        </div>
      </div>

      <section>
        <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">History</p>
        <h3 className="text-lg font-extrabold tracking-tight mb-3">
          {isLoading ? "Loading Transactions" : "All Transactions"}
        </h3>

        {txns.length > 0 ? (
          <div className="glass rounded-2xl p-3 divide-y divide-border/60">
            {txns.map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-1">
                <div className={`size-10 rounded-xl flex items-center justify-center ${t.in ? "bg-secondary/10 text-secondary" : "bg-destructive/10 text-destructive"}`}>
                  <Icon name={t.in ? "south_west" : "north_east"} className="text-base" weight={700} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{t.desc}</p>
                  <p className="text-[11px] font-medium text-foreground/50">{t.id} - {t.date}</p>
                </div>
                <p className={`text-sm font-extrabold tabular-nums ${t.in ? "text-secondary" : "text-foreground/70"}`}>
                  {t.amt}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="wallet"
            title="No payouts yet"
            description="Your payout history will appear here once you receive your first payment."
          />
        )}
      </section>
    </main>
  );
};
