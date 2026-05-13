import { useEffect, useState } from "react";
import { Order } from "@/lib/types";
import { Zap, Layers, Clock, TrendingUp, Target, Wifi, LogOut } from "lucide-react";

interface Props {
  orders: Order[];
  onSelectOrder: (id: string) => void;
  onLogout: () => void;
}

export const Dashboard = ({ orders, onSelectOrder, onLogout }: Props) => {
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [urgentFlash, setUrgentFlash] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setUrgentFlash(true);
      setTimeout(() => setUrgentFlash(false), 4000);
    }, 9000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Performance header */}
      <header className="sticky top-0 z-20 bg-card industrial-border border-x-0 border-t-0">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-success animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Picker 7841 · North Dock</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="size-3 text-muted-foreground" />
            <button
              onClick={onLogout}
              className="touch-target size-8 rounded-md hover:bg-secondary flex items-center justify-center"
              title="Logout"
            >
              <LogOut className="size-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="p-3 flex items-center gap-3">
            <TrendingUp className="size-5 text-primary" />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Pick Rate</div>
              <div className="font-mono text-xl font-bold">142<span className="text-xs text-muted-foreground">/hr</span></div>
            </div>
          </div>
          <div className="p-3 flex items-center gap-3">
            <Target className="size-5 text-accent" />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Accuracy</div>
              <div className="font-mono text-xl font-bold">99.4<span className="text-xs text-muted-foreground">%</span></div>
            </div>
          </div>
        </div>
      </header>

      {/* Urgent toast */}
      {urgentFlash && (
        <div className="mx-4 mt-3 p-3 rounded-md urgent-glow bg-destructive/15 border-2 border-destructive flex items-center gap-3 animate-fade-in">
          <Zap className="size-5 text-destructive" fill="currentColor" />
          <div className="flex-1">
            <div className="font-mono text-[10px] uppercase tracking-widest text-destructive font-bold">Incoming · Priority</div>
            <div className="text-sm">New rush order in queue</div>
          </div>
        </div>
      )}

      {/* Mode toggle */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-2 industrial-border rounded-md overflow-hidden">
          <button
            onClick={() => setMode("single")}
            className={`touch-target py-3 font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-colors ${mode === "single" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
          >
            <Zap className="size-4" /> Single
          </button>
          <button
            onClick={() => setMode("batch")}
            className={`touch-target py-3 font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-colors ${mode === "batch" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
          >
            <Layers className="size-4" /> Batch
          </button>
        </div>
      </div>

      {/* Section header */}
      <div className="px-4 mt-5 mb-2 flex items-center justify-between">
        <h1 className="font-bold text-lg">Speed Queue</h1>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{orders.length} orders</span>
      </div>

      {/* Order list */}
      <ul className="px-4 space-y-3" key={now}>
        {orders.map(order => {
          const urgent = order.deadlineMinutes <= 15;
          const warn = order.deadlineMinutes > 15 && order.deadlineMinutes <= 30;
          return (
            <li key={order.id}>
              <button
                onClick={() => onSelectOrder(order.id)}
                disabled={order.items.length === 0}
                className={`w-full text-left p-4 rounded-md bg-card industrial-border transition-all active:scale-[0.99] ${urgent ? "deadline-glow border-destructive" : warn ? "border-accent/60" : ""} ${order.items.length === 0 ? "opacity-50" : "hover:border-primary"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-muted-foreground">{order.id}</span>
                      {urgent && <span className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 bg-destructive text-destructive-foreground rounded font-bold">RUSH</span>}
                    </div>
                    <div className="font-semibold truncate">{order.customer}</div>
                    <div className="font-mono text-xs text-muted-foreground mt-1">{order.itemCount} items</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`flex items-center gap-1 justify-end ${urgent ? "text-destructive" : warn ? "text-accent" : "text-muted-foreground"}`}>
                      <Clock className="size-3" />
                      <span className="font-mono text-[10px] uppercase tracking-wider">Leaves in</span>
                    </div>
                    <div className={`font-mono text-2xl font-bold leading-none mt-1 ${urgent ? "text-destructive" : warn ? "text-accent" : "text-foreground"}`}>
                      {order.deadlineMinutes}<span className="text-xs text-muted-foreground">m</span>
                    </div>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
