import { useRef, useState } from "react";
import { Order } from "@/lib/types";
import { qaChecklist } from "@/lib/mockData";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";

interface Props {
  order: Order;
  onBack: () => void;
  onComplete: () => void;
}

export const QAScreen = ({ order, onBack, onComplete }: Props) => {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [slidePos, setSlidePos] = useState(0);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const allChecked = checked.size === qaChecklist.length;

  const toggle = (id: string) => {
    const next = new Set(checked);
    next.has(id) ? next.delete(id) : next.add(id);
    setChecked(next);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!allChecked) return;
    setDragging(true);
    startX.current = e.clientX - slidePos;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !trackRef.current) return;
    const max = trackRef.current.offsetWidth - 64;
    const next = Math.max(0, Math.min(max, e.clientX - startX.current));
    setSlidePos(next);
  };
  const onPointerUp = () => {
    if (!dragging || !trackRef.current) return;
    const max = trackRef.current.offsetWidth - 64;
    if (slidePos > max * 0.85) {
      setSlidePos(max);
      if (navigator.vibrate) navigator.vibrate([60, 40, 100]);
      setTimeout(onComplete, 250);
    } else {
      setSlidePos(0);
    }
    setDragging(false);
  };

  return (
    <div className="min-h-screen bg-background pb-40">
      <header className="sticky top-0 z-20 bg-card industrial-border border-x-0 border-t-0">
        <div className="flex items-center gap-3 p-3">
          <button onClick={onBack} className="touch-target size-12 rounded-md bg-secondary flex items-center justify-center active:scale-95">
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1">
            <div className="font-mono text-[10px] uppercase tracking-widest text-accent">QA & Handover</div>
            <div className="font-semibold">{order.id} · {order.customer}</div>
          </div>
        </div>
      </header>

      <div className="p-4">
        <h2 className="font-bold text-lg mb-1">Final Checks</h2>
        <p className="text-sm text-muted-foreground mb-4">Confirm each step before dispatch.</p>

        <ul className="space-y-2">
          {qaChecklist.map(item => {
            const on = checked.has(item.id);
            return (
              <li key={item.id}>
                <button
                  onClick={() => toggle(item.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-md industrial-border text-left transition-all active:scale-[0.99] ${on ? "bg-primary/15 border-primary" : "bg-card"}`}
                >
                  <div className={`size-8 shrink-0 rounded border-2 flex items-center justify-center ${on ? "bg-primary border-primary" : "border-border"}`}>
                    {on && <Check className="size-5 text-primary-foreground" strokeWidth={3} />}
                  </div>
                  <span className={`text-sm ${on ? "" : "text-foreground"}`}>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 p-4 rounded-md bg-card industrial-border">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Handover Summary</div>
          <div className="grid grid-cols-2 gap-3 font-mono text-sm">
            <div><span className="text-muted-foreground">Items</span><div className="font-bold">{order.items.length}</div></div>
            <div><span className="text-muted-foreground">Subs</span><div className="font-bold">{order.items.filter(i => i.status === "substituted").length}</div></div>
            <div><span className="text-muted-foreground">Issues</span><div className="font-bold text-destructive">{order.items.filter(i => i.status === "issue").length}</div></div>
            <div><span className="text-muted-foreground">Deadline</span><div className="font-bold">{order.deadlineMinutes}m</div></div>
          </div>
        </div>
      </div>

      {/* Slide to dispatch */}
      <div className="fixed inset-x-0 bottom-0 z-30 p-4 bg-background/95 backdrop-blur border-t-2 border-border">
        <div
          ref={trackRef}
          className={`relative h-16 rounded-md industrial-border overflow-hidden ${allChecked ? "bg-primary/20 border-primary" : "bg-card opacity-60"}`}
        >
          <div className="absolute inset-0 flex items-center justify-center font-mono font-bold uppercase tracking-widest text-sm pointer-events-none">
            {allChecked ? "Slide to Dispatch →" : "Complete QA First"}
          </div>
          {allChecked && (
            <div
              className="absolute top-1 bottom-1 left-1 w-14 rounded bg-primary flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
              style={{ transform: `translateX(${slidePos}px)`, transition: dragging ? "none" : "transform 0.25s ease" }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <ChevronRight className="size-6 text-primary-foreground" strokeWidth={3} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
