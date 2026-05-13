import { Wallet, Plus } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { WalletTopupModal } from "./WalletTopupModal";

export const WalletBalance = () => {
  const [showTopupModal, setShowTopupModal] = useState(false);

  const { data: wallet } = useQuery({
    queryKey: ["wallet", "balance"],
    queryFn: async () => {
      const res = await api.get("/api/wallet/wallet/balance/");
      return res.data;
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });

  if (!wallet) return null;

  return (
    <>
      <button
        onClick={() => setShowTopupModal(true)}
        className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-mint to-mint-soft px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:from-mint-soft hover:to-mint"
      >
        <Wallet className="h-4 w-4" />
        <span>₹{Number(wallet.balance).toFixed(2)}</span>
        <Plus className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>

      {showTopupModal && (
        <WalletTopupModal
          onClose={() => setShowTopupModal(false)}
          currentBalance={Number(wallet.balance)}
        />
      )}
    </>
  );
};
