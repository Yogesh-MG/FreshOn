import { useState, useEffect } from "react";
import { Fingerprint, Delete, AlertCircle, Check, Loader2 } from "lucide-react";
import { authService } from "@/lib/authService";
import { backendAuthService } from "@/lib/backendAuthService";
import { shiftService } from "@/lib/shiftService";

interface Props {
  onLogin: (employeeId: string) => void;
  attendanceError?: string | null;
  onClearError?: () => void;
}

type Phase = "input" | "setup" | "confirm" | "verify" | "checking" | "error";

export const PinLogin = ({ onLogin, attendanceError, onClearError }: Props) => {
  const [phase, setPhase] = useState<Phase>("input");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [error, setError] = useState("");

  const auth = authService.getAuthState();
  const isFirstTime = !auth.pin;

  useEffect(() => {
    // If already has PIN, load employeeId and show verify screen
    if (!isFirstTime && auth.employeeId) {
      setEmployeeId(auth.employeeId);
      setPhase("verify");
    }
  }, [isFirstTime, auth.employeeId]);

  // Display attendance error if passed from parent
  useEffect(() => {
    if (attendanceError) {
      setError(attendanceError);
      onClearError?.();
    }
  }, [attendanceError, onClearError]);

  const press = (n: string) => {
    setError("");
    if (phase === "setup" && pin.length < 4) {
      setPin(prev => prev + n);
    } else if (phase === "confirm" && pin.length < 4) {
      setPin(prev => prev + n);
    } else if (phase === "verify" && pin.length < 4) {
      setPin(prev => prev + n);
    } else if (phase === "input" && employeeId.length < 6) {
      setEmployeeId(prev => prev + n);
    }
  };

  const handleDelete = () => {
    if (phase === "setup" || phase === "confirm" || phase === "verify") {
      setPin(prev => prev.slice(0, -1));
    } else if (phase === "input") {
      setEmployeeId(prev => prev.slice(0, -1));
    }
  };

  const handleSetupPin = () => {
    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }
    setConfirmPin(pin);
    setPin("");
    setPhase("confirm");
  };

  const handleSubmitSetup = async () => {
    if (pin !== confirmPin) {
      setError("PINs do not match");
      setPin("");
      setPhase("setup");
      return;
    }

    setPhase("checking");

    try {
      // 1. Setup the PIN in the backend
      const setupRes = await backendAuthService.setupPin(employeeId, pin);
      
      if (setupRes.success) {
        // 2. IMPORTANT: After setup, we MUST login with that PIN to get a token
        const loginRes = await backendAuthService.loginWithPin(employeeId, pin);
        
        if (loginRes.success) {
          // 3. Persist employeeId in localStorage so user never has to type it again
          authService.setupPin(employeeId, pin);
          
          // Log shift start
          await shiftService.logShiftStart("mobile-device");
          
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
          setTimeout(() => onLogin(employeeId), 600);
        } else {
          setError(loginRes.error || "Login failed after PIN setup");
          setPhase("error");
        }
      } else {
        setError(setupRes.error || "PIN setup failed");
        setPhase("error");
      }
    } catch (err) {
      setError("Verification failed during setup");
      setPhase("error");
    }
  };

  const handleVerifyPin = async () => {
    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    setPhase("checking");

    try {
      const backendRes = await backendAuthService.loginWithPin(employeeId || auth.employeeId || "", pin);
      
      if (backendRes.success) {
        await shiftService.logShiftStart("mobile-device");
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        setTimeout(() => onLogin(employeeId || auth.employeeId || ""), 600);
      } else {
        if (authService.verifyPin(pin)) {
          await shiftService.logShiftStart("mobile-device");
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
          setTimeout(() => onLogin(employeeId || auth.employeeId || ""), 600);
        } else {
          setError("Incorrect PIN");
          setPin("");
          setPhase("verify");
        }
      }
    } catch (err) {
      if (authService.verifyPin(pin)) {
        await shiftService.logShiftStart("mobile-device");
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        setTimeout(() => onLogin(employeeId || auth.employeeId || ""), 600);
      } else {
        setError("Incorrect PIN");
        setPin("");
        setPhase("verify");
      }
    }
  };

  const handleSkipEmployeeId = () => {
    setEmployeeId("1234");
    setPhase("setup");
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  if (phase === "error") {
    return (
      <div className="min-h-screen flex flex-col bg-background p-6">
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="size-20 rounded-full bg-destructive/20 border-2 border-destructive flex items-center justify-center">
            <AlertCircle className="size-10 text-destructive" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-destructive mb-2">Setup Failed</h2>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
          <button
            onClick={() => {
              setError("");
              setPin("");
              setPhase("input");
            }}
            className="touch-target mt-4 px-8 py-4 bg-primary text-primary-foreground font-mono font-bold uppercase tracking-wider rounded-md active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (phase === "checking") {
    return (
      <div className="min-h-screen flex flex-col bg-background p-6 flex-center">
        <Loader2 className="size-12 text-primary animate-spin mb-4" />
        <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Authenticating…</p>
      </div>
    );
  }

  if (phase === "input") {
    return (
      <div className="min-h-screen flex flex-col bg-background p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">FreshOn Pick · First Login</div>
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Enter Your ID</p>
            <h2 className="text-2xl font-bold">Picker Number</h2>
          </div>

          <div className="w-full max-w-sm">
            <input
              type="text"
              value={employeeId}
              readOnly
              className="w-full p-4 bg-card border-2 border-primary rounded-md font-mono text-center text-3xl font-bold text-primary"
              placeholder="0000"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
            {keys.map((k) => (
              <button key={k} onClick={() => press(k)} className="touch-target h-16 rounded-md bg-card industrial-border font-mono text-2xl font-bold hover:bg-secondary active:scale-95 transition-all">{k}</button>
            ))}
            <button onClick={() => press("0")} className="touch-target h-16 rounded-md bg-card industrial-border font-mono text-2xl font-bold hover:bg-secondary active:scale-95 transition-all">0</button>
            <button onClick={handleDelete} className="touch-target h-16 rounded-md bg-card industrial-border flex items-center justify-center hover:bg-secondary active:scale-95 transition-all col-span-2"><Delete className="size-5 text-muted-foreground" /></button>
          </div>

          <div className="flex gap-3 w-full max-w-[280px]">
            <button onClick={handleSkipEmployeeId} className="touch-target flex-1 py-3 bg-secondary text-foreground rounded-md font-mono font-bold uppercase text-xs tracking-wider active:scale-95">Demo</button>
            <button
              onClick={() => employeeId.length >= 4 && setPhase("setup")}
              disabled={employeeId.length < 4}
              className="touch-target flex-1 py-3 bg-primary text-primary-foreground rounded-md font-mono font-bold uppercase text-xs tracking-wider active:scale-95 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isConfirming = phase === "confirm";
  const isVerifying = phase === "verify";

  return (
    <div className="min-h-screen flex flex-col bg-background p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        FreshOn Pick · {isVerifying ? "Unlock App" : isConfirming ? "Confirm PIN" : "Setup PIN"}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
            {isVerifying ? "Secure Login" : isConfirming ? "One last step" : "One-Time Setup"}
          </p>
          <h2 className="text-2xl font-bold">
            {isVerifying ? "Enter Your PIN" : isConfirming ? "Confirm Your PIN" : "Create 4-Digit PIN"}
          </h2>
        </div>

        <div className="flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`size-4 rounded-full border-2 ${pin.length > i ? "bg-primary border-primary" : "border-border"}`} />
          ))}
        </div>

        {error && <div className="w-full max-w-[280px] p-3 bg-destructive/20 border border-destructive rounded-md font-mono text-xs text-destructive text-center">{error}</div>}

        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
          {keys.map((k) => (
            <button key={k} onClick={() => press(k)} className="touch-target h-16 rounded-md bg-card industrial-border font-mono text-2xl font-bold hover:bg-secondary active:scale-95 transition-all">{k}</button>
          ))}
          <button onClick={handleDelete} className="touch-target h-16 rounded-md bg-card industrial-border flex items-center justify-center hover:bg-secondary active:scale-95 transition-all"><Delete className="size-5 text-muted-foreground" /></button>
          <button onClick={() => press("0")} className="touch-target h-16 rounded-md bg-card industrial-border font-mono text-2xl font-bold hover:bg-secondary active:scale-95 transition-all">0</button>
          <button
            onClick={isVerifying ? handleVerifyPin : isConfirming ? handleSubmitSetup : handleSetupPin}
            disabled={pin.length !== 4}
            className="touch-target h-16 rounded-md bg-primary text-primary-foreground font-mono font-bold uppercase text-xs tracking-wider flex items-center justify-center active:scale-95 disabled:opacity-50"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};