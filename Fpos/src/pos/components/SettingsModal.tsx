import { useState, useEffect } from "react";
import { usePos } from "../store";
import { Settings, Printer, X, Check, RefreshCw } from "lucide-react";
import { getPrinters } from "tauri-plugin-printer-v2";

export default function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const selectedPrinter = usePos((s) => s.selectedPrinter);
  const setPrinter = usePos((s) => s.setPrinter);
  const [printers, setPrinters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadPrinters();
    }
  }, [open]);

  const loadPrinters = async () => {
    setLoading(true);
    try {
      const result = await getPrinters();
      const list = JSON.parse(result);
      // Handle different return formats from the plugin (some use .name, some .deviceName)
      const names = list.map((p: any) => {
        if (typeof p === 'string') return p;
        // Windows often uses capital "Name"
        const finalName = p.Name || p.name || p.deviceName || p.printerName || p.DeviceID || p.id;
        return finalName || "Unknown Printer";
      });
      setPrinters(names);
    } catch (err) {
      console.error("Failed to fetch printers:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-foreground/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background border-4 border-foreground w-full max-w-md shadow-[8px_8px_0_0_hsl(var(--foreground))] animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b-4 border-foreground bg-primary text-primary-foreground flex items-center justify-between">
          <div className="flex items-center gap-2 font-black uppercase italic tracking-tighter text-lg">
            <Settings size={22} className="animate-spin-slow" />
            POS Terminal Settings
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform p-1">
            <X size={28} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                <Printer size={16} /> Select Thermal Printer
              </label>
              <button 
                onClick={loadPrinters}
                disabled={loading}
                className="text-[10px] font-bold uppercase tracking-widest bg-secondary text-secondary-foreground px-2 py-1 border-2 border-foreground flex items-center gap-1 hover:bg-foreground hover:text-background transition-colors"
              >
                <RefreshCw size={10} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="text-center py-12 font-mono text-xs animate-pulse italic border-2 border-dashed border-foreground/20">
                  Scanning system for USB & Network printers...
                </div>
              ) : printers.length === 0 ? (
                <div className="text-center py-12 font-mono text-xs text-destructive italic border-2 border-dashed border-destructive/50 bg-destructive/5">
                  No printers detected! <br/> Ensure your printer is ON and connected.
                </div>
              ) : (
                printers.map((name) => (
                  <button
                    key={name}
                    onClick={() => setPrinter(name)}
                    className={`w-full p-4 border-4 flex items-center justify-between group transition-all text-left ${
                      selectedPrinter === name 
                      ? "border-foreground bg-primary text-primary-foreground translate-x-1 translate-y-1 shadow-none" 
                      : "border-foreground bg-background text-foreground hover:bg-accent hover:text-accent-foreground shadow-[6px_6px_0_0_hsl(var(--foreground))]"
                    }`}
                  >
                    <span className="font-black text-sm truncate pr-4 uppercase tracking-wide">{name}</span>
                    {selectedPrinter === name && <Check size={24} strokeWidth={4} className="flex-shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="p-4 bg-foreground text-background border-4 border-foreground mb-6 shadow-[4px_4px_0_0_hsl(var(--primary))]">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Current Configuration</div>
            <div className="font-mono text-sm font-black truncate">
              {selectedPrinter || "--- NONE SELECTED ---"}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-foreground text-background py-4 font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--primary))] active:translate-y-1 active:shadow-none"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
