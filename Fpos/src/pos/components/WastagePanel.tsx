import { useState } from "react";
import { usePos, formatINR } from "../store";
import type { WastageReason } from "../store";
import { AlertTriangle, Trash2, Send, X, Loader2 } from "lucide-react";

const REASONS: { v: WastageReason; label: string; color: string }[] = [
  { v: "Spoiled", label: "SPOILED", color: "bg-destructive text-destructive-foreground" },
  { v: "Damaged", label: "DAMAGED", color: "bg-warning text-warning-foreground" },
  { v: "Expired", label: "EXPIRED", color: "bg-sodexo text-sodexo-foreground" },
];

export default function WastagePanel() {
  const draft = usePos((s) => s.wastageDraft);
  const setQty = usePos((s) => s.setWastageQty);
  const remove = usePos((s) => s.removeWastageDraft);
  const submit = usePos((s) => s.submitWastage);
  const setMode = usePos((s) => s.setMode);
  const clear = usePos((s) => s.clearWastageDraft);
  const loading = usePos((s) => s.loading);
  const error = usePos((s) => s.error);
  const [reason, setReason] = useState<WastageReason | null>(null);

  const total = draft.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const canSubmit = draft.length > 0 && reason !== null && !loading;

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="bg-destructive text-destructive-foreground px-3 py-2 border-b-2 border-foreground flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={20}/>
          <span className="font-extrabold uppercase tracking-widest text-sm">Wastage Mode</span>
        </div>
        <button onClick={() => { clear(); setMode("sale"); }}
          className="border-2 border-destructive-foreground p-1 hover:bg-foreground">
          <X size={16}/>
        </button>
      </div>

      <div className="px-3 py-2 bg-foreground text-background text-[10px] font-extrabold uppercase tracking-widest border-b-2 border-foreground">
        Scan or Tap to add to Wastage List
      </div>

      {error && (
        <div className="bg-destructive text-destructive-foreground font-extrabold text-center py-2 text-xs uppercase tracking-wider border-b-2 border-foreground">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-sharp min-h-0">
        {draft.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground font-bold text-sm uppercase tracking-wider">
            No items logged
          </div>
        ) : (
          draft.map((i, idx) => (
            <div key={i.pid} className={`grid grid-cols-12 px-3 py-2 items-center border-b border-foreground/30 ${idx%2===1?"bg-row-alt":""}`}>
              <div className="col-span-6">
                <div className="font-extrabold text-sm leading-tight">{i.name}</div>
                <div className="font-mono text-[10px] font-bold text-muted-foreground">{i.pid} · {formatINR(i.unitPrice)}{i.weighed?"/KG":""}</div>
              </div>
              <div className="col-span-3 flex items-center justify-center gap-1">
                <button onClick={() => setQty(i.pid, +(i.quantity - (i.weighed?0.1:1)).toFixed(3))}
                  className="border-2 border-foreground w-6 h-6 font-extrabold text-sm hover:bg-foreground hover:text-background">−</button>
                <span className="font-mono font-extrabold text-sm w-10 text-center tabular-nums">
                  {i.weighed ? i.quantity.toFixed(2) : i.quantity}
                </span>
                <button onClick={() => setQty(i.pid, +(i.quantity + (i.weighed?0.1:1)).toFixed(3))}
                  className="border-2 border-foreground w-6 h-6 font-extrabold text-sm hover:bg-foreground hover:text-background">+</button>
              </div>
              <div className="col-span-2 text-right font-mono font-extrabold text-sm tabular-nums">{formatINR(i.unitPrice*i.quantity)}</div>
              <div className="col-span-1 flex justify-end">
                <button onClick={() => remove(i.pid)} className="border-2 border-foreground p-0.5 hover:bg-destructive hover:text-destructive-foreground">
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t-2 border-foreground bg-background">
        <div className="px-3 py-2 border-b-2 border-foreground">
          <div className="text-[10px] font-extrabold uppercase tracking-widest mb-2">Reason</div>
          <div className="grid grid-cols-3 gap-2">
            {REASONS.map((r) => (
              <button key={r.v} onClick={() => setReason(r.v)}
                disabled={loading}
                className={`pressable border-2 border-foreground h-12 font-extrabold text-xs tracking-widest
                  ${reason === r.v ? r.color : "bg-card hover:bg-secondary"} disabled:opacity-50`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end justify-between px-3 py-2 bg-foreground text-background">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest">Wastage Value</div>
            <div className="text-[10px] font-bold opacity-80">{draft.length} item{draft.length!==1&&"s"}</div>
          </div>
          <div className="font-mono font-extrabold tabular-nums leading-none" style={{ fontSize: 32 }}>{formatINR(total)}</div>
        </div>
        <button onClick={() => reason && submit(reason)}
          disabled={!canSubmit}
          className="pressable-primary w-full bg-destructive text-destructive-foreground border-t-2 border-foreground h-14 font-extrabold text-lg tracking-widest flex items-center justify-center gap-2 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:cursor-not-allowed">
          {loading ? <><Loader2 size={20} className="animate-spin"/> SUBMITTING...</> : <><Send size={20}/> SUBMIT WASTAGE</>}
        </button>
      </div>
    </div>
  );
}
