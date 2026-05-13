import { Check } from "lucide-react";

interface Props {
  orderId: string;
  onNext: () => void;
}

export const CompleteScreen = ({ orderId, onNext }: Props) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="size-28 rounded-full bg-primary border-4 border-primary-foreground/20 flex items-center justify-center" style={{ boxShadow: "var(--shadow-glow-primary)" }}>
          <Check className="size-14 text-primary-foreground" strokeWidth={3} />
        </div>
        <div className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-2">Dispatched</div>
          <h2 className="text-2xl font-bold">{orderId} handed over</h2>
          <p className="text-muted-foreground text-sm mt-2">Driver notified · Manifest sealed</p>
        </div>
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs font-mono text-center mt-4">
          <div className="p-3 bg-card industrial-border rounded-md">
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Time</div>
            <div className="font-bold">4:12</div>
          </div>
          <div className="p-3 bg-card industrial-border rounded-md">
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Items</div>
            <div className="font-bold">6/6</div>
          </div>
          <div className="p-3 bg-card industrial-border rounded-md">
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Acc</div>
            <div className="font-bold text-primary">100%</div>
          </div>
        </div>
        <button
          onClick={onNext}
          className="touch-target w-full max-w-xs mt-4 px-6 py-4 bg-accent text-accent-foreground font-mono font-bold uppercase tracking-wider rounded-md active:scale-95 transition-all"
        >
          Next Order →
        </button>
      </div>
    </div>
  );
};
