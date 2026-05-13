import { useEffect, useState } from "react";
import { usePos } from "../store";
import Header from "./Header";
import ProductGrid from "./ProductGrid";
import BillingSidebar from "./BillingSidebar";
import PaymentDrawer from "./PaymentDrawer";
import ReceiptModal from "./ReceiptModal";
import WastagePanel from "./WastagePanel";
import ShiftCloseScreen from "./ShiftCloseScreen";
import ReturnScreen from "./ReturnScreen";

export default function PosScreen() {
  const scanFlash = usePos((s) => s.scanFlash);
  const stage = usePos((s) => s.stage);
  const mode = usePos((s) => s.mode);
  const fetchProducts = usePos((s) => s.fetchProducts);
  const [flash, setFlash] = useState(false);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (!scanFlash) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 600);
    return () => clearTimeout(t);
  }, [scanFlash]);

  return (
    <div className={`relative w-full h-full flex flex-col ${flash ? "scan-flash" : ""}`}>
      <Header />
      <div className="flex-1 flex min-h-0">
        <div className="w-[60%] border-r-2 border-foreground min-h-0">
          <ProductGrid />
        </div>
        <div className="w-[40%] min-h-0">
          {mode === "wastage" ? <WastagePanel /> : <BillingSidebar />}
        </div>
      </div>
      {stage === "payment" && <PaymentDrawer />}
      {stage === "receipt" && <ReceiptModal />}
      {stage === "return" && <ReturnScreen />}
      {stage === "shift-close" && <ShiftCloseScreen />}
    </div>
  );
}
