import { X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { wallet as walletModule } from "@freshon/api";
import { useToast } from "@/hooks/use-toast";

interface WalletTopupModalProps {
  onClose: () => void;
  currentBalance: number;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const WalletTopupModal = ({ onClose, currentBalance }: WalletTopupModalProps) => {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: { amount: 500 },
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const amount = watch("amount");
  const presets = [100, 500, 1000, 2000, 5000];

  const { mutate: initiateTopup, isPending: isInitiating } = useMutation({
    mutationFn: (data: { amount: number }) => walletModule.initiateTopup(data),
    onSuccess: (data) => {
      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);

      script.onload = () => {
        if (!window.Razorpay) {
          toast({
            title: "Error",
            description: "Failed to load Razorpay",
            variant: "destructive",
          });
          return;
        }

        const razorpay = new window.Razorpay({
          key: data.key_id,
          order_id: data.razorpay_order_id,
          amount: data.amount * 100,
          currency: "INR",
          name: "Freshon",
          description: "Wallet Top-up",
          handler: async (response: any) => {
            // Verify payment
            verifyTopup.mutate({
              topup_id: data.topup_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          },
          prefill: {
            email: "customer@example.com",
            contact: "9876543210",
          },
          theme: {
            color: "#22C55E",
          },
        });

        razorpay.open();
      };
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initiate top-up",
        variant: "destructive",
      });
    },
  });

  const { mutate: verifyTopup, isPending: isVerifying } = useMutation({
    mutationFn: (data: any) => walletModule.verifyTopup(data),
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: `Wallet credited with ₹${amount}`,
      });
      queryClient.invalidateQueries({ queryKey: ["wallet", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "history"] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Payment Failed",
        description: "Your payment could not be verified",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Money to Wallet</h2>
          <button
            onClick={onClose}
            className="rounded-full hover:bg-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Balance */}
        <div className="mb-6 rounded-xl bg-mint-soft p-4">
          <p className="text-sm text-muted-foreground">Current Balance</p>
          <p className="text-2xl font-bold text-mint">₹{currentBalance}</p>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold">₹</span>
            <input
              type="number"
              {...register("amount", { min: 100, max: 10000 })}
              className="w-full rounded-lg border-2 border-surface pl-8 py-3 text-lg font-semibold outline-none ring-mint/40 focus:border-mint focus:ring-2"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Min: ₹100 | Max: ₹10,000</p>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold">Quick amounts</p>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  // Update form value - you'd need to use useFormContext or similar
                  const input = document.querySelector('input[name="amount"]') as HTMLInputElement;
                  if (input) {
                    input.value = preset.toString();
                    input.dispatchEvent(new Event("change", { bubbles: true }));
                  }
                }}
                className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                  amount === preset
                    ? "bg-mint text-white"
                    : "bg-surface hover:bg-mint-soft"
                }`}
              >
                ₹{preset}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={() => initiateTopup({ amount })}
          disabled={isInitiating || isVerifying || !amount || amount < 100}
          className="w-full rounded-lg bg-gradient-to-r from-mint to-mint-soft py-3 font-bold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isInitiating || isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Add ₹${amount} to Wallet`
          )}
        </button>
      </div>
    </div>
  );
};
