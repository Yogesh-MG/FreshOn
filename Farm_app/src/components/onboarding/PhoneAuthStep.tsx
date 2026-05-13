import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { StepHeader } from "../freshon/StepHeader";
import { Icon } from "@/components/freshon/Icon";
import { useAuth } from "@/context/AuthContext";
import { useRegisterFarmer, useVerifyOTP } from "@/hooks/useFarmer";
import { getApiErrorMessage } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { AuthResponse } from "@/types/api";

interface Props {
  onNext: () => void;
  onBack: () => void;
  onAuth?: (response: AuthResponse) => void;
}

export const PhoneAuthStep = ({ onNext, onBack, onAuth }: Props) => {
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuth();
  const registerFarmer = useRegisterFarmer();
  const verifyOTP = useVerifyOTP();

  useEffect(() => {
    if (stage === "otp") inputs.current[0]?.focus();
  }, [stage]);

  const isBusy = registerFarmer.isPending || verifyOTP.isPending;

  const sendCode = async () => {
    if (phone.length < 10 || isBusy) return;

    try {
      const response = await registerFarmer.mutateAsync(phone);
      setDebugOtp(response.debug_otp || null);
      setStage("otp");
      toast({
        title: "Code sent",
        description: response.debug_otp ? `Test OTP: ${response.debug_otp}` : response.message,
      });
    } catch (error) {
      toast({
        title: "Could not send code",
        description: getApiErrorMessage(error, "Please check the phone number and try again."),
        variant: "destructive",
      });
    }
  };

  const submitOtp = async (nextOtp = otp) => {
    const code = nextOtp.join("");
    if (code.length !== 6 || isBusy) return;

    try {
      const response = await verifyOTP.mutateAsync({
        phone,
        otp: code,
        name: name.trim() || "FreshOn Farmer",
      });
      login(response.user, response.access, response.refresh);
      toast({ title: "Phone verified", description: response.message || "Your farmer account is ready." });
      // Let the parent decide where to navigate based on auth response
      if (onAuth) {
        onAuth(response);
      } else {
        onNext();
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: getApiErrorMessage(error, "Invalid or expired OTP."),
        variant: "destructive",
      });
    }
  };

  const handleOtpChange = (i: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 5) inputs.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) window.setTimeout(() => submitOtp(next), 150);
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  return (
    <motion.div
      key="auth"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-dvh md:min-h-[860px] flex flex-col"
    >
      <StepHeader current={1} total={6} onBack={onBack} label="Verify" />

      <div className="px-7 pt-10 flex-1 flex flex-col">
        <div className="size-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
          <Icon
            name={stage === "phone" ? "smartphone" : "lock"}
            className="text-secondary text-2xl"
            weight={500}
          />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground text-balance leading-tight">
          {stage === "phone" ? "What's your phone number?" : "Enter the 6-digit code"}
        </h2>
        <p className="mt-2 text-foreground/60 leading-relaxed font-medium">
          {stage === "phone"
            ? "We'll send a verification code to confirm it's really you."
            : `Sent to +91 ${phone || "**** **** **"}`}
        </p>
        {debugOtp && stage === "otp" && (
          <p className="mt-3 text-xs font-bold text-secondary">Test OTP: {debugOtp}</p>
        )}

        {stage === "phone" ? (
          <div className="mt-8 glass rounded-[24px] p-5 flex items-center gap-3">
            <div className="px-3 py-2 rounded-xl bg-secondary text-background font-bold text-sm">
              +91
            </div>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              autoFocus
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="98765 43210"
              disabled={isBusy}
              className="flex-1 bg-transparent outline-none text-xl font-semibold tracking-wider text-foreground placeholder:text-foreground/30"
            />
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <div className="glass rounded-[24px] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1">
                Farmer name
              </p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ramesh Kumar"
                disabled={isBusy}
                className="w-full bg-transparent outline-none font-bold text-foreground placeholder:text-foreground/30"
              />
            </div>
            <div className="grid grid-cols-6 gap-2.5">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKey(i, e)}
                  inputMode="numeric"
                  maxLength={1}
                  disabled={isBusy}
                  className="aspect-square rounded-2xl bg-card border-2 border-border text-center text-2xl font-extrabold text-secondary-deep focus:border-primary focus:bg-primary/5 outline-none transition-all disabled:opacity-60"
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex-1" />

        <button
          onClick={() => {
            if (stage === "phone") sendCode();
            if (stage === "otp") submitOtp();
          }}
          disabled={isBusy || (stage === "phone" && phone.length < 10) || (stage === "otp" && otp.some((d) => !d))}
          className="w-full h-16 rounded-full bg-gradient-forest text-background font-semibold text-base shadow-deep flex items-center justify-center gap-2 disabled:opacity-40 tap mb-6"
        >
          {stage === "phone" ? (registerFarmer.isPending ? "Sending..." : "Send code") : verifyOTP.isPending ? "Verifying..." : "Verify code"}
          <Icon name="arrow_forward" weight={600} />
        </button>
      </div>
    </motion.div>
  );
};
