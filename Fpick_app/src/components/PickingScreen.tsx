import { useState } from "react";
import { Order, PickItem, Substitution } from "@/lib/types";
import { ArrowLeft, ScanLine, AlertTriangle, Check, X, Replace, PackageX } from "lucide-react";
import { Scanner } from "./ScannerNew";
import { ScanResult } from "@/lib/scannerService";
import { pickerOrderService } from "@/lib/pickerOrderService";

interface Props {
  order: Order;
  onUpdateItem: (itemId: string, patch: Partial<PickItem>) => void;
  onBack: () => void;
  onAllPacked: () => void;
}

export const PickingScreen = ({ order, onUpdateItem, onBack, onAllPacked }: Props) => {
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [problemFor, setProblemFor] = useState<PickItem | null>(null);
  const [substituteFor, setSubstituteFor] = useState<PickItem | null>(null);
  const [vortexId, setVortexId] = useState<string | null>(null);

  const packed = order.items.filter(i => i.status === "packed" || i.status === "substituted").length;
  const total = order.items.length;
  const progress = (packed / total) * 100;
  const allDone = packed === total;

  const currentItem = order.items.find(i => i.status === "pending" || i.status === "issue") ?? order.items[0];

  const handleScanned = async (item: PickItem, scanResult: ScanResult) => {
    setScanningId(null);
    
    // Verify scan with backend
    const verifyRes = await pickerOrderService.scanItem(order.id, item.id, scanResult.text);
    
    if (verifyRes.success && verifyRes.verified) {
      setVortexId(item.id);
      if (navigator.vibrate) navigator.vibrate([40, 30, 60]);
      setTimeout(() => {
        onUpdateItem(item.id, { status: "packed" });
        setVortexId(null);
      }, 800);
    } else {
      // Scan failed - mark as issue
      setProblemFor(item);
      if (navigator.vibrate) navigator.vibrate([100, 100, 100]);
    }
  };

  const handleSubstitute = (item: PickItem, sub: Substitution) => {
    onUpdateItem(item.id, { status: "substituted", name: sub.name, sku: sub.sku });
    setSubstituteFor(null);
    setProblemFor(null);
  };

  const handleOOS = (item: PickItem) => {
    onUpdateItem(item.id, { status: "issue" });
    setProblemFor(null);
  };

  return (
    <div className="min-h-screen bg-background pb-32 relative overflow-hidden">
      {/* Progress fill background */}
      <div
        className="fixed inset-x-0 bottom-0 progress-fill pointer-events-none z-0"
        style={{ height: `${progress}%`, opacity: 0.12 }}
      />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-card industrial-border border-x-0 border-t-0">
        <div className="flex items-center gap-3 p-3">
          <button onClick={onBack} className="touch-target size-12 rounded-md bg-secondary flex items-center justify-center active:scale-95">
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{order.id} · {order.customer}</div>
            <div className="font-mono text-sm font-bold">{packed}/{total} packed</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Deadline</div>
            <div className={`font-mono font-bold ${order.deadlineMinutes <= 15 ? "text-destructive" : "text-foreground"}`}>{order.deadlineMinutes}m</div>
          </div>
        </div>
        <div className="h-1.5 bg-secondary">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </header>

      {/* Items list */}
      <ul className="relative z-10 px-4 mt-4 space-y-3">
        {order.items.map(item => {
          const isCurrent = item.id === currentItem?.id && item.status !== "packed" && item.status !== "substituted";
          const isPacked = item.status === "packed" || item.status === "substituted";
          const isVortex = vortexId === item.id;
          return (
            <li
              key={item.id}
              className={`p-4 rounded-md industrial-border transition-all ${
                isPacked ? "bg-primary/10 border-primary/40 opacity-60" :
                isCurrent ? "bg-card border-accent" :
                "bg-card"
              } ${isVortex ? "scan-vortex" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className={`size-16 rounded-md flex items-center justify-center text-3xl shrink-0 ${isPacked ? "bg-primary/20" : "bg-secondary"}`}>
                  {isPacked ? <Check className="size-8 text-primary" strokeWidth={3} /> : <span>{item.emoji}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-bold leading-none">{item.quantity}</span>
                    <span className="font-mono text-xs text-muted-foreground uppercase">{item.unit}</span>
                  </div>
                  <div className="font-semibold mt-1 truncate">{item.name}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="font-mono text-[10px] text-muted-foreground">{item.sku}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">·</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{item.batch}</span>
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-accent mt-1">📍 {item.location}</div>
                  {item.status === "substituted" && (
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-accent">↻ Substituted</div>
                  )}
                  {item.status === "issue" && (
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-destructive">⚠ Out of stock</div>
                  )}
                </div>
              </div>

              {isCurrent && !isPacked && (
                <div className="grid grid-cols-3 gap-2 mt-4 animate-fade-in">
                  <button
                    onClick={() => setScanningId(item.id)}
                    className="touch-target col-span-2 py-3 bg-primary text-primary-foreground rounded-md font-mono font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 active:scale-95"
                    style={{ boxShadow: "var(--shadow-glow-primary)" }}
                  >
                    <ScanLine className="size-5" /> Scan to Confirm
                  </button>
                  <button
                    onClick={() => setProblemFor(item)}
                    className="touch-target py-3 bg-card border-2 border-destructive text-destructive rounded-md font-mono font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-1 active:scale-95"
                  >
                    <AlertTriangle className="size-4" /> Problem
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Done CTA */}
      {allDone && (
        <div className="fixed inset-x-0 bottom-0 z-30 p-4 bg-background/95 backdrop-blur border-t-2 border-primary animate-slide-up">
          <button
            onClick={onAllPacked}
            className="touch-target w-full py-5 bg-primary text-primary-foreground rounded-md font-mono font-bold uppercase tracking-widest text-base active:scale-[0.98]"
            style={{ boxShadow: "var(--shadow-glow-primary)" }}
          >
            Proceed to QA →
          </button>
        </div>
      )}

      {/* Scanner overlay */}
      {scanningId && (
        <Scanner
          itemName={order.items.find(i => i.id === scanningId)?.name ?? ""}
          itemSKU={order.items.find(i => i.id === scanningId)?.sku ?? ""}
          onSuccess={(result) => handleScanned(order.items.find(i => i.id === scanningId)!, result)}
          onCancel={() => setScanningId(null)}
        />
      )}

      {/* Problem drawer */}
      {problemFor && (
        <div className="fixed inset-0 z-50 flex items-end animate-fade-in" onClick={() => setProblemFor(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative w-full bg-card industrial-border border-b-0 rounded-t-lg p-5 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Exception Flow</div>
                <div className="font-semibold">{problemFor.name}</div>
              </div>
              <button onClick={() => setProblemFor(null)} className="touch-target size-10 flex items-center justify-center"><X className="size-5" /></button>
            </div>
            <div className="space-y-2">
              {problemFor.substitutions.length > 0 && (
                <button
                  onClick={() => setSubstituteFor(problemFor)}
                  className="touch-target w-full py-4 px-4 bg-accent text-accent-foreground rounded-md font-mono font-bold uppercase text-xs tracking-wider flex items-center justify-between active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2"><Replace className="size-5" /> Suggest Substitute</span>
                  <span>{problemFor.substitutions.length}</span>
                </button>
              )}
              <button
                onClick={() => handleOOS(problemFor)}
                className="touch-target w-full py-4 px-4 bg-card border-2 border-destructive text-destructive rounded-md font-mono font-bold uppercase text-xs tracking-wider flex items-center gap-2 active:scale-[0.98]"
              >
                <PackageX className="size-5" /> Mark Out of Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Substitution drawer */}
      {substituteFor && (
        <div className="fixed inset-0 z-50 flex items-end animate-fade-in" onClick={() => setSubstituteFor(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative w-full bg-card industrial-border border-b-0 rounded-t-lg p-5 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent">Suggested Substitutes</div>
                <div className="font-semibold">For: {substituteFor.name}</div>
              </div>
              <button onClick={() => setSubstituteFor(null)} className="touch-target size-10 flex items-center justify-center"><X className="size-5" /></button>
            </div>
            <div className="space-y-2">
              {substituteFor.substitutions.map((sub, i) => (
                <button
                  key={i}
                  onClick={() => handleSubstitute(substituteFor, sub)}
                  className="w-full text-left p-4 rounded-md bg-secondary industrial-border hover:border-primary active:scale-[0.99] transition-all"
                >
                  <div className="font-semibold">{sub.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground mt-1">{sub.sku}</div>
                  <div className="text-xs text-muted-foreground mt-2">{sub.reason}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
