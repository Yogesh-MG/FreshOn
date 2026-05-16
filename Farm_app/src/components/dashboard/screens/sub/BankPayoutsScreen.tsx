import { useState, useEffect, useCallback } from "react";
import { useBankDetails, useUpdateBankDetails } from "@/hooks/useFarmer";
import { Icon } from "@/components/freshon/Icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Props {
  onBack: () => void;
}

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const maskAccount = (acc: string) => {
  if (!acc || acc.length < 4) return acc;
  return "XXXX XXXX " + acc.slice(-4);
};

export const BankPayoutsScreen = ({ onBack }: Props) => {
  const { t } = useTranslation();
  const { data: bank } = useBankDetails();
  const updateBank = useUpdateBankDetails();
  
  const [formData, setFormData] = useState({
    account_name: "",
    account_number: "",
    ifsc_code: "",
    upi_id: "",
    bank_name: "",
  });
  const [ifscValid, setIfscValid] = useState<boolean | null>(null);
  const [ifscLoading, setIfscLoading] = useState(false);

  useEffect(() => {
    if (bank) {
      setFormData({
        account_name: bank.account_name || "",
        account_number: bank.account_number || "",
        ifsc_code: bank.ifsc_code || "",
        upi_id: bank.upi_id || "",
        bank_name: bank.bank_name || "",
      });
      if (bank.ifsc_code) {
        setIfscValid(IFSC_REGEX.test(bank.ifsc_code));
      }
    }
  }, [bank]);

  const validateIfsc = useCallback(async (code: string) => {
    if (!code || code.length !== 11) {
      setIfscValid(null);
      return;
    }
    if (!IFSC_REGEX.test(code)) {
      setIfscValid(false);
      return;
    }
    setIfscLoading(true);
    try {
      const res = await fetch(`https://ifsc.razorpay.com/${code}`);
      if (res.ok) {
        const data = await res.json();
        setIfscValid(true);
        setFormData(prev => ({
          ...prev,
          bank_name: data.BANK || prev.bank_name,
        }));
      } else {
        setIfscValid(false);
      }
    } catch {
      setIfscValid(IFSC_REGEX.test(code));
    } finally {
      setIfscLoading(false);
    }
  }, []);

  const handleIfscChange = (value: string) => {
    const upper = value.toUpperCase().slice(0, 11);
    setFormData(prev => ({ ...prev, ifsc_code: upper }));
    if (upper.length === 11) {
      validateIfsc(upper);
    } else {
      setIfscValid(null);
    }
  };

  const handleSave = async () => {
    if (formData.ifsc_code && !IFSC_REGEX.test(formData.ifsc_code)) {
      toast.error(t("profile.ifscInvalid"));
      return;
    }
    try {
      await updateBank.mutateAsync({
        ...formData,
        account_number: formData.account_number.replace(/\s/g, ""),
      });
      toast.success(t("profile.bankUpdated"));
      onBack();
    } catch (error) {
      toast.error(t("profile.bankUpdateFailed"));
    }
  };

  const kycStatus = bank?.is_verified;
  const displayAcc = bank?.account_number ? maskAccount(bank.account_number) : "";

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <header className="px-5 h-16 flex items-center gap-4 border-b border-border/60">
        <button onClick={onBack} className="size-10 rounded-xl glass flex items-center justify-center tap">
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-xl font-bold">{t("profile.bankPayouts")}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* KYC Badge */}
        <div className={`rounded-2xl p-4 border flex gap-4 ${kycStatus ? "bg-secondary/5 border-secondary/20" : "bg-primary/5 border-primary/10"}`}>
          <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${kycStatus ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"}`}>
            <Icon name={kycStatus ? "verified" : "pending_actions"} filled />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm">{t("profile.securePayouts")}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${kycStatus ? "bg-secondary text-background" : "bg-primary text-secondary-deep"}`}>
                {kycStatus ? t("profile.kycVerified") : t("profile.kycPending")}
              </span>
            </div>
            <p className="text-xs text-foreground/60 leading-relaxed mt-0.5">
              {t("profile.payoutDesc")}
            </p>
            {displayAcc && (
              <p className="text-xs font-mono text-foreground/70 mt-2">{displayAcc}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("profile.accountHolder")}</Label>
            <Input 
              placeholder="As per bank records"
              value={formData.account_name}
              onChange={e => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
              className="h-12 bg-muted/30 border-border/40 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("profile.accountNumber")}</Label>
            <Input 
              type="password"
              placeholder="Enter account number"
              value={formData.account_number}
              onChange={e => setFormData(prev => ({ ...prev, account_number: e.target.value.replace(/\D/g, "") }))}
              className="h-12 bg-muted/30 border-border/40 rounded-xl"
            />
            {formData.account_number.length >= 4 && (
              <p className="text-xs text-foreground/50 font-mono">{maskAccount(formData.account_number)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("profile.ifscCode")}</Label>
              <div className="relative">
                <Input 
                  placeholder="IFSC"
                  value={formData.ifsc_code}
                  onChange={e => handleIfscChange(e.target.value)}
                  className={`h-12 bg-muted/30 border-border/40 rounded-xl uppercase pr-10 ${ifscValid === false ? "border-destructive" : ifscValid === true ? "border-secondary" : ""}`}
                />
                {ifscLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!ifscLoading && ifscValid === true && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary">
                    <Icon name="check_circle" className="text-lg" filled />
                  </div>
                )}
                {!ifscLoading && ifscValid === false && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
                    <Icon name="error" className="text-lg" filled />
                  </div>
                )}
              </div>
              {ifscValid === false && (
                <p className="text-xs text-destructive font-medium">{t("profile.ifscInvalid")}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("profile.bankName")}</Label>
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
            <Label>{t("profile.upiId")}</Label>
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
          {updateBank.isPending ? t("profile.saving") : t("profile.saveDetails")}
        </Button>
      </footer>
    </div>
  );
};
