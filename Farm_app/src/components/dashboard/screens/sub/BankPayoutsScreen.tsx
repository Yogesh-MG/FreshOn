import { useState, useEffect } from "react";
import { useBankDetails, useUpdateBankDetails } from "@/hooks/useFarmer";
import { Icon } from "@/components/freshon/Icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Props {
  onBack: () => void;
}

export const BankPayoutsScreen = ({ onBack }: Props) => {
  const { data: bank } = useBankDetails();
  const updateBank = useUpdateBankDetails();
  
  const [formData, setFormData] = useState({
    account_name: "",
    account_number: "",
    ifsc_code: "",
    upi_id: "",
    bank_name: "",
  });

  useEffect(() => {
    if (bank) {
      setFormData({
        account_name: bank.account_name || "",
        account_number: bank.account_number || "",
        ifsc_code: bank.ifsc_code || "",
        upi_id: bank.upi_id || "",
        bank_name: bank.bank_name || "",
      });
    }
  }, [bank]);

  const handleSave = async () => {
    try {
      await updateBank.mutateAsync(formData);
      toast.success("Bank details updated successfully");
      onBack();
    } catch (error) {
      toast.error("Failed to update bank details");
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <header className="px-5 h-16 flex items-center gap-4 border-b border-border/60">
        <button onClick={onBack} className="size-10 rounded-xl glass flex items-center justify-center tap">
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-xl font-bold">Bank & Payouts</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex gap-4">
          <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon name="verified" filled />
          </div>
          <div>
            <p className="font-bold text-sm">Secure Payouts</p>
            <p className="text-xs text-foreground/60 leading-relaxed mt-0.5">
              Your earnings are transferred directly to this account every Friday.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Account Holder Name</Label>
            <Input 
              placeholder="As per bank records"
              value={formData.account_name}
              onChange={e => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
              className="h-12 bg-muted/30 border-border/40 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Account Number</Label>
            <Input 
              placeholder="Enter account number"
              value={formData.account_number}
              onChange={e => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
              className="h-12 bg-muted/30 border-border/40 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>IFSC Code</Label>
              <Input 
                placeholder="IFSC"
                value={formData.ifsc_code}
                onChange={e => setFormData(prev => ({ ...prev, ifsc_code: e.target.value.toUpperCase() }))}
                className="h-12 bg-muted/30 border-border/40 rounded-xl uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input 
                placeholder="Bank Name"
                value={formData.bank_name}
                onChange={e => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                className="h-12 bg-muted/30 border-border/40 rounded-xl"
              />
            </div>
          </div>

          <div className="relative py-4 flex items-center gap-4">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">OR</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          <div className="space-y-2">
            <Label>UPI ID (Optional)</Label>
            <Input 
              placeholder="username@bank"
              value={formData.upi_id}
              onChange={e => setFormData(prev => ({ ...prev, upi_id: e.target.value }))}
              className="h-12 bg-muted/30 border-border/40 rounded-xl"
            />
          </div>
        </div>
      </main>

      <footer className="p-5 border-t border-border/60">
        <Button 
          onClick={handleSave}
          disabled={updateBank.isPending}
          className="w-full h-14 rounded-2xl text-lg font-bold shadow-glow-primary"
        >
          {updateBank.isPending ? "Saving..." : "Save Details"}
        </Button>
      </footer>
    </div>
  );
};
