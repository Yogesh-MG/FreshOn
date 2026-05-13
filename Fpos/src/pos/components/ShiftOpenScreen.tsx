import { useState, useMemo } from "react";
import { usePos, formatINR } from "../store";
import { Banknote, ArrowRight, Loader2, Trash2 } from "lucide-react";

const DENOMS = [500, 200, 100, 50, 20, 10, 5, 2, 1];

export default function ShiftOpenScreen() {
  const user = usePos((s) => s.user);
  const openShift = usePos((s) => s.openShift);
  const logout = usePos((s) => s.logout);
  const loading = usePos((s) => s.loading);
  const error = usePos((s) => s.error);
  const [counts, setCounts] = useState<Record<number, number>>({});

  const setCount = (denom: number, val: number) => {
    setCounts((prev) => {
      if (val <= 0) {
        const next = { ...prev };
        delete next[denom];
        return next;
      }
      return { ...prev, [denom]: val };
    });
  };

  const total = useMemo(
    () => DENOMS.reduce((s, d) => s + d * (counts[d] || 0), 0),
    [counts]
  );

  return (
    <div className="w-full h-full flex items-center justify-center bg-background">
      <div className="border-sharp-3 bg-card p-7 w-[520px]" style={{ boxShadow: "8px 8px 0 0 hsl(var(--foreground))" }}>
        <div className="flex items-center gap-3 mb-1">
          <Banknote size={28} className="text-primary"/>
          <h1 className="text-2xl font-extrabold tracking-tight">OPEN SHIFT</h1>
        </div>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-5">
          Operator: <span className="text-foreground">{user?.name}</span> · {user?.employeeId}
        </p>

        {error && (
          <div className="bg-destructive text-destructive-foreground font-extrabold text-center py-2 mb-3 text-sm uppercase tracking-wider">
            {error}
          </div>
        )}

        <div className="border-2 border-foreground bg-background p-4 mb-4">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-1">Grand Total</div>
          <div className="font-mono font-extrabold text-4xl tabular-nums">{formatINR(total)}</div>
        </div>

        <div className="border-2 border-foreground bg-background max-h-80 overflow-y-auto scrollbar-sharp mb-4">
          {DENOMS.map((d) => {
            const c = counts[d] || 0;
            const sub = d * c;
            return (
              <div key={d} className="flex items-center justify-between px-4 py-2 border-b-2 border-foreground last:border-b-0">
                <div className="w-16 font-mono font-extrabold text-base">₹{d}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCount(d, c - 1)}
                    disabled={loading || c <= 0}
                    className="border-2 border-foreground w-8 h-8 font-extrabold text-sm hover:bg-foreground hover:text-background disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit flex items-center justify-center">
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={c || ""}
                    onChange={(e) => setCount(d, Math.max(0, parseInt(e.target.value) || 0))}
                    disabled={loading}
                    className="w-14 h-8 border-2 border-foreground bg-background text-center font-mono font-extrabold text-sm outline-none focus:border-primary disabled:opacity-50"
                  />
                  <button
                    onClick={() => setCount(d, c + 1)}
                    disabled={loading}
                    className="border-2 border-foreground w-8 h-8 font-extrabold text-sm hover:bg-foreground hover:text-background disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit flex items-center justify-center">
                    +
                  </button>
                </div>
                <div className="w-24 text-right font-mono font-extrabold text-sm tabular-nums">
                  {c > 0 ? `${c} × ₹${d} = ${formatINR(sub)}` : "—"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCounts({})}
            disabled={loading || total === 0}
            className="pressable border-2 border-foreground bg-card px-4 h-10 font-extrabold text-xs tracking-widest flex items-center gap-2 disabled:opacity-50">
            <Trash2 size={14}/> CLEAR ALL
          </button>
          <div className="font-mono font-extrabold text-xl tabular-nums">{formatINR(total)}</div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={logout} disabled={loading} className="pressable border-2 border-foreground bg-card h-14 font-extrabold tracking-widest disabled:opacity-50">CANCEL</button>
          <button onClick={() => openShift(total)}
            disabled={loading}
            className="pressable-primary bg-primary text-primary-foreground border-2 border-foreground h-14 font-extrabold tracking-widest text-base flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? (
              <><Loader2 size={20} className="animate-spin" /> OPENING...</>
            ) : (
              <>START SHIFT <ArrowRight size={20}/></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
