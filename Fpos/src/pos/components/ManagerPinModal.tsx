import { useState } from "react";
import { ShieldAlert, Delete, X, Loader2 } from "lucide-react";

interface Props {
  onSubmit: (pin: string) => Promise<void>;
  onClose: () => void;
  loading: boolean;
  error: string | null;
}

export default function ManagerPinModal({ onSubmit, onClose, loading, error }: Props) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);

  const press = (d: string) => {
    if (pin.length < 6) setPin(pin + d);
  };

  const submit = async () => {
    if (pin.length < 4 || loading) return;
    try {
      await onSubmit(pin);
    } catch {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setPin("");
    }
  };

  const Key = ({ children, onClick, variant }: {
    children: React.ReactNode; onClick: () => void; variant?: "danger" | "primary";
  }) => (
    <button onClick={onClick} disabled={loading}
      className={`pressable border-2 border-foreground h-16 text-2xl font-mono font-extrabold flex items-center justify-center
        ${variant === "danger" ? "bg-destructive text-destructive-foreground" : ""}
        ${variant === "primary" ? "bg-primary text-primary-foreground" : ""}
        ${!variant ? "bg-card text-foreground hover:bg-secondary" : ""}
        ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
      {children}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-foreground/90 flex items-center justify-center z-[60]">
      <div className={`border-sharp-3 bg-card w-[440px] ${shake ? "animate-pulse" : ""}`}
        style={{ boxShadow: "8px 8px 0 0 hsl(var(--destructive))" }}>

        {/* Header - High security visual */}
        <div className="bg-destructive text-destructive-foreground px-5 py-3 border-b-2 border-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={24} />
            <div>
              <div className="font-extrabold text-lg uppercase tracking-tight">Manager Authorization</div>
              <div className="font-bold text-[10px] uppercase tracking-widest opacity-90">REFUND REQUIRES MANAGER PIN</div>
            </div>
          </div>
          <button onClick={onClose} disabled={loading}
            className="border-2 border-destructive-foreground p-1 hover:bg-foreground disabled:opacity-50">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {/* PIN dots */}
          <div className="border-2 border-foreground bg-background h-16 mb-4 flex items-center justify-center gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}
                className={`w-8 h-10 border-2 flex items-center justify-center font-mono text-2xl font-extrabold transition-all
                  ${i < pin.length
                    ? "bg-destructive text-destructive-foreground border-destructive scale-110"
                    : "border-foreground"}`}>
                {i < pin.length ? "•" : ""}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-destructive text-destructive-foreground font-extrabold text-center py-2 mb-3 text-sm uppercase tracking-wider border-2 border-foreground flex items-center justify-center gap-2">
              <ShieldAlert size={16} /> {error}
            </div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {["1","2","3","4","5","6","7","8","9"].map((d) => (
              <Key key={d} onClick={() => press(d)}>{d}</Key>
            ))}
            <Key variant="danger" onClick={() => setPin("")}>CLR</Key>
            <Key onClick={() => press("0")}>0</Key>
            <Key onClick={() => setPin(pin.slice(0, -1))}><Delete size={24}/></Key>
          </div>

          <button onClick={submit}
            disabled={pin.length < 4 || loading}
            className="pressable-primary mt-4 w-full bg-destructive text-destructive-foreground border-2 border-foreground h-14 font-extrabold text-xl tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? (
              <><Loader2 size={22} className="animate-spin" /> VERIFYING...</>
            ) : (
              <><ShieldAlert size={22} /> AUTHORIZE REFUND</>
            )}
          </button>

          <div className="mt-3 text-[10px] font-bold text-muted-foreground text-center tracking-widest uppercase">
            Only managers can authorize returns & refunds
          </div>
        </div>
      </div>
    </div>
  );
}
