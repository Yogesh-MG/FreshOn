import { useState } from "react";
import { usePos } from "../store";
import { Delete, LogIn, Sun, Moon, Loader2 } from "lucide-react";

export default function LoginScreen() {
  const login = usePos((s) => s.login);
  const theme = usePos((s) => s.theme);
  const toggleTheme = usePos((s) => s.toggleTheme);
  const loading = usePos((s) => s.loading);
  const storeError = usePos((s) => s.error);
  const clearError = usePos((s) => s.clearError);

  const [empId, setEmpId] = useState("");
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);

  const press = (d: string) => {
    clearError();
    if (pin.length < 6) setPin(pin + d);
  };
  const clear = () => { setPin(""); clearError(); };
  const back = () => setPin(pin.slice(0, -1));

  const submit = async () => {
    if (loading) return;
    const ok = await login(empId, pin);
    if (!ok) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setPin("");
    }
  };

  const Key = ({ children, onClick, variant }: { children: React.ReactNode; onClick: () => void; variant?: "danger" | "primary" }) => (
    <button
      onClick={onClick}
      disabled={loading}
      className={`pressable border-sharp-fg h-20 text-3xl font-mono font-extrabold flex items-center justify-center
        ${variant === "danger" ? "bg-destructive text-destructive-foreground" : ""}
        ${variant === "primary" ? "bg-primary text-primary-foreground" : ""}
        ${!variant ? "bg-card text-foreground hover:bg-secondary" : ""}
        ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full h-full flex items-center justify-center relative bg-background">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 border-sharp-fg bg-card px-3 py-2 font-bold text-sm flex items-center gap-2"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />} {theme === "dark" ? "LIGHT" : "DARK"}
      </button>

      <div className="absolute top-4 left-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary border-sharp-fg flex items-center justify-center font-mono font-extrabold text-primary-foreground text-xl">F</div>
        <div>
          <div className="font-extrabold text-lg leading-none tracking-tight">FRESHON</div>
          <div className="font-bold text-xs text-accent leading-none mt-1">GOLDEN HARVEST · POS</div>
        </div>
      </div>

      <div className={`border-sharp-3 bg-card p-8 w-[480px] ${shake ? "animate-pulse" : ""}`} style={{ boxShadow: "8px 8px 0 0 hsl(var(--foreground))" }}>
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">SECURE LOGIN</h1>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-5">Enter Employee ID & PIN</p>

        <label className="block text-xs font-extrabold uppercase tracking-widest mb-2">Employee ID</label>
        <input
          value={empId}
          onChange={(e) => setEmpId(e.target.value.toUpperCase())}
          placeholder="e.g. EMP-001"
          disabled={loading}
          className="w-full border-sharp-fg bg-background px-4 py-3 font-mono font-bold text-xl mb-4 outline-none focus:border-primary disabled:opacity-50"
        />

        <label className="block text-xs font-extrabold uppercase tracking-widest mb-2">PIN</label>
        <div className={`border-sharp-fg bg-background h-16 mb-4 flex items-center justify-center gap-3 ${storeError ? "border-destructive" : ""}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-7 h-9 border-2 border-foreground flex items-center justify-center font-mono text-2xl font-extrabold ${i < pin.length ? "bg-primary text-primary-foreground border-primary" : ""}`}
            >
              {i < pin.length ? "•" : ""}
            </div>
          ))}
        </div>

        {storeError && <div className="bg-destructive text-destructive-foreground font-extrabold text-center py-2 mb-3 text-sm uppercase tracking-wider">{storeError}</div>}

        <div className="grid grid-cols-3 gap-2">
          {["1","2","3","4","5","6","7","8","9"].map((d) => (
            <Key key={d} onClick={() => press(d)}>{d}</Key>
          ))}
          <Key variant="danger" onClick={clear}>CLR</Key>
          <Key onClick={() => press("0")}>0</Key>
          <Key onClick={back}><Delete size={28} /></Key>
        </div>

        <button
          onClick={submit}
          disabled={pin.length < 4 || !empId.trim() || loading}
          className="pressable-primary mt-4 w-full bg-primary text-primary-foreground border-sharp-fg h-16 font-extrabold text-2xl tracking-widest flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 size={26} className="animate-spin" /> VERIFYING...</>
          ) : (
            <><LogIn size={26}/> LOGIN</>
          )}
        </button>

        <div className="mt-4 text-[11px] font-bold text-muted-foreground text-center tracking-wider">
          CONNECTED TO BACKEND · SECURE PIN AUTH
        </div>
      </div>
    </div>
  );
}
