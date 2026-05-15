import { Wallet, Plus, TrendingDown, TrendingUp, History } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { wallet as walletModule } from "@freshon/api";
import { WalletTopupModal } from "./WalletTopupModal";
import { WalletHistoryModal } from "./WalletHistoryModal";

const reasonLabels: Record<string, { label: string; icon: any; color: string }> = {
  TOPUP: { label: "Top-up", icon: TrendingUp, color: "text-green-600" },
  ORDER_PAYMENT: { label: "Order Payment", icon: TrendingDown, color: "text-red-600" },
  ORDER_REFUND: { label: "Order Refund", icon: TrendingUp, color: "text-blue-600" },
  MONTHLY_CREDIT: { label: "Monthly Credit", icon: TrendingUp, color: "text-green-600" },
  LOYALTY_BONUS: { label: "Loyalty Bonus", icon: TrendingUp, color: "text-purple-600" },
  REFERRAL_BONUS: { label: "Referral Bonus", icon: TrendingUp, color: "text-orange-600" },
};

export const WalletSection = () => {
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const { data: wallet } = useQuery({
    queryKey: ["wallet", "balance"],
    queryFn: () => walletModule.getBalance(),
    refetchInterval: 5000,
  });

  const { data: history } = useQuery({
    queryKey: ["wallet", "history"],
    queryFn: () => walletModule.getTransactionHistory(),
  });

  if (!wallet) return null;

  const recentTransactions = history?.results?.slice(0, 5) || [];

  return (
    <>
      <div className="space-y-4">
        {/* Balance Card */}
        <div className="freshon-card bg-gradient-to-br from-mint to-forest p-6 text-white rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white/20">
              <Wallet className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">BALANCE</span>
          </div>
          <p className="text-sm font-semibold opacity-90 mb-1">Current Balance</p>
          <h2 className="font-display text-4xl font-bold mb-6">₹{Number(wallet.balance).toFixed(2) || "0.00"}</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowTopupModal(true)}
              className="flex items-center justify-center gap-2 bg-white text-forest rounded-xl px-4 py-2.5 font-semibold text-sm hover:bg-background/90 transition"
            >
              <Plus className="h-4 w-4" />
              Add Money
            </button>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center justify-center gap-2 bg-white/20 text-white rounded-xl px-4 py-2.5 font-semibold text-sm hover:bg-white/30 transition"
            >
              <History className="h-4 w-4" />
              History
            </button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-3">
          <div className="freshon-card p-3 text-center">
            <p className="text-2xl font-bold text-forest">{history?.results?.length || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Transactions</p>
          </div>
          <div className="freshon-card p-3 text-center">
            <p className="text-2xl font-bold text-green-600">₹{
              history?.results
                ?.filter((t: any) => Number(t.amount) > 0)
                .reduce((sum: number, t: any) => sum + Number(t.amount), 0)
                .toFixed(2) || "0.00"
            }</p>
            <p className="text-xs text-muted-foreground mt-1">Total Added</p>
          </div>
          <div className="freshon-card p-3 text-center">
            <p className="text-2xl font-bold text-red-600">₹{
              history?.results
                ?.filter((t: any) => Number(t.amount) < 0)
                .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount)), 0)
                .toFixed(2) || "0.00"
            }</p>
            <p className="text-xs text-muted-foreground mt-1">Total Spent</p>
          </div>
        </div>

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Recent Transactions</h3>
              <button
                onClick={() => setShowHistoryModal(true)}
                className="text-xs text-mint font-semibold hover:underline"
              >
                View All
              </button>
            </div>
            <div className="space-y-2">
              {recentTransactions.map((transaction: any) => {
                const reasonInfo = reasonLabels[transaction.reason] || {
                  label: transaction.reason_display,
                  icon: TrendingUp,
                  color: "text-gray-600",
                };
                const Icon = reasonInfo.icon;
                const isCredit = Number(transaction.amount) > 0;

                return (
                  <div
                    key={transaction.id}
                    className="freshon-card flex items-center justify-between p-3 hover:bg-mint-soft transition"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`rounded-full bg-mint-soft p-2 ${reasonInfo.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{reasonInfo.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className={`font-bold text-sm ${isCredit ? "text-green-600" : "text-red-600"}`}>
                        {isCredit ? "+" : "-"}₹{Math.abs(Number(transaction.amount)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {recentTransactions.length === 0 && (
          <div className="freshon-card flex flex-col items-center justify-center p-8 text-center">
            <Wallet className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add money to your wallet to get started</p>
          </div>
        )}
      </div>

      {showTopupModal && (
        <WalletTopupModal
          onClose={() => setShowTopupModal(false)}
          currentBalance={Number(wallet.balance)}
        />
      )}

      {showHistoryModal && (
        <WalletHistoryModal onClose={() => setShowHistoryModal(false)} />
      )}
    </>
  );
};
