import { X, TrendingDown, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";

interface WalletHistoryModalProps {
  onClose: () => void;
}

const reasonLabels: Record<string, { label: string; icon: any; color: string }> = {
  TOPUP: { label: "Top-up", icon: TrendingUp, color: "text-green-600" },
  ORDER_PAYMENT: { label: "Order Payment", icon: TrendingDown, color: "text-red-600" },
  ORDER_REFUND: { label: "Order Refund", icon: TrendingUp, color: "text-blue-600" },
  MONTHLY_CREDIT: { label: "Monthly Credit", icon: TrendingUp, color: "text-green-600" },
  LOYALTY_BONUS: { label: "Loyalty Bonus", icon: TrendingUp, color: "text-purple-600" },
  REFERRAL_BONUS: { label: "Referral Bonus", icon: TrendingUp, color: "text-orange-600" },
};

export const WalletHistoryModal = ({ onClose }: WalletHistoryModalProps) => {
  const { data: history, isLoading } = useQuery({
    queryKey: ["wallet", "history"],
    queryFn: async () => {
      const res = await api.get("/api/wallet/history/");
      return res.data;
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center justify-center p-4">
      <div className="w-full rounded-t-2xl bg-white p-6 sm:max-w-md sm:rounded-2xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between sticky top-0 bg-white pb-4 z-10">
          <h2 className="text-xl font-bold">Wallet History</h2>
          <button
            onClick={onClose}
            className="rounded-full hover:bg-surface p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : history?.results?.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No transactions yet</div>
          ) : (
            history?.results?.map((transaction: any) => {
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
                  className="flex items-center justify-between rounded-lg bg-surface p-4"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`rounded-full bg-mint-soft p-2 ${reasonInfo.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{reasonInfo.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${isCredit ? "text-green-600" : "text-red-600"}`}>
                      {isCredit ? "+" : "-"}₹{Math.abs(Number(transaction.amount)).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Bal: ₹{Number(transaction.balance_after).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
