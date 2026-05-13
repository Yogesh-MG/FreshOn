import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePos, subtotalOf, formatINR } from "../store";
import type { PaymentMethod, Tender } from "../store";
import { invoke } from "@tauri-apps/api/core";
import {
  generateUPIQR, pushToCardMachine, pollUntilResolved,
  type BharatPePaymentStatus,
} from "../bharatpe";
import {
  Banknote, Smartphone, CreditCard, Sparkles, X, AlertTriangle,
  SplitSquareHorizontal, Plus, Trash2, Loader2, CheckCircle2, QrCode,
  WifiOff, XCircle, ShieldCheck, Wallet,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const ICON: Record<PaymentMethod, any> = {
  Cash: Banknote, UPI: Smartphone, Card: CreditCard, Sodexo: Sparkles, Wallet: Wallet,
};

type BPStep = "idle" | "generating" | "qr-shown" | "polling" | "card-pushed" | "success" | "failed";

/** Extended tender with per-item BharatPe verification status */
interface SplitTender extends Tender {
  bpStep: BPStep;
  bpTxnId: string;
  bpQR: string;
}

const isDigital = (m: PaymentMethod) => m === "UPI" || m === "Card";

export default function PaymentDrawer() {
  const cart = usePos((s) => s.cart);
  const customer = usePos((s) => s.selectedCustomer);
  const setStage = usePos((s) => s.setStage);
  const pay = usePos((s) => s.pay);
  const loading = usePos((s) => s.loading);
  const error = usePos((s) => s.error);

  const [split, setSplit] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [draftMethod, setDraftMethod] = useState<PaymentMethod>("Cash");

  // Default to Wallet for PRIDE members with balance (once)
  const defaultedToWallet = useRef(false);
  useEffect(() => {
    if (!defaultedToWallet.current && customer?.pride && (customer?.wallet_balance ?? 0) > 0) {
      setMethod("Wallet");
      defaultedToWallet.current = true;
    }
  }, [customer?.id]);
  const [draftAmt, setDraftAmt] = useState("");

  // ── Single-mode BharatPe state ──
  const [bpStep, setBpStep] = useState<BPStep>("idle");
  const [bpQR, setBpQR] = useState("");
  const [bpTxnId, setBpTxnId] = useState("");
  const [bpStatus, setBpStatus] = useState<BharatPePaymentStatus>("CREATED");
  const [bpError, setBpError] = useState("");
  const pollCancelRef = useRef(false);

  // ── Split-mode state with per-tender verification ──
  const [splitTenders, setSplitTenders] = useState<SplitTender[]>([]);
  const [activeSplitIdx, setActiveSplitIdx] = useState<number | null>(null);
  const splitPollCancelRef = useRef(false);

  const pride = !!customer?.pride;
  const subtotal = subtotalOf(cart, pride);
  const singleSurcharge = method === "Sodexo" ? +(subtotal * 0.05).toFixed(2) : 0;
  const singleTotal = +(subtotal + singleSurcharge).toFixed(2);

  const splitSodexo = splitTenders.filter((t) => t.method === "Sodexo").reduce((s, t) => s + t.amount, 0);
  const splitSurcharge = +(splitSodexo * 0.05).toFixed(2);
  const splitTotalDue = +(subtotal + splitSurcharge).toFixed(2);
  const splitPaid = splitTenders.reduce((s, t) => s + t.amount, 0);
  const splitRemaining = +(splitTotalDue - splitPaid).toFixed(2);

  // Is any split tender currently being verified?
  const splitVerifying = activeSplitIdx !== null;
  const hasUnverifiedDigital = splitTenders.some((t) => isDigital(t.method) && t.bpStep !== "success");

  // Cleanup on unmount
  useEffect(() => {
    return () => { pollCancelRef.current = true; splitPollCancelRef.current = true; };
  }, []);

  // ── Single-mode BharatPe flows ──
  const startUPIFlow = useCallback(async (amount: number) => {
    setBpStep("generating"); setBpError("");
    try {
      const qr = await generateUPIQR(amount);
      setBpQR(qr.qr_string); setBpTxnId(qr.transaction_id);
      setBpStep("polling"); pollCancelRef.current = false;
      const result = await pollUntilResolved(qr.transaction_id, (s) => {
        if (!pollCancelRef.current) setBpStatus(s.status);
      }, 60, 3000);
      if (pollCancelRef.current) return;
      setBpStep(result.status === "SUCCESS" ? "success" : "failed");
      if (result.status !== "SUCCESS") setBpError(`Payment ${result.status.toLowerCase()}`);
    } catch (err: any) { setBpStep("failed"); setBpError(err?.message || "UPI failed"); }
  }, []);

  const startCardFlow = useCallback(async (amount: number) => {
    setBpStep("generating"); setBpError("");
    try {
      const res = await pushToCardMachine(amount);
      setBpTxnId(res.transaction_id); setBpStep("card-pushed");
      pollCancelRef.current = false;
      const result = await pollUntilResolved(res.transaction_id, (s) => {
        if (!pollCancelRef.current) setBpStatus(s.status);
      }, 60, 3000);
      if (pollCancelRef.current) return;
      setBpStep(result.status === "SUCCESS" ? "success" : "failed");
      if (result.status !== "SUCCESS") setBpError(`Card ${result.status.toLowerCase()}`);
    } catch (err: any) { setBpStep("failed"); setBpError(err?.message || "Card failed"); }
  }, []);

  // Auto-trigger for single mode
  useEffect(() => {
    if (split || bpStep !== "idle") return;
    if (method === "UPI") startUPIFlow(singleTotal);
    else if (method === "Card") startCardFlow(singleTotal);
  }, [method, split, singleTotal, bpStep, startUPIFlow, startCardFlow]);

  const resetBP = () => {
    pollCancelRef.current = true;
    setBpStep("idle"); setBpQR(""); setBpTxnId(""); setBpStatus("CREATED"); setBpError("");
  };

  const handleMethodChange = (m: PaymentMethod) => { resetBP(); setMethod(m); };

  // ── Split-mode: verify a specific digital tender ──
  const verifySplitTender = useCallback(async (idx: number) => {
    const t = splitTenders[idx];
    if (!t || !isDigital(t.method)) return;

    setActiveSplitIdx(idx);
    splitPollCancelRef.current = false;

    // Update tender step
    const update = (patch: Partial<SplitTender>) =>
      setSplitTenders((prev) => prev.map((x, i) => i === idx ? { ...x, ...patch } : x));

    update({ bpStep: "generating" });

    try {
      if (t.method === "UPI") {
        const qr = await generateUPIQR(t.amount);
        update({ bpQR: qr.qr_string, bpTxnId: qr.transaction_id, bpStep: "polling" });
        const result = await pollUntilResolved(qr.transaction_id, () => {}, 60, 3000);
        if (splitPollCancelRef.current) return;
        update({ bpStep: result.status === "SUCCESS" ? "success" : "failed" });
      } else {
        const res = await pushToCardMachine(t.amount);
        update({ bpTxnId: res.transaction_id, bpStep: "card-pushed" });
        const result = await pollUntilResolved(res.transaction_id, () => {}, 60, 3000);
        if (splitPollCancelRef.current) return;
        update({ bpStep: result.status === "SUCCESS" ? "success" : "failed" });
      }
    } catch {
      update({ bpStep: "failed" });
    }
    setActiveSplitIdx(null);
  }, [splitTenders]);

  // Auto-verify next unverified digital tender sequentially
  useEffect(() => {
    if (!split || splitVerifying) return;
    const nextIdx = splitTenders.findIndex((t) => isDigital(t.method) && t.bpStep === "idle");
    if (nextIdx !== -1) verifySplitTender(nextIdx);
  }, [split, splitTenders, splitVerifying, verifySplitTender]);

  const addTender = () => {
    const amt = parseFloat(draftAmt);
    if (!amt || amt <= 0 || splitVerifying) return;
    setSplitTenders([...splitTenders, {
      method: draftMethod, amount: +amt.toFixed(2),
      bpStep: isDigital(draftMethod) ? "idle" : "success", // non-digital auto-verified
      bpTxnId: "", bpQR: "",
    }]);
    setDraftAmt("");
  };

  const removeSplitTender = (idx: number) => {
    const t = splitTenders[idx];
    if (activeSplitIdx === idx) { splitPollCancelRef.current = true; setActiveSplitIdx(null); }
    setSplitTenders(splitTenders.filter((_, i) => i !== idx));
  };

  // Collect all BharatPe txn IDs for the order
  const allBpTxnIds = useMemo(() => {
    if (!split) return bpTxnId || undefined;
    const ids = splitTenders.filter((t) => t.bpTxnId).map((t) => t.bpTxnId);
    return ids.length ? ids.join(",") : undefined;
  }, [split, bpTxnId, splitTenders]);

  const confirm = async () => {
    // Check if any tender is Cash
    const hasCash = split
      ? splitTenders.some((t) => t.method === "Cash")
      : method === "Cash";
    if (hasCash) {
      await invoke("open_cash_drawer").catch(console.error);
    }

    if (split) {
      if (Math.abs(splitRemaining) > 0.01 || hasUnverifiedDigital) return;
      const tenders: Tender[] = splitTenders.map((t) => ({ method: t.method, amount: t.amount }));
      await pay(tenders, allBpTxnIds);
    } else {
      if (isDigital(method) && bpStep !== "success") return;
      await pay([{ method, amount: singleTotal }], allBpTxnIds);
    }
  };

  const walletAvailable = customer?.wallet_balance ?? 0;
  const walletInsufficient = method === "Wallet" && singleTotal > walletAvailable;

  const canConfirm = useMemo(() => {
    if (loading) return false;
    if (split) return Math.abs(splitRemaining) <= 0.01 && !hasUnverifiedDigital;
    if (isDigital(method)) return bpStep === "success";
    if (method === "Wallet") return !walletInsufficient;
    return true;
  }, [loading, split, splitRemaining, hasUnverifiedDigital, method, bpStep, walletInsufficient]);

  // ── Shared UI helpers ──
  const Btn = ({ m, label, special, active, onClick, disabled }: {
    m: PaymentMethod; label: ReactNode; special?: boolean; active: boolean; onClick: () => void; disabled?: boolean;
  }) => {
    const I = ICON[m];
    return (
      <button onClick={onClick} disabled={disabled}
        className={`pressable border-2 border-foreground p-3 flex flex-col items-center justify-center gap-1 h-24 font-extrabold
          ${active ? (special ? "bg-sodexo text-sodexo-foreground" : "bg-primary text-primary-foreground")
                   : (special ? "bg-card text-sodexo border-sodexo" : "bg-card hover:bg-secondary")}
          ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
        <I size={26}/>
        <span className="tracking-widest text-xs">{label}</span>
      </button>
    );
  };

  /** Render BharatPe status for a specific amount/step/qr/txnId/method */
  const renderBPPanel = (pMethod: PaymentMethod, step: BPStep, qr: string, txnId: string, amount: number, onRetry?: () => void) => {
    if (!isDigital(pMethod)) return null;
    return (
      <div className="border-2 border-foreground mb-3 bg-background">
        {pMethod === "UPI" && (step === "qr-shown" || step === "polling") && qr && (
          <div className="flex flex-col items-center p-4 gap-2">
            <div className="text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-2">
              <QrCode size={14}/> SCAN TO PAY · BHARATPE
            </div>
            <div className="bg-white p-3 border-2 border-foreground">
              <QRCodeSVG value={qr} size={180} level="H" />
            </div>
            <div className="font-mono font-extrabold text-xl tabular-nums">{formatINR(amount)}</div>
            <div className="flex items-center gap-2 text-accent">
              <Loader2 size={14} className="animate-spin"/>
              <span className="font-extrabold text-[10px] uppercase tracking-widest">Waiting for payment...</span>
            </div>
            <div className="font-mono text-[9px] text-muted-foreground">TXN: {txnId}</div>
          </div>
        )}
        {pMethod === "Card" && step === "card-pushed" && (
          <div className="flex flex-col items-center p-4 gap-2">
            <CreditCard size={32} className="text-primary"/>
            <div className="font-extrabold uppercase tracking-widest text-xs">Pushed to Card Machine</div>
            <div className="font-mono font-extrabold text-2xl tabular-nums">{formatINR(amount)}</div>
            <div className="flex items-center gap-2 text-accent">
              <Loader2 size={14} className="animate-spin"/>
              <span className="font-extrabold text-[10px] uppercase tracking-widest">Waiting for tap/insert...</span>
            </div>
          </div>
        )}
        {step === "generating" && (
          <div className="flex flex-col items-center p-4 gap-2">
            <Loader2 size={28} className="animate-spin text-primary"/>
            <span className="font-extrabold text-xs uppercase tracking-widest">
              {pMethod === "UPI" ? "Generating QR..." : "Connecting..."}
            </span>
          </div>
        )}
        {step === "success" && (
          <div className="flex items-center gap-3 p-3 bg-primary text-primary-foreground">
            <CheckCircle2 size={22}/> <span className="font-extrabold text-xs uppercase tracking-widest">Verified</span>
            <span className="font-mono text-[10px] ml-auto">TXN: {txnId}</span>
          </div>
        )}
        {step === "failed" && (
          <div className="flex flex-col items-center p-3 gap-2 bg-destructive text-destructive-foreground">
            <XCircle size={24}/>
            <span className="font-extrabold text-xs uppercase tracking-widest">Payment Failed</span>
            {onRetry && (
              <button onClick={onRetry} className="pressable border-2 border-destructive-foreground px-3 py-1 font-extrabold text-[10px] tracking-widest">RETRY</button>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── Split tender status badge ──
  const tenderBadge = (t: SplitTender) => {
    if (!isDigital(t.method)) return <ShieldCheck size={14} className="text-primary"/>;
    if (t.bpStep === "success") return <CheckCircle2 size={14} className="text-primary"/>;
    if (t.bpStep === "failed") return <XCircle size={14} className="text-destructive"/>;
    if (t.bpStep === "idle") return <span className="w-3 h-3 border-2 border-foreground bg-muted"/>;
    return <Loader2 size={14} className="animate-spin text-accent"/>;
  };

  return (
    <div className="fixed inset-0 bg-foreground/80 flex items-center justify-center z-50">
      <div className="border-sharp-3 bg-card w-[720px] max-h-[720px] overflow-y-auto scrollbar-sharp" style={{ boxShadow: "10px 10px 0 0 hsl(var(--foreground))" }}>
        <div className="flex items-center justify-between bg-foreground text-background px-5 py-3 border-b-2 border-foreground">
          <h2 className="text-2xl font-extrabold uppercase tracking-tight">Payment</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => { setSplit(!split); setSplitTenders([]); resetBP(); setActiveSplitIdx(null); splitPollCancelRef.current = true; }}
              className={`pressable border-2 border-background px-3 py-1.5 font-extrabold text-xs tracking-widest flex items-center gap-2
                ${split ? "bg-accent text-accent-foreground" : "bg-foreground text-background"}`}>
              <SplitSquareHorizontal size={16}/> SPLIT {split ? "ON" : "OFF"}
            </button>
            <button onClick={() => { resetBP(); splitPollCancelRef.current = true; setStage("pos"); }} className="border-2 border-background p-1 hover:bg-destructive">
              <X size={20}/>
            </button>
          </div>
        </div>

        <div className="p-5">
          {!split ? (
            <>
              <div className="text-[11px] font-extrabold uppercase tracking-widest mb-2">Select Method</div>
              <div className="grid grid-cols-5 gap-3 mb-5">
                <Btn m="Cash" label="CASH" active={method==="Cash"} onClick={() => handleMethodChange("Cash")}/>
                <Btn m="UPI" label="UPI" active={method==="UPI"} onClick={() => handleMethodChange("UPI")}/>
                <Btn m="Card" label="CARD" active={method==="Card"} onClick={() => handleMethodChange("Card")}/>
                <Btn m="Sodexo" label="SODEXO" special active={method==="Sodexo"} onClick={() => handleMethodChange("Sodexo")}/>
                <Btn m="Wallet" label={
                  <>
                    <span>WALLET</span>
                    {customer?.wallet_balance !== undefined && (
                      <span className="text-[9px] leading-none">(Bal: {formatINR(customer.wallet_balance)})</span>
                    )}
                  </>
                } active={method==="Wallet"} onClick={() => handleMethodChange("Wallet")}
                  disabled={!customer || (customer?.wallet_balance ?? 0) <= 0}/>
              </div>
              {method === "Wallet" && customer && (customer.wallet_balance ?? 0) < singleTotal && (
                <div className="bg-warning text-warning-foreground border-2 border-foreground px-3 py-2 mb-3 text-[10px] font-extrabold uppercase tracking-widest text-center flex items-center justify-center gap-2">
                  <AlertTriangle size={14}/> Low Wallet Balance · {formatINR(customer.wallet_balance ?? 0)} available
                </div>
              )}
              {isDigital(method) && renderBPPanel(method, bpStep, bpQR, bpTxnId, singleTotal, resetBP)}
            </>
          ) : (
            <>
              <div className="text-[11px] font-extrabold uppercase tracking-widest mb-2">Split Tenders</div>
              <div className="border-2 border-foreground bg-background p-3 mb-3">
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {(["Cash","UPI","Card","Sodexo","Wallet"] as PaymentMethod[]).map((m) => (
                    <Btn key={m} m={m} label={m.toUpperCase()} special={m==="Sodexo"} active={draftMethod===m}
                      disabled={splitVerifying} onClick={() => setDraftMethod(m)}/>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="number" inputMode="decimal" value={draftAmt}
                    onChange={(e) => setDraftAmt(e.target.value)} disabled={splitVerifying}
                    placeholder={`AMOUNT (REMAINING ${formatINR(Math.max(0, splitRemaining))})`}
                    className="flex-1 border-2 border-foreground bg-background px-3 py-2 font-mono font-bold text-base outline-none focus:border-primary disabled:opacity-50"/>
                  <button onClick={() => setDraftAmt(Math.max(0, splitRemaining).toFixed(2))} disabled={splitVerifying}
                    className="pressable border-2 border-foreground bg-card px-3 font-extrabold text-xs tracking-widest disabled:opacity-50">REM</button>
                  <button onClick={addTender} disabled={splitVerifying}
                    className="pressable-primary bg-primary text-primary-foreground border-2 border-foreground px-4 font-extrabold text-sm tracking-widest flex items-center gap-1 disabled:opacity-50">
                    <Plus size={16}/> ADD
                  </button>
                </div>
                {splitVerifying && (
                  <div className="mt-2 bg-warning text-warning-foreground px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-center flex items-center justify-center gap-1">
                    <Loader2 size={12} className="animate-spin"/> Verifying digital payment — please wait
                  </div>
                )}
              </div>

              {/* Tender list with verification badges */}
              {splitTenders.length > 0 && (
                <div className="border-2 border-foreground mb-3">
                  {splitTenders.map((t, idx) => (
                    <div key={idx} className="border-b-2 border-foreground last:border-b-0">
                      <div className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2">
                          {tenderBadge(t)}
                          <span className="font-extrabold text-sm uppercase tracking-wider">{t.method}</span>
                          {isDigital(t.method) && t.bpStep === "success" && (
                            <span className="text-[9px] font-mono text-muted-foreground">{t.bpTxnId.slice(0,10)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-extrabold tabular-nums">{formatINR(t.amount)}</span>
                          <button onClick={() => removeSplitTender(idx)}
                            disabled={activeSplitIdx === idx}
                            className="border-2 border-foreground p-1 hover:bg-destructive hover:text-destructive-foreground disabled:opacity-30">
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      </div>
                      {/* Inline BharatPe panel for the actively-verifying tender */}
                      {activeSplitIdx === idx && renderBPPanel(t.method, t.bpStep, t.bpQR, t.bpTxnId, t.amount,
                        () => {
                          splitPollCancelRef.current = true;
                          setActiveSplitIdx(null);
                          setSplitTenders((prev) => prev.map((x, i) => i === idx ? { ...x, bpStep: "idle" } : x));
                        }
                      )}
                    </div>
                  ))}
                </div>
              )}

              {hasUnverifiedDigital && splitTenders.length > 0 && !splitVerifying && (
                <div className="bg-warning text-warning-foreground border-2 border-foreground px-3 py-2 mb-3 text-[10px] font-extrabold uppercase tracking-widest text-center">
                  Digital payments pending verification
                </div>
              )}
            </>
          )}

          {error && (
            <div className="bg-destructive text-destructive-foreground font-extrabold text-center py-2 mb-3 text-sm uppercase tracking-wider flex items-center justify-center gap-2">
              <WifiOff size={16}/> {error}
            </div>
          )}

          <div className="border-2 border-foreground">
            <div className="flex justify-between px-4 py-2 border-b-2 border-foreground bg-secondary">
              <span className="font-extrabold uppercase text-sm tracking-wider">Subtotal {pride && <span className="text-accent">· PRIDE</span>}</span>
              <span className="font-mono font-extrabold text-lg tabular-nums">{formatINR(subtotal)}</span>
            </div>
            {(split ? splitSurcharge : singleSurcharge) > 0 && (
              <div className="flex items-center justify-between px-4 py-2 border-b-2 border-foreground bg-destructive text-destructive-foreground">
                <span className="font-extrabold uppercase text-sm tracking-wider flex items-center gap-2">
                  <AlertTriangle size={16}/> Sodexo Surcharge (+5%)
                </span>
                <span className="font-mono font-extrabold text-lg tabular-nums">+{formatINR(split ? splitSurcharge : singleSurcharge)}</span>
              </div>
            )}
            <div className="flex items-end justify-between px-4 py-3 bg-foreground text-background">
              <span className="font-extrabold uppercase text-sm tracking-widest">{split ? "Due" : "Total"}</span>
              <span className="font-mono font-extrabold tabular-nums leading-none" style={{ fontSize: 36 }}>
                {formatINR(split ? splitTotalDue : singleTotal)}
              </span>
            </div>
            {split && (
              <div className={`flex items-end justify-between px-4 py-2 border-t-2 border-foreground
                ${Math.abs(splitRemaining)<0.01 && !hasUnverifiedDigital ? "bg-primary text-primary-foreground" : "bg-warning text-warning-foreground"}`}>
                <span className="font-extrabold uppercase text-sm tracking-widest">
                  {splitRemaining > 0.01 ? "Remaining" : splitRemaining < -0.01 ? "Overpaid"
                    : hasUnverifiedDigital ? "Verifying..." : "Balanced ✓"}
                </span>
                <span className="font-mono font-extrabold tabular-nums text-2xl">{formatINR(Math.abs(splitRemaining))}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <button onClick={() => { resetBP(); splitPollCancelRef.current = true; setStage("pos"); }}
              className="pressable border-2 border-foreground bg-card h-14 font-extrabold tracking-widest">CANCEL</button>
            <button onClick={confirm} disabled={!canConfirm}
              className="pressable-primary bg-primary text-primary-foreground border-2 border-foreground h-14 font-extrabold tracking-widest text-lg disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <><Loader2 size={20} className="animate-spin"/> PROCESSING...</>
              ) : (
                <>CONFIRM · {formatINR(split ? splitTotalDue : singleTotal)}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
