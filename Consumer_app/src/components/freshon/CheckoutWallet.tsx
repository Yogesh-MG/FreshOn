import { Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { useState } from "react";

interface CheckoutWalletProps {
  orderTotal: number;
  onWalletAmountChange: (amount: number) => void;
}

export const CheckoutWallet = ({ orderTotal, onWalletAmountChange }: CheckoutWalletProps) => {
  const [useWallet, setUseWallet] = useState(false);
  const [walletAmount, setWalletAmount] = useState(0);

  const { data: wallet } = useQuery({
    queryKey: ["wallet", "balance"],
    queryFn: async () => {
      const res = await api.get("/api/wallet/wallet/balance/");
      return res.data;
    },
  });

  const maxWalletAmount = Math.min(wallet?.balance || 0, orderTotal);

  const handleWalletAmountChange = (amount: number) => {
    const clamped = Math.max(0, Math.min(amount, maxWalletAmount));
    setWalletAmount(clamped);
    onWalletAmountChange(clamped);
  };

  const remainingAmount = orderTotal - walletAmount;

  if (!wallet) return null;

  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="mb-4 flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useWallet}
            onChange={(e) => {
              setUseWallet(e.target.checked);
              if (!e.target.checked) {
                setWalletAmount(0);
                onWalletAmountChange(0);
              }
            }}
            className="h-5 w-5 accent-mint rounded"
          />
          <Wallet className="h-4 w-4 text-mint" />
          <span className="font-semibold">Use Wallet Balance</span>
        </label>
        <span className="text-sm font-semibold text-mint">Available: ₹{wallet.balance}</span>
      </div>

      {useWallet && (
        <div className="space-y-4">
          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Amount to use</label>
              <button
                onClick={() => handleWalletAmountChange(maxWalletAmount)}
                className="text-xs font-semibold text-mint hover:underline"
              >
                Use Max
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold">₹</span>
              <input
                type="number"
                value={walletAmount}
                onChange={(e) => handleWalletAmountChange(Number(e.target.value))}
                max={maxWalletAmount}
                min={0}
                className="w-full rounded-lg border-2 border-mint-soft pl-7 py-2 font-semibold outline-none ring-mint/40 focus:border-mint focus:ring-2"
              />
            </div>
          </div>

          {/* Slider */}
          <div>
            <input
              type="range"
              min={0}
              max={maxWalletAmount}
              value={walletAmount}
              onChange={(e) => handleWalletAmountChange(Number(e.target.value))}
              className="w-full accent-mint"
            />
          </div>

          {/* Amount Breakdown */}
          <div className="rounded-lg bg-white p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wallet payment:</span>
              <span className="font-semibold text-green-600">₹{walletAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining to pay:</span>
              <span className="font-semibold text-orange-600">₹{remainingAmount}</span>
            </div>
          </div>

          {remainingAmount > 0 && (
            <p className="text-xs text-muted-foreground">
              You'll pay the remaining ₹{remainingAmount} via card/UPI
            </p>
          )}
        </div>
      )}
    </div>
  );
};
