import { useEffect } from "react";
import { usePos } from "./store";
import LoginScreen from "./components/LoginScreen";
import PosScreen from "./components/PosScreen";
import ShiftOpenScreen from "./components/ShiftOpenScreen";

export default function PosApp() {
  const theme = usePos((s) => s.theme);
  const stage = usePos((s) => s.stage);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div
      className="bg-background text-foreground font-sans select-none"
      style={{ width: 1024, height: 768, margin: "0 auto", overflow: "hidden" }}
    >
      {stage === "login" ? <LoginScreen />
        : stage === "shift-open" ? <ShiftOpenScreen />
        : <PosScreen />}
    </div>
  );
}
