import { useState } from "react";
import { usePos, formatINR } from "../store";
import type { PaymentMethod } from "../store";
import type { Transaction } from "../store";
import ManagerPinModal from "./ManagerPinModal";
import {
  RotateCcw, Search, X, CheckSquare, Square, Loader2, AlertTriangle,
  Banknote, Smartphone, CreditCard, Wallet, Phone,
} from "lucide-react";

export default function ReturnScreen() {
  const lookedUpTx = usePos((s) => s.lookedUpTx);
  const returnLoading = usePos((s) => s.returnLoading);
  const returnError = usePos((s) => s.returnError);
  const lookupTransaction = usePos((s) => s.lookupTransaction);
  const toggleReturnItem = usePos((s) => s.toggleReturnItem);
  const setReturnQty = usePos((s) => s.setReturnQty);
  const processRefund = usePos((s) => s.processRefund);
  const clearReturn = usePos((s) => s.clearReturn);
  const shift = usePos((s) => s.shift);

  const [receiptId, setReceiptId] = useState("");
  const [searchError, setSearchError] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [refundMethod, setRefundMethod] = useState<PaymentMethod>("Wallet");

  // No-receipt phone search state
  const [phoneQuery, setPhoneQuery] = useState("");
  const [phoneSearching, setPhoneSearching] = useState(false);
  const [phoneSearchError, setPhoneSearchError] = useState("");
  const [foundCustomer, setFoundCustomer] = useState<{ id: string; name: string; phone: string; wallet_balance?: number } | null>(null);
  const [customerTxs, setCustomerTxs] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  const handleSearch = async () => {
    setSearchError("");
    if (receiptId.trim().length < 6) {
      setSearchError("Enter at least 6 characters of the receipt ID");
      return;
    }
    const ok = await lookupTransaction(receiptId.trim());
    if (!ok && !returnError) setSearchError("Transaction not found");
  };

  const searchCustomer = usePos((s) => s.searchCustomer);
  const fetchCustomerTransactions = usePos((s) => s.fetchCustomerTransactions);
  const selectCustomer = usePos((s) => s.selectCustomer);

  const handlePhoneSearch = async () => {
    setPhoneSearchError("");
    setFoundCustomer(null);
    setCustomerTxs([]);
    if (phoneQuery.trim().length < 3) {
      setPhoneSearchError("Enter at least 3 digits");
      return;
    }
    setPhoneSearching(true);
    try {
      await searchCustomer(phoneQuery.trim());
      const results = usePos.getState().customerSearchResults;
      if (results.length === 0) {
        setPhoneSearchError("No customer found");
        setPhoneSearching(false);
        return;
      }
      const customer = results[0];
      setFoundCustomer({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        wallet_balance: customer.wallet_balance,
      });
      selectCustomer(customer);
      setTxLoading(true);
      const txs = await fetchCustomerTransactions(phoneQuery.trim());
      setCustomerTxs(txs.slice(0, 5));
      setTxLoading(false);
    } catch {
      setPhoneSearchError("Search failed");
    } finally {
      setPhoneSearching(false);
    }
  };

  const handleTxSelect = async (tx: Transaction) => {
    setPhoneSearchError("");
    const ok = await lookupTransaction(tx.id);
    if (!ok && !returnError) setPhoneSearchError("Transaction not found");
  };

  const selectedItems = lookedUpTx?.items.filter((i) => i.selected) || [];
  const refundTotal = selectedItems.reduce((s, i) => s + i.unitPrice * i.returnQty, 0);
  const canProcess = selectedItems.length > 0 && refundTotal > 0;

  const handleRefund = async (managerPin: string) => {
    const ok = await processRefund(managerPin, refundMethod);
    if (!ok) throw new Error("Refund failed"); // triggers shake in ManagerPinModal
  };

  // ── Search phase ──
  if (!lookedUpTx) {
    return (
      <div className="fixed inset-0 bg-foreground/80 flex items-center justify-center z-50">
        <div className="border-sharp-3 bg-card w-[580px]" style={{ boxShadow: "10px 10px 0 0 hsl(var(--foreground))" }}>
          <div className="flex items-center justify-between bg-destructive text-destructive-foreground px-5 py-3 border-b-2 border-foreground">
            <div className="flex items-center gap-2">
              <RotateCcw size={22} />
              <h2 className="text-xl font-extrabold uppercase tracking-tight">Return / Refund</h2>
            </div>
            <button onClick={clearReturn} className="border-2 border-destructive-foreground p-1 hover:bg-foreground">
              <X size={18} />
            </button>
          </div>

          <div className="p-5">
            {/* Receipt ID Search */}
            <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-2">
              Search Receipt ID
            </label>
            <div className="flex gap-2 mb-4">
              <div className="flex items-center px-3 bg-foreground text-background border-2 border-foreground">
                {returnLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              </div>
              <input
                value={receiptId}
                onChange={(e) => setReceiptId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="PASTE OR TYPE RECEIPT UUID"
                disabled={returnLoading}
                className="flex-1 border-2 border-foreground bg-background px-3 py-2 font-mono font-bold text-base outline-none focus:border-primary disabled:opacity-50"
              />
              <button onClick={handleSearch} disabled={returnLoading}
                className="pressable-primary bg-primary text-primary-foreground border-2 border-foreground px-5 font-extrabold text-sm tracking-widest disabled:opacity-50">
                LOOK UP
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-foreground/20"/>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">OR</span>
              <div className="flex-1 h-px bg-foreground/20"/>
            </div>

            {/* Phone Search */}
            <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-2">
              Search by Phone Number
            </label>
            <div className="flex gap-2 mb-3">
              <div className="flex items-center px-3 bg-foreground text-background border-2 border-foreground">
                {phoneSearching || txLoading ? <Loader2 size={18} className="animate-spin" /> : <Phone size={18} />}
              </div>
              <input
                value={phoneQuery}
                onChange={(e) => setPhoneQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePhoneSearch()}
                placeholder="ENTER CUSTOMER PHONE"
                disabled={phoneSearching || txLoading}
                className="flex-1 border-2 border-foreground bg-background px-3 py-2 font-mono font-bold text-base outline-none focus:border-primary disabled:opacity-50"
              />
              <button onClick={handlePhoneSearch} disabled={phoneSearching || txLoading}
                className="pressable-primary bg-primary text-primary-foreground border-2 border-foreground px-5 font-extrabold text-sm tracking-widest disabled:opacity-50">
                FIND
              </button>
            </div>

            {(searchError || returnError || phoneSearchError) && (
              <div className="bg-destructive text-destructive-foreground font-extrabold text-center py-2 text-sm uppercase tracking-wider border-2 border-foreground flex items-center justify-center gap-2">
                <AlertTriangle size={16} /> {searchError || returnError || phoneSearchError}
              </div>
            )}

            {/* Customer found + transaction history */}
            {foundCustomer && (
              <div className="mt-4">
                <div className="border-2 border-foreground bg-background p-3 mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Customer</div>
                    <div className="font-extrabold text-sm">{foundCustomer.name}</div>
                    <div className="font-mono text-[10px] font-bold text-muted-foreground">{foundCustomer.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Wallet</div>
                    <div className="font-mono font-extrabold text-sm tabular-nums">{formatINR(foundCustomer.wallet_balance ?? 0)}</div>
                  </div>
                </div>

                <div className="text-[10px] font-extrabold uppercase tracking-widest mb-2">
                  Last 5 Transactions
                </div>
                {txLoading ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="font-extrabold text-xs uppercase tracking-widest">Loading history...</span>
                  </div>
                ) : customerTxs.length === 0 ? (
                  <div className="border-2 border-foreground bg-background p-4 text-center text-muted-foreground font-extrabold text-xs uppercase tracking-widest">
                    No transactions found
                  </div>
                ) : (
                  <div className="border-2 border-foreground mb-3">
                    <div className="grid grid-cols-12 px-3 py-2 bg-foreground text-background text-[10px] font-extrabold uppercase tracking-wider">
                      <div className="col-span-4">Receipt ID</div>
                      <div className="col-span-4 text-center">Date</div>
                      <div className="col-span-3 text-right">Amount</div>
                      <div className="col-span-1"></div>
                    </div>
                    {customerTxs.map((tx, idx) => (
                      <button key={tx.id}
                        onClick={() => handleTxSelect(tx)}
                        className={`w-full grid grid-cols-12 px-3 py-2 items-center text-left border-b border-foreground/30 last:border-b-0 hover:bg-primary/10
                          ${idx % 2 === 1 ? "bg-row-alt" : ""}`}>
                        <div className="col-span-4 font-mono font-bold text-xs truncate">{tx.id.slice(0, 12).toUpperCase()}…</div>
                        <div className="col-span-4 text-center font-mono font-bold text-xs">{new Date(tx.timestamp).toLocaleDateString("en-GB")}</div>
                        <div className="col-span-3 text-right font-mono font-extrabold text-sm tabular-nums">{formatINR(tx.total)}</div>
                        <div className="col-span-1 text-right">
                          <Search size={14} className="inline text-muted-foreground"/>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!foundCustomer && (
              <div className="mt-6 text-center text-muted-foreground">
                <RotateCcw size={48} className="mx-auto mb-3 opacity-30" />
                <div className="font-extrabold text-sm uppercase tracking-widest">Enter a Receipt ID or Phone to Begin</div>
                <div className="text-xs font-bold mt-1">Find the ID on the printed receipt or search by customer phone</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Item selection phase ──
  return (
    <div className="fixed inset-0 bg-foreground/80 flex items-center justify-center z-50">
      <div className="border-sharp-3 bg-card w-[700px] max-h-[720px] overflow-y-auto scrollbar-sharp"
        style={{ boxShadow: "10px 10px 0 0 hsl(var(--foreground))" }}>

        {/* Header */}
        <div className="flex items-center justify-between bg-destructive text-destructive-foreground px-5 py-3 border-b-2 border-foreground sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <RotateCcw size={22} />
            <div>
              <h2 className="text-xl font-extrabold uppercase tracking-tight">Process Return</h2>
              <div className="font-mono font-bold text-[10px] opacity-90">
                TXN: {lookedUpTx.id.slice(0, 8).toUpperCase()}…
                {lookedUpTx.customerName && ` · ${lookedUpTx.customerName}`}
              </div>
            </div>
          </div>
          <button onClick={clearReturn} className="border-2 border-destructive-foreground p-1 hover:bg-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {/* Original transaction info */}
          <div className="border-2 border-foreground bg-background p-3 mb-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Original Sale</div>
              <div className="font-mono font-extrabold text-lg tabular-nums">{formatINR(lookedUpTx.total)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Method</div>
              <div className="font-extrabold text-sm uppercase">{lookedUpTx.method}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Date</div>
              <div className="font-mono font-bold text-xs">{new Date(lookedUpTx.timestamp).toLocaleString("en-GB")}</div>
            </div>
          </div>

          {/* Item list with checkboxes */}
          <div className="text-[10px] font-extrabold uppercase tracking-widest mb-2">
            Select Items to Return
          </div>
          <div className="border-2 border-foreground mb-4">
            <div className="grid grid-cols-12 px-3 py-2 bg-foreground text-background text-[10px] font-extrabold uppercase tracking-wider">
              <div className="col-span-1"></div>
              <div className="col-span-5">Item</div>
              <div className="col-span-2 text-center">Orig Qty</div>
              <div className="col-span-2 text-center">Return Qty</div>
              <div className="col-span-2 text-right">Refund</div>
            </div>
            {lookedUpTx.items.map((item, idx) => (
              <div key={item.pid}
                className={`grid grid-cols-12 px-3 py-2 items-center border-b border-foreground/30 last:border-b-0 cursor-pointer
                  ${idx % 2 === 1 ? "bg-row-alt" : ""}
                  ${item.selected ? "bg-destructive/10" : "opacity-60"}`}
                onClick={() => toggleReturnItem(item.pid)}>
                <div className="col-span-1">
                  {item.selected
                    ? <CheckSquare size={20} className="text-destructive" />
                    : <Square size={20} className="text-muted-foreground" />}
                </div>
                <div className="col-span-5">
                  <div className="font-extrabold text-sm leading-tight">{item.name}</div>
                  <div className="font-mono text-[10px] font-bold text-muted-foreground">
                    {item.pid} · {formatINR(item.unitPrice)}{item.weighed ? "/KG" : ""}
                  </div>
                </div>
                <div className="col-span-2 text-center font-mono font-extrabold text-sm tabular-nums">
                  {item.weighed ? item.originalQty.toFixed(2) : item.originalQty}
                </div>
                <div className="col-span-2 flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {item.selected ? (
                    <>
                      <button onClick={() => setReturnQty(item.pid, +(item.returnQty - (item.weighed ? 0.1 : 1)).toFixed(3))}
                        className="border-2 border-foreground w-6 h-6 font-extrabold text-sm hover:bg-foreground hover:text-background">−</button>
                      <span className="font-mono font-extrabold text-sm w-10 text-center tabular-nums">
                        {item.weighed ? item.returnQty.toFixed(2) : item.returnQty}
                      </span>
                      <button onClick={() => setReturnQty(item.pid, +(item.returnQty + (item.weighed ? 0.1 : 1)).toFixed(3))}
                        className="border-2 border-foreground w-6 h-6 font-extrabold text-sm hover:bg-foreground hover:text-background">+</button>
                    </>
                  ) : (
                    <span className="font-mono text-sm text-muted-foreground">—</span>
                  )}
                </div>
                <div className="col-span-2 text-right font-mono font-extrabold text-sm tabular-nums">
                  {item.selected ? formatINR(item.unitPrice * item.returnQty) : "—"}
                </div>
              </div>
            ))}
          </div>

          {/* Refund method */}
          <div className="text-[10px] font-extrabold uppercase tracking-widest mb-2">Refund Payout Method</div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {([
              { m: "Cash" as PaymentMethod, icon: Banknote, label: "CASH" },
              { m: "UPI" as PaymentMethod, icon: Smartphone, label: "UPI" },
              { m: "Card" as PaymentMethod, icon: CreditCard, label: "CARD" },
              { m: "Wallet" as PaymentMethod, icon: Wallet, label: "WALLET" },
            ]).map(({ m, icon: Icon, label }) => (
              <button key={m} onClick={() => setRefundMethod(m)}
                className={`pressable border-2 border-foreground h-14 font-extrabold text-xs tracking-widest flex items-center justify-center gap-2
                  ${refundMethod === m ? "bg-destructive text-destructive-foreground" : "bg-card hover:bg-secondary"}`}>
                <Icon size={20} /> {label}
              </button>
            ))}
          </div>
          {lookedUpTx.method !== refundMethod && (
            <div className="bg-warning text-warning-foreground border-2 border-foreground px-3 py-2 mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
              <AlertTriangle size={14} />
              Original payment was {lookedUpTx.method} · Refunding as {refundMethod}
            </div>
          )}

          {returnError && (
            <div className="bg-destructive text-destructive-foreground font-extrabold text-center py-2 mb-3 text-sm uppercase tracking-wider border-2 border-foreground">
              {returnError}
            </div>
          )}

          {/* Refund total */}
          <div className="border-2 border-foreground mb-4">
            <div className="flex items-end justify-between px-4 py-3 bg-destructive text-destructive-foreground">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest">Refund Total</div>
                <div className="text-[10px] font-bold opacity-80">
                  {selectedItems.length} item{selectedItems.length !== 1 && "s"} · {refundMethod}
                </div>
              </div>
              <div className="font-mono font-extrabold tabular-nums leading-none" style={{ fontSize: 36 }}>
                −{formatINR(refundTotal)}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={clearReturn}
              className="pressable border-2 border-foreground bg-card h-14 font-extrabold tracking-widest">
              CANCEL
            </button>
            <button onClick={() => setShowPin(true)}
              disabled={!canProcess || returnLoading}
              className="pressable-primary bg-destructive text-destructive-foreground border-2 border-foreground h-14 font-extrabold tracking-widest text-base flex items-center justify-center gap-2 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:cursor-not-allowed">
              <RotateCcw size={20} /> PROCESS REFUND
            </button>
          </div>
        </div>
      </div>

      {/* Manager PIN auth overlay */}
      {showPin && (
        <ManagerPinModal
          onSubmit={handleRefund}
          onClose={() => setShowPin(false)}
          loading={returnLoading}
          error={returnError}
        />
      )}
    </div>
  );
}
