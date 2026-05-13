import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import api, { setAuthTokens, isAuthed } from "@/utils/api";

const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
};

const getDeviceIdentifier = (): string => {
  let id = localStorage.getItem("freshon_device_id");
  if (!id) {
    id = (crypto?.randomUUID?.() || `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem("freshon_device_id", id);
  }
  return id;
};

const VerifyOtp = () => {
  const nav = useNavigate();
  const phone = sessionStorage.getItem("freshon_pending_phone") || "";
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(30);
  const [shake, setShake] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  useEffect(() => {
    if (!phone && !isAuthed()) nav("/login", { replace: true });
  }, [phone, nav]);

  const verify = async (code: string) => {
    setLoading(true); setError(null);
    try {
      const r = await api.post("/api/auth/verify-otp/", {
        phone,
        otp: code,
        device_name: navigator.userAgent.slice(0, 60),
        device_identifier: getDeviceIdentifier(),
      });
      const access = r.data.access || r.data.device_auth_key;
      const refresh = r.data.refresh;
      if (!access) throw new Error("No token returned");
      
      setAuthTokens(access, refresh);
      
      const user = r.data.user || {};
      sessionStorage.removeItem("freshon_pending_phone");
      toast.success("Welcome to FreshOn.in 🌿");
      
      // In consumer_app, profile completion might be checked differently, 
      // but we'll follow the same logic for now.
      if (user.is_profile_complete === false || !user.first_name) {
        // Check if route exists, if not go to home
        nav("/", { replace: true });
      } else {
        nav("/", { replace: true });
      }
    } catch (e: any) {
      setShake(true); setTimeout(() => setShake(false), 500);
      const msg = e?.response?.data?.detail || e?.response?.data?.otp?.[0] || "Invalid OTP";
      setError(typeof msg === "string" ? msg : "Invalid OTP");
      setOtp(Array(6).fill(""));
      refs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleChange = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...otp]; next[i] = d; setOtp(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
    if (i === 5 && d) {
      const code = next.join("");
      if (code.length === 6) verify(code);
    }
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const resend = async () => {
    try {
      await api.post("/api/auth/send-otp/", { phone });
      toast.success("OTP resent");
      setResendIn(30);
    } catch { toast.error("Failed to resend"); }
  };

  return (
    <div className="min-h-screen bg-background px-6 pt-6 pb-10 max-w-md mx-auto flex flex-col">
      <button onClick={() => nav(-1)} className="h-10 w-10 -ml-2 rounded-full flex items-center justify-center" aria-label="Back">
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="mt-8">
        <h1 className="font-display font-bold text-3xl">Verify your number</h1>
        <p className="text-muted-foreground mt-2 text-sm flex items-center gap-1.5 flex-wrap">
          <span>Enter the 6-digit code sent to +91 {formatPhone(phone)}</span>
          <button onClick={() => nav("/login")} className="text-forest" aria-label="Edit number">
            <Edit2 className="h-3.5 w-3.5" />
          </button>
        </p>
      </div>

      <div className={`mt-10 flex justify-between gap-2 ${shake ? "animate-shake" : ""}`}>
        {otp.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKey(i, e)}
            inputMode="numeric"
            maxLength={1}
            className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-colors ${error ? "border-destructive" : d ? "border-forest bg-mint-soft" : "border-border focus:border-forest"}`}
          />
        ))}
      </div>
      {error && <p className="text-destructive text-xs mt-3 text-center">{error}</p>}

      <div className="mt-6 text-center text-sm">
        {resendIn > 0 ? (
          <span className="text-muted-foreground">Resend OTP in {resendIn}s</span>
        ) : (
          <button onClick={resend} className="text-forest font-semibold">Resend OTP</button>
        )}
      </div>

      {loading && (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-forest" />
        </div>
      )}
    </div>
  );
};

export default VerifyOtp;
