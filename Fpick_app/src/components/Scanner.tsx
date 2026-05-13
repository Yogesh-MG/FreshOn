import { useEffect, useState } from "react";
import { X, Zap } from "lucide-react";

interface Props {
  itemName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const Scanner = ({ itemName, onSuccess, onCancel }: Props) => {
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setScanned(true);
      if (navigator.vibrate) navigator.vibrate(80);
      setTimeout(onSuccess, 700);
    }, 1800);
    return () => clearTimeout(t);
  }, [onSuccess]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-fade-in" style={{ paddingTop: "max(0px, env(safe-area-inset-top))", paddingBottom: "max(0px, env(safe-area-inset-bottom))", paddingLeft: "max(0px, env(safe-area-inset-left))", paddingRight: "max(0px, env(safe-area-inset-right))" }}>
      <div className="flex items-center justify-between p-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Scanning</div>
          <div className="font-semibold text-foreground">{itemName}</div>
        </div>
        <button onClick={onCancel} className="touch-target size-12 rounded-md bg-card industrial-border flex items-center justify-center">
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="relative aspect-square w-full max-w-sm">
          {/* Camera viewfinder - respects safe area */}
          <div className="absolute inset-0 rounded-md overflow-hidden bg-gradient-to-br from-secondary/40 to-background border border-accent/30">
            {/* fake camera noise */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(hsl(var(--muted-foreground)) 1px, transparent 1px)", backgroundSize: "4px 4px" }} />
            {!scanned && <div className="absolute inset-x-0 h-1 scanline" />}
            {scanned && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/30 animate-fade-in">
                <div className="size-24 rounded-full bg-primary border-4 border-primary-foreground flex items-center justify-center haptic-tick">
                  <Zap className="size-12 text-primary-foreground" fill="currentColor" />
                </div>
              </div>
            )}
          </div>

          {/* Corner brackets */}
          {["top-0 left-0 border-t-4 border-l-4", "top-0 right-0 border-t-4 border-r-4", "bottom-0 left-0 border-b-4 border-l-4", "bottom-0 right-0 border-b-4 border-r-4"].map((c, i) => (
            <div key={i} className={`absolute size-10 ${c} border-accent`} />
          ))}
        </div>
      </div>

      <div className="p-6 text-center">
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {scanned ? "Match Confirmed" : "Align barcode within frame…"}
        </div>
      </div>
    </div>
  );
};
