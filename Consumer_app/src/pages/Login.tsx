import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/utils/api";

// Simple phone formatter
const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
};

const Login = () => {
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const digits = phone.replace(/\D/g, "");
  const valid = /^[6-9]\d{9}$/.test(digits);

  const send = async () => {
    if (!valid) { setError("Enter a valid 10-digit phone number"); return; }
    setError(null); setLoading(true);
    try {
      await api.post("/api/auth/send-otp/", { phone: digits });
      sessionStorage.setItem("freshon_pending_phone", digits);
      toast.success("OTP sent");
      nav("/verify-otp");
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.response?.data?.phone?.[0] || "Failed to send OTP";
      setError(typeof msg === "string" ? msg : "Failed to send OTP");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background px-6 pt-6 pb-10 max-w-md mx-auto flex flex-col">
      <button onClick={() => nav(-1)} className="h-10 w-10 -ml-2 rounded-full flex items-center justify-center" aria-label="Back">
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="mt-8">
        <h1 className="font-display font-bold text-3xl">Enter your phone number</h1>
        <p className="text-muted-foreground mt-2 text-sm">We'll send you a 6-digit verification code</p>
      </div>

      <div className="mt-10">
        <label className="block text-xs font-medium text-muted-foreground mb-2">Phone number</label>
        <div className="flex items-stretch gap-2 border-2 border-border focus-within:border-forest rounded-2xl px-3 py-3 transition-colors">
          <span className="flex items-center px-2 bg-mint-soft rounded-xl font-semibold text-sm">+91</span>
          <input
            inputMode="numeric"
            autoFocus
            value={formatPhone(phone)}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98765 43210"
            className="flex-1 bg-transparent outline-none text-lg font-semibold tracking-wide"
            maxLength={11}
          />
        </div>
        {error && <p className="text-destructive text-xs mt-2">{error}</p>}
      </div>

      <div className="mt-auto pt-6">
        <button
          disabled={!valid || loading}
          onClick={send}
          className="w-full bg-forest text-forest-foreground rounded-full py-4 font-semibold disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send OTP →"}
        </button>
      </div>
    </div>
  );
};

export default Login;
