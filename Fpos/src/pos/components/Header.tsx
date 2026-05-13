import { useEffect, useState } from "react";
import { usePos } from "../store";
import { Wifi, Printer, HardDrive, LogOut, Sun, Moon, ScanLine, ClipboardCheck, RotateCcw, Settings } from "lucide-react";
import SettingsModal from "./SettingsModal";

export default function Header() {
  const user = usePos((s) => s.user);
  const logout = usePos((s) => s.logout);
  const closeShift = usePos((s) => s.closeShift);
  const theme = usePos((s) => s.theme);
  const toggle = usePos((s) => s.toggleTheme);
  const shift = usePos((s) => s.shift);
  const setStage = usePos((s) => s.setStage);
  const [now, setNow] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const Health = ({ icon: I, label, ok }: { icon: any; label: string; ok: boolean }) => (
    <div className="flex items-center gap-2 px-3 h-full border-l-2 border-foreground">
      <I size={18} />
      <span className="text-xs font-extrabold uppercase tracking-wider">{label}</span>
      <span className={`w-3 h-3 border-2 border-foreground ${ok ? "bg-primary" : "bg-destructive"}`} />
    </div>
  );

  return (
    <div className="h-14 bg-foreground text-background border-b-2 border-foreground flex items-stretch">
      <div className="flex items-center gap-3 px-4 bg-primary text-primary-foreground border-r-2 border-foreground">
        <div className="w-8 h-8 bg-background text-foreground border-2 border-background flex items-center justify-center font-mono font-extrabold">F</div>
        <div className="leading-tight">
          <div className="font-extrabold text-sm tracking-tight">FRESHON </div>
          <div className="font-bold text-[10px] tracking-widest opacity-90">POS TERMINAL</div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 border-r-2 border-background/30">
        <ScanLine size={18} className="text-accent" />
        <span className="font-bold text-xs uppercase tracking-wider">
          {shift ? `Shift #${shift.id.slice(0,6)} · ${shift.txnCount} TXN` : "Ready to Scan"}
        </span>
      </div>

      <div className="flex-1" />

      <Health icon={Wifi} label="NET" ok />
      <Health icon={Printer} label="PRN" ok />
      <Health icon={HardDrive} label="DB" ok />

      <div className="flex items-center px-4 border-l-2 border-background/30 font-mono font-extrabold text-xl tabular-nums">
        {now.toLocaleTimeString("en-GB", { hour12: false })}
      </div>

      <div className="flex items-center gap-2 px-4 border-l-2 border-background/30 bg-accent text-accent-foreground">
        <div className="w-7 h-7 bg-foreground text-background flex items-center justify-center font-mono font-extrabold text-xs">
          {user?.employeeId.slice(-2)}
        </div>
        <div className="leading-tight">
          <div className="font-extrabold text-xs">{user?.name}</div>
          <div className="font-mono font-bold text-[10px]">{user?.employeeId}</div>
        </div>
      </div>

      <button onClick={() => setShowSettings(true)} className="px-3 border-l-2 border-background/30 hover:bg-background/10 flex items-center gap-1">
        <Settings size={18}/>
      </button>
      <button onClick={toggle} className="px-3 border-l-2 border-background/30 hover:bg-background/10 flex items-center gap-1">
        {theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}
      </button>
      <button onClick={() => setStage("return")} className="px-3 border-l-2 border-background/30 hover:bg-destructive hover:text-destructive-foreground flex items-center gap-1 font-extrabold text-xs uppercase">
        <RotateCcw size={16}/> Return
      </button>
      <button onClick={closeShift} className="px-3 border-l-2 border-background/30 hover:bg-accent hover:text-accent-foreground flex items-center gap-1 font-extrabold text-xs uppercase">
        <ClipboardCheck size={16}/> Close
      </button>

      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
