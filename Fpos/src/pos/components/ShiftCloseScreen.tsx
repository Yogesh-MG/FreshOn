import { useState } from "react";
import { usePos, formatINR } from "../store";
import { ClipboardCheck, X, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

export default function ShiftCloseScreen() {
  const shift = usePos((s) => s.shift);
  const shiftSummary = usePos((s) => s.shiftSummary);
  const setStage = usePos((s) => s.setStage);
  const submitCloseShift = usePos((s) => s.submitCloseShift);
  const finishCloseShift = usePos((s) => s.finishCloseShift);
  const loading = usePos((s) => s.loading);
  const error = usePos((s) => s.error);
  const [closing, setClosing] = useState("");
  const [notes, setNotes] = useState("");

  if (!shift) return null;

  // If we have a summary from the backend, show the final report
  if (shiftSummary) {
    const expected = Number(shiftSummary.opening_cash) + Number(shiftSummary.cash_sales);
    const actual = Number(shiftSummary.closing_cash);
    const variance = Number(shiftSummary.variance);

    return (
      <div className="fixed inset-0 bg-foreground/80 z-50 flex items-center justify-center">
        <div className="border-sharp-3 bg-card w-[640px]" style={{ boxShadow: "10px 10px 0 0 hsl(var(--foreground))" }}>
          <div className="flex items-center justify-between bg-primary text-primary-foreground px-5 py-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={22}/>
              <h2 className="text-xl font-extrabold uppercase tracking-tight">Shift Closed · Summary</h2>
            </div>
          </div>

          <div className="p-5">
            <div className="border-2 border-foreground mb-4">
              <Row label="Transactions" value={String(shiftSummary.txn_count)}/>
              <Row label="Total Sales" value={formatINR(Number(shiftSummary.total_sales))}/>
              <Row label="Cash Sales" value={formatINR(Number(shiftSummary.cash_sales))}/>
              <Row label="Opening Cash" value={formatINR(Number(shiftSummary.opening_cash))}/>
              <Row label="Expected Cash" value={formatINR(expected)} big accent="bg-foreground text-background"/>
              <Row label="Closing Cash" value={formatINR(actual)}/>
            </div>

            <div className={`border-2 border-foreground p-4 mb-4 flex items-center justify-between
              ${Math.abs(variance) < 0.01 ? "bg-primary text-primary-foreground"
                : variance < 0 ? "bg-destructive text-destructive-foreground"
                : "bg-warning text-warning-foreground"}`}>
              <span className="font-extrabold uppercase tracking-widest text-sm flex items-center gap-2">
                {Math.abs(variance) < 0.01 ? <><CheckCircle2 size={20}/> Reconciled</>
                  : variance < 0 ? <><AlertTriangle size={20}/> Shortage</>
                  : <><AlertTriangle size={20}/> Overage</>}
              </span>
              <span className="font-mono font-extrabold tabular-nums text-3xl">
                {variance >= 0 ? "+" : ""}{formatINR(variance)}
              </span>
            </div>

            {shiftSummary.transactions && shiftSummary.transactions.length > 0 && (
              <div className="border-2 border-foreground mb-4 max-h-40 overflow-y-auto scrollbar-sharp">
                <div className="bg-foreground text-background px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest sticky top-0">
                  Transaction Log ({shiftSummary.transactions.length})
                </div>
                {shiftSummary.transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between px-3 py-1.5 border-b border-foreground/30 text-sm">
                    <span className="font-mono text-xs">{String(tx.id).slice(0, 8)}…</span>
                    <span className="font-extrabold text-xs uppercase">{tx.method}</span>
                    <span className="font-mono font-extrabold tabular-nums">{formatINR(Number(tx.total))}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={finishCloseShift}
              className="pressable-primary w-full bg-primary text-primary-foreground border-2 border-foreground h-14 font-extrabold tracking-widest text-lg">
              DONE · LOG OUT
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Pre-close: enter closing cash ──
  const expected = +(shift.openingCash + shift.cashSales).toFixed(2);
  const actual = parseFloat(closing || "0") || 0;
  const diff = +(actual - expected).toFixed(2);

  return (
    <div className="fixed inset-0 bg-foreground/80 z-50 flex items-center justify-center">
      <div className="border-sharp-3 bg-card w-[640px]" style={{ boxShadow: "10px 10px 0 0 hsl(var(--foreground))" }}>
        <div className="flex items-center justify-between bg-foreground text-background px-5 py-3">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={22}/>
            <h2 className="text-xl font-extrabold uppercase tracking-tight">Close Shift · X-Report</h2>
          </div>
          <button onClick={() => setStage("pos")} className="border-2 border-background p-1 hover:bg-destructive">
            <X size={18}/>
          </button>
        </div>

        <div className="p-5">
          <div className="border-2 border-foreground mb-4">
            <Row label="Transactions" value={String(shift.txnCount)}/>
            <Row label="Gross Sales" value={formatINR(shift.totalSales + shift.refundTotal)}/>
            {shift.refundTotal > 0 && (
              <Row label="Refunds" value={`−${formatINR(shift.refundTotal)}`} accent="bg-destructive/10"/>
            )}
            <Row label="Net Sales" value={formatINR(shift.totalSales)} big accent="bg-foreground text-background"/>
            <Row label="Cash Sales" value={formatINR(shift.cashSales)}/>
            <Row label="Opening Cash" value={formatINR(shift.openingCash)}/>
            <Row label="Expected Cash" value={formatINR(expected)} big accent="bg-foreground text-background"/>
          </div>

          {error && (
            <div className="bg-destructive text-destructive-foreground font-extrabold text-center py-2 mb-3 text-sm uppercase tracking-wider">
              {error}
            </div>
          )}

          <label className="block text-xs font-extrabold uppercase tracking-widest mb-2">Actual Closing Cash</label>
          <input type="number" inputMode="decimal" value={closing}
            onChange={(e) => setClosing(e.target.value)}
            placeholder="COUNT THE DRAWER"
            disabled={loading}
            className="w-full border-2 border-foreground bg-background px-4 py-3 font-mono font-extrabold text-2xl outline-none focus:border-primary mb-3 disabled:opacity-50"/>

          <label className="block text-xs font-extrabold uppercase tracking-widest mb-2">Notes (optional)</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Any remarks..."
            disabled={loading}
            className="w-full border-2 border-foreground bg-background px-4 py-2 font-bold text-sm outline-none focus:border-primary mb-4 disabled:opacity-50"/>

          <div className={`border-2 border-foreground p-4 mb-4 flex items-center justify-between
            ${Math.abs(diff) < 0.01 ? "bg-primary text-primary-foreground"
              : diff < 0 ? "bg-destructive text-destructive-foreground"
              : "bg-warning text-warning-foreground"}`}>
            <span className="font-extrabold uppercase tracking-widest text-sm flex items-center gap-2">
              {Math.abs(diff) < 0.01 ? <><CheckCircle2 size={20}/> Reconciled</>
                : diff < 0 ? <><AlertTriangle size={20}/> Shortage</>
                : <><AlertTriangle size={20}/> Overage</>}
            </span>
            <span className="font-mono font-extrabold tabular-nums text-3xl">
              {diff >= 0 ? "+" : ""}{formatINR(diff)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setStage("pos")} disabled={loading}
              className="pressable border-2 border-foreground bg-card h-14 font-extrabold tracking-widest disabled:opacity-50">BACK</button>
            <button onClick={() => submitCloseShift(actual, notes)}
              disabled={loading}
              className="pressable-primary bg-primary text-primary-foreground border-2 border-foreground h-14 font-extrabold tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> CLOSING...</>
              ) : (
                "CONFIRM CLOSE"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, big, accent }: { label: string; value: string; big?: boolean; accent?: string }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 border-b-2 border-foreground last:border-b-0 ${accent ?? ""}`}>
      <span className="font-extrabold uppercase tracking-wider text-sm">{label}</span>
      <span className={`font-mono font-extrabold tabular-nums ${big ? "text-3xl" : "text-lg"}`}>{value}</span>
    </div>
  );
}
