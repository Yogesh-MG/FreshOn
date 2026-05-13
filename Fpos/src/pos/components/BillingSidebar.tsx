import { useState, useEffect, useRef } from "react";
import { usePos, formatINR, memberPriceOf, subtotalOf, grossSubtotalOf } from "../store";
import { Plus, Trash2, UserPlus, Search, X, CreditCard, Trash, Sparkles, Loader2, PauseCircle, Layers } from "lucide-react";
import AddCustomerModal from "./AddCustomerModal";
import HeldOrdersModal from "./HeldOrdersModal";

export default function BillingSidebar() {
  const selected = usePos((s) => s.selectedCustomer);
  const selectCustomer = usePos((s) => s.selectCustomer);
  const searchCustomer = usePos((s) => s.searchCustomer);
  const customerSearchResults = usePos((s) => s.customerSearchResults);
  const customerSearching = usePos((s) => s.customerSearching);
  const clearCustomerSearch = usePos((s) => s.clearCustomerSearch);
  const cart = usePos((s) => s.cart);
  const setQty = usePos((s) => s.setQty);
  const removeItem = usePos((s) => s.removeItem);
  const setStage = usePos((s) => s.setStage);
  const setMode = usePos((s) => s.setMode);
  const holdCart = usePos((s) => s.holdCart);
  const heldCount = usePos((s) => s.heldOrders.length);

  const [phone, setPhone] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showHeld, setShowHeld] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSearchedPhone = useRef("");
  const prevSelectedId = useRef<string | null>(null);
  const prevCartLen = useRef(0);

  // Debounced customer search
  useEffect(() => {
    if (selected) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (phone.length >= 3) {
      debounceRef.current = setTimeout(() => {
        lastSearchedPhone.current = phone;
        searchCustomer(phone);
      }, 400);
    } else {
      clearCustomerSearch();
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [phone, selected, searchCustomer, clearCustomerSearch]);

  // Auto-select / auto-register
  useEffect(() => {
    if (selected) return;
    // 1. Auto-select if exactly one match found
    if (customerSearchResults.length === 1 && phone.length >= 3) {
      selectCustomer(customerSearchResults[0]);
      setPhone("");
    }
    // 2. Auto-pop registration if 10 digits and no match (only after search finishes for this exact phone)
    if (
      phone.length === 10 &&
      customerSearchResults.length === 0 &&
      !customerSearching &&
      lastSearchedPhone.current === phone
    ) {
      setShowAdd(true);
    }
  }, [customerSearchResults, customerSearching, phone, selected, selectCustomer]);

  // Auto-transition to payment (only on new selection or first cart item)
  const currentStage = usePos((s) => s.stage);
  useEffect(() => {
    const isNewSelection = selected && !prevSelectedId.current;
    const isNewCartItem = cart.length > 0 && prevCartLen.current === 0;
    if (
      (isNewSelection || isNewCartItem) &&
      selected &&
      cart.length > 0 &&
      currentStage === "pos"
    ) {
      setStage("payment");
    }
    prevSelectedId.current = selected?.id ? String(selected.id) : null;
    prevCartLen.current = cart.length;
  }, [selected, cart.length, currentStage, setStage]);

  const pride = !!selected?.pride;
  const subtotal = subtotalOf(cart, pride);
  const gross = grossSubtotalOf(cart);
  const memberSavings = +(gross - subtotal).toFixed(2);
  const canPay = !!selected && cart.length > 0;


  return (
    <div className="h-full flex flex-col bg-card">
      <div className="border-b-2 border-foreground p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-extrabold uppercase tracking-widest">Customer Lookup</div>
          {heldCount > 0 && (
            <button onClick={() => setShowHeld(true)}
              className="pressable bg-warning text-warning-foreground border-2 border-foreground px-2 py-0.5 text-[10px] font-extrabold flex items-center gap-1">
              <PauseCircle size={12}/> {heldCount} HELD
            </button>
          )}
        </div>
        {!selected ? (
          <>
            <div className="flex gap-2 relative">
              <div className="flex items-center px-2 bg-foreground text-background border-2 border-foreground">
                {customerSearching ? <Loader2 size={18} className="animate-spin"/> : <Search size={18}/>}
              </div>
              <input value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="PHONE NUMBER" inputMode="numeric"
                className="flex-1 border-2 border-foreground bg-background px-3 py-2 font-mono font-bold text-base outline-none focus:border-primary"/>
              <button onClick={() => setShowAdd(true)}
                className="pressable bg-accent text-accent-foreground border-2 border-foreground px-3 font-extrabold text-xs flex items-center gap-1">
                <UserPlus size={18}/> NEW
              </button>
            </div>
            {customerSearchResults.length > 0 && (
              <div className="mt-2 border-2 border-foreground bg-background max-h-40 overflow-y-auto scrollbar-sharp">
                {customerSearchResults.map((c) => (
                  <button key={String(c.id)} onClick={() => { selectCustomer(c); setPhone(""); }}
                    className="w-full px-3 py-2 text-left border-b-2 border-foreground last:border-b-0 hover:bg-primary hover:text-primary-foreground flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-sm flex items-center gap-1">
                        {c.name} {c.pride && <Sparkles size={12} className="text-accent"/>}
                      </div>
                      <div className="font-mono text-xs font-bold">{c.phone}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {phone.length >= 10 && customerSearchResults.length === 0 && !customerSearching && (
              <div className="mt-2 border-2 border-foreground bg-background p-2 text-center">
                <span className="font-bold text-xs text-muted-foreground uppercase">No customer found · </span>
                <button onClick={() => setShowAdd(true)} className="font-extrabold text-xs text-accent uppercase underline">Register New</button>
              </div>
            )}
          </>
        ) : (
          <div className="border-2 border-primary bg-background p-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-extrabold text-lg leading-tight">{selected.name}</div>
                <div className="font-mono font-bold text-xs">{selected.phone}</div>
              </div>
              <button onClick={() => selectCustomer(null)} className="border-2 border-foreground bg-card hover:bg-destructive hover:text-destructive-foreground p-1">
                <X size={16}/>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="font-mono font-extrabold text-sm">{selected.points} PTS</span>
              {selected.pride && (
                <span className="px-2 py-1 text-[10px] font-extrabold border-2 border-foreground bg-accent text-accent-foreground flex items-center gap-1 animate-pulse">
                  <Sparkles size={12}/> PRIDE MEMBER · 10% OFF
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-sharp min-h-0">
        <div className="grid grid-cols-12 px-3 py-2 bg-foreground text-background text-[10px] font-extrabold uppercase tracking-wider sticky top-0">
          <div className="col-span-6">Item</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-3 text-right">Total</div>
          <div className="col-span-1"></div>
        </div>
        {cart.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground font-bold text-sm uppercase tracking-wider">
            Cart Empty · Scan Items
          </div>
        ) : (
          cart.map((i, idx) => {
            const mp = memberPriceOf(i, pride);
            const discounted = mp < i.unitPrice;
            return (
              <div key={i.pid} className={`grid grid-cols-12 px-3 py-2 items-center border-b border-foreground/30 ${idx % 2 === 1 ? "bg-row-alt" : ""}`}>
                <div className="col-span-6">
                  <div className="font-extrabold text-sm leading-tight">{i.name}</div>
                  <div className="font-mono text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                    <span>{i.pid} ·</span>
                    {discounted ? (
                      <>
                        <span className="line-through opacity-70">{formatINR(i.unitPrice)}</span>
                        <span className="text-accent font-extrabold">{formatINR(mp)}</span>
                      </>
                    ) : (
                      <span>{formatINR(i.unitPrice)}</span>
                    )}
                    {i.weighed && <span>/KG</span>}
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-center gap-1">
                  <button onClick={() => setQty(i.pid, +(i.quantity - (i.weighed ? 0.1 : 1)).toFixed(3))}
                    className="border-2 border-foreground w-6 h-6 font-extrabold text-sm hover:bg-foreground hover:text-background">−</button>
                  <span className="font-mono font-extrabold text-sm w-10 text-center tabular-nums">
                    {i.weighed ? i.quantity.toFixed(2) : i.quantity}
                  </span>
                  <button onClick={() => setQty(i.pid, +(i.quantity + (i.weighed ? 0.1 : 1)).toFixed(3))}
                    className="border-2 border-foreground w-6 h-6 font-extrabold text-sm hover:bg-foreground hover:text-background">+</button>
                </div>
                <div className="col-span-3 text-right font-mono font-extrabold text-base tabular-nums">
                  {formatINR(mp * i.quantity)}
                </div>
                <div className="col-span-1 flex justify-end">
                  <button onClick={() => removeItem(i.pid)} className="border-2 border-foreground p-0.5 hover:bg-destructive hover:text-destructive-foreground">
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t-2 border-foreground bg-background">
        {memberSavings > 0 && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-accent text-accent-foreground border-b-2 border-foreground">
            <span className="font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-1"><Sparkles size={12}/> PRIDE Savings</span>
            <span className="font-mono font-extrabold tabular-nums text-sm">−{formatINR(memberSavings)}</span>
          </div>
        )}
        <div className="flex items-end justify-between px-3 py-2 bg-foreground text-background">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest">Total Due</div>
            <div className="text-[10px] font-bold opacity-80">{cart.length} item{cart.length !== 1 && "s"}</div>
          </div>
          <div className="font-mono font-extrabold tabular-nums leading-none" style={{ fontSize: 40 }}>{formatINR(subtotal)}</div>
        </div>
        <div className="grid grid-cols-4 gap-0">
          <button onClick={() => setMode("wastage")}
            className="pressable bg-destructive text-destructive-foreground border-t-2 border-foreground h-14 font-extrabold text-[10px] tracking-tight flex flex-col items-center justify-center">
            <Trash size={16}/> WASTAGE
          </button>
          <button onClick={holdCart} disabled={cart.length === 0}
            className="pressable bg-warning text-warning-foreground border-t-2 border-l-2 border-foreground h-14 font-extrabold text-[10px] tracking-tight flex flex-col items-center justify-center disabled:opacity-50">
            <PauseCircle size={16}/> HOLD
          </button>
          <button onClick={() => setStage("payment")}
            disabled={!canPay}
            className="pressable-primary col-span-2 bg-primary text-primary-foreground border-t-2 border-l-2 border-foreground h-14 font-extrabold text-xl tracking-widest flex items-center justify-center gap-2 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:shadow-none">
            <CreditCard size={22}/> PAY
          </button>
        </div>
        {!selected && (
          <div className="bg-warning text-warning-foreground text-center font-extrabold text-[11px] uppercase tracking-wider py-1 border-t-2 border-foreground">
            Select Customer to Enable Payment
          </div>
        )}
      </div>

      {showAdd && <AddCustomerModal onClose={() => setShowAdd(false)} defaultPhone={phone} />}
      {showHeld && <HeldOrdersModal onClose={() => setShowHeld(false)} />}
    </div>
  );
}
