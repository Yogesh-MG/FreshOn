import { useRef, useState, useMemo } from "react";
import { usePos, formatINR, PRIDE_DISCOUNT_PCT } from "../store";
import { Printer, CheckCircle2, MessageCircle, Smartphone } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import type { CartItem } from "../store";

type Delivery = "Print" | "WhatsApp" | "SMS";

interface GstBucket {
  rate: number;
  taxableValue: number;
  cgstRate: number;
  cgstAmt: number;
  sgstRate: number;
  sgstAmt: number;
  totalGst: number;
}

function effectiveUnitPrice(item: CartItem, pride: boolean): number {
  if (pride && item.memberEligible) {
    return +(item.unitPrice * (1 - PRIDE_DISCOUNT_PCT)).toFixed(2);
  }
  return item.unitPrice;
}

function lineAmount(item: CartItem, pride: boolean): number {
  return +(effectiveUnitPrice(item, pride) * item.quantity).toFixed(2);
}

function buildGstBuckets(items: CartItem[], pride: boolean): GstBucket[] {
  const map = new Map<number, GstBucket>();

  for (const item of items) {
    const rate = item.gstRate ?? 18;
    const amount = lineAmount(item, pride);

    const taxableValue = amount / (1 + rate / 100);
    const totalGst = amount - taxableValue;

    const existing = map.get(rate);
    if (existing) {
      existing.taxableValue += taxableValue;
      existing.totalGst += totalGst;
    } else {
      map.set(rate, {
        rate,
        taxableValue,
        cgstRate: rate / 2,
        cgstAmt: 0,
        sgstRate: rate / 2,
        sgstAmt: 0,
        totalGst,
      });
    }
  }

  const buckets = Array.from(map.values()).sort((a, b) => a.rate - b.rate);
  for (const b of buckets) {
    b.taxableValue = +b.taxableValue.toFixed(2);
    b.totalGst = +b.totalGst.toFixed(2);
    b.cgstAmt = +(b.totalGst / 2).toFixed(2);
    b.sgstAmt = +(b.totalGst / 2).toFixed(2);
  }
  return buckets;
}

function totalGstFromBuckets(buckets: GstBucket[]): number {
  return +buckets.reduce((s, b) => s + b.totalGst, 0).toFixed(2);
}

// ─── Plain-text receipt formatter (42 chars wide for 80mm) ───────────
const W = 42;
const line = (ch = "-") => ch.repeat(W);
const center = (s: string) => {
  const pad = Math.max(0, Math.floor((W - s.length) / 2));
  return " ".repeat(pad) + s;
};
const leftRight = (l: string, r: string) => {
  const gap = Math.max(1, W - l.length - r.length);
  return l + " ".repeat(gap) + r;
};
const rpad = (s: string, n: number) => s.slice(0, n).padEnd(n);
const lpad = (s: string, n: number) => s.slice(0, n).padStart(n);

function buildReceiptText(
  tx: any, customer: any, pride: boolean,
  gstBuckets: GstBucket[], totalGst: number,
  isReturn: boolean, potentialSavings: number, actualSavings: number,
) {
  const lines: string[] = [];
  const p = (s: string) => lines.push(s);

  // ─── Header (Centered) ───
  p("[C][B]Eliteck Solutions & Services PVT Ltd[b]");
  p("[C]17, 80ft Rd, Kengeri Ring Rd,");
  p("[C]Mallathalli, Bengaluru-560056");
  p("[C]Phone: 8884463083, 9591241245");
  p("[C]GSTIN: 29AADCE6858N3ZS");
  p("[HR]");
  p("[C][B]TAX INVOICE[b]");
  p("[HR][c]");

  // ─── Metadata (Left Label, Right Value) ───
  const txShort = String(tx.id).slice(0, 8).toUpperCase();
  const date = new Date(tx.timestamp).toLocaleString("en-GB");
  p(leftRight(isReturn ? "REFUND NO:" : "INV NO:", txShort));
  p(leftRight("DATE:", date));
  p(leftRight("CUSTOMER:", (customer?.name || "Walk-in")));
  p(leftRight("PHONE:", (customer?.phone || "-")));
  if (customer?.gstin) {
    p(leftRight("CUST GST:", customer.gstin));
  }

  if (pride) {
    p("[C][B]*** PRIDE MEMBER ***[b][c]");
  }
  if (isReturn) {
    p("[C][B]*** REFUND ***[b][c]");
    p("[HR]");
  }
  // ─── Items Table (Solid Grid) ───
  p("[HR]");
  p("|Sn |Item             |Qty  |Rate    |Amount   |");
  p("[HR]");
  tx.items.forEach((item: CartItem, idx: number) => {
    const rate = effectiveUnitPrice(item, pride);
    const amt = lineAmount(item, pride);
    const qty = item.weighed ? item.quantity.toFixed(2) : String(item.quantity);
    const name = item.name.slice(0, 15);
    p(
      "|" + rpad(String(idx + 1), 3) + 
      "|" + rpad(name, 17) + 
      "|" + lpad(qty, 5) + 
      "|" + lpad(rate.toFixed(0), 8) + 
      "|" + lpad(amt.toFixed(0), 9) + "|"
    );
  });
  p("[HR]");
  p(leftRight("SUBTOTAL", tx.subtotal.toFixed(2)));
  if (tx.memberDiscount > 0) {
    p(leftRight("PRIDE DISCOUNT", "-" + tx.memberDiscount.toFixed(2)));
  }
  if (tx.surcharge > 0) {
    p(leftRight("SODEXO +5%", tx.surcharge.toFixed(2)));
  }
  p("[HR3]");
  p("[H][B]" + leftRight("NET AMOUNT", "Rs." + tx.total.toLocaleString("en-IN")) + "[b][h]");
  p("[HR3]");
  p(leftRight("Total GST Incl.", "Rs." + totalGst.toFixed(2)));
  // ─── Payment Details (Compact Table) ───
  p("[C]PAYMENT DETAILS[c]");
  p("[HR]");
  p("|Payment Method      |Amount             |");
  p("[HR]");
  for (const t of tx.tenders) {
    p("|" + rpad(t.method.toUpperCase(), 20) + "|" + lpad("Rs." + t.amount.toFixed(2), 19) + "|");
  }
  p("[HR]");
  // ─── GST Summary (ASCII) ───
  p("[C]GST SUMMARY[c]");
  p("[HR]");
  p("|TaxVal   |C %  |C Amt  |S %  |S Amt  |Total  |");
  p("[HR]");
  for (const b of gstBuckets) {
    p(
      "|" + rpad(b.taxableValue.toFixed(0), 9) +
      "|" + lpad(b.cgstRate.toFixed(1), 5) +
      "|" + lpad(b.cgstAmt.toFixed(0), 7) +
      "|" + lpad(b.sgstRate.toFixed(1), 5) +
      "|" + lpad(b.sgstAmt.toFixed(0), 7) +
      "|" + lpad(b.totalGst.toFixed(0), 7) + "|"
    );
  }
  p("[HR]");
  p("");

  // ─── PRIDE Nudge ───
  p("[HR]");
  p("[C][B]--- YOUR SAVINGS ---[b][c]");
  if (pride) {
    p("[C][B]YOU SAVED Rs." + actualSavings.toFixed(2) + " WITH PRIDE![b][c]");
  } else {
    p("[C]JOIN PRIDE TO HAVE SAVED[c]");
    p("[C][B]Rs." + potentialSavings.toFixed(0) + " ON THIS BILL![b][c]");
  }
  p("[HR]");
  // ─── Footer (SMALL) ───
  p("");
  p("[C][B]THANK YOU![b][c]");
  p("[C]Loyalty: " + Math.floor(tx.total / 10) + " PTS[c]");
  p("");
  p("[C]Download our App:[c]");
  p("[C][QR]https://freshon.in/ios[qr] [QR]https://freshon.in/android[qr][c]");
  p("");
  p("[C][BAR]" + tx.id + "[bar][c]");
  p("[C]" + tx.id + "[c]");
  p("[s]");

  return lines.join("\n");
}

export default function ReceiptModal() {
  const tx = usePos((s) => s.lastTransaction);
  const customer = usePos((s) => s.selectedCustomer);
  const clearCart = usePos((s) => s.clearCart);
  const selectCustomer = usePos((s) => s.selectCustomer);
  const setStage = usePos((s) => s.setStage);
  const setDelivery = usePos((s) => s.setReceiptDelivery);
  const clearReturn = usePos((s) => s.clearReturn);

  const receiptRef = useRef<HTMLDivElement>(null);
  const [paperless, setPaperless] = useState(false);
  const [chosen, setChosen] = useState<Delivery | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<Delivery | null>(null);
  const [printing, setPrinting] = useState(false);

  if (!tx) return null;

  const txIdShort = String(tx.id).slice(0, 8).toUpperCase();
  const isReturn = tx.transactionType === "RETURN";
  const pride = !!customer?.pride;

  const gstBuckets = useMemo(() => buildGstBuckets(tx.items, pride), [tx.items, pride]);
  const totalGst = useMemo(() => totalGstFromBuckets(gstBuckets), [gstBuckets]);

  const potentialSavings = +(tx.total * 0.30).toFixed(2);
  const actualSavings = tx.memberDiscount;

  const done = () => {
    clearCart();
    selectCustomer(null);
    if (isReturn) clearReturn();
    else setStage("pos");
  };

  const selectedPrinter = usePos((s) => s.selectedPrinter);

  const handlePrint = async () => {
    setPrinting(true);
    try {
      const text = buildReceiptText(
        tx, customer, pride, gstBuckets, totalGst,
        isReturn, potentialSavings, actualSavings,
      );
      console.log("Sending to printer:", selectedPrinter);
      await invoke("print_receipt", {
        printerName: selectedPrinter || "",
        content: text,
        includeLogo: true,
        isPride: pride,
      });
      console.log("Print sent successfully!");
    } catch (err) {
      console.error("Direct print failed:", err);
      window.print();
    } finally {
      setPrinting(false);
    }
  };

  const send = (d: Delivery) => {
    setChosen(d);
    setSending(true);
    setTimeout(() => {
      setDelivery(d);
      setSending(false);
      setSent(d);
    }, 900);
  };

  const receiptStyle: React.CSSProperties = {
    width: 300,
    fontFamily: "'Courier New', monospace",
    fontSize: 13,
    lineHeight: 1.25,
    color: "#000",
    background: "#fff",
    padding: 12,
    boxSizing: "border-box",
  };

  const center: React.CSSProperties = { textAlign: "center" };
  const bold: React.CSSProperties = { fontWeight: "bold" };
  const flexBetween: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
  };
  const borderBottom: React.CSSProperties = {
    borderBottom: "1px solid #000",
    paddingBottom: 4,
    marginBottom: 4,
  };
  const borderBottomDashed: React.CSSProperties = {
    borderBottom: "1px dashed #000",
    paddingBottom: 4,
    marginBottom: 4,
    marginTop: 4,
  };
  const sectionDivider: React.CSSProperties = {
    borderTop: "1px dashed #000",
    borderBottom: "1px dashed #000",
    paddingTop: 4,
    paddingBottom: 4,
    marginTop: 4,
    marginBottom: 4,
  };

  return (
    <div className="fixed inset-0 bg-foreground/80 flex items-center justify-center z-50 p-4">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-thermal, #receipt-thermal * { visibility: visible; }
          #receipt-thermal { position: absolute; left: 0; top: 0; width: 80mm !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="border-sharp-3 bg-card flex" style={{ boxShadow: "10px 10px 0 0 hsl(var(--foreground))" }}>
        {/* Receipt — 300px thermal (Scrollable Wrapper) */}
        <div className="overflow-y-auto max-h-[70vh] bg-white scrollbar-hide">
          <div ref={receiptRef} id="receipt-thermal" style={receiptStyle}>
            {/* ─── Header ─── */}
            <div style={{ ...center, ...borderBottom }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                <img src="/logo.png" alt="Logo" style={{ width: 160, height: "auto" }} />
              </div>
              <div style={{ ...bold, fontSize: 13 }}>Eliteck Solutions &amp; Services PVT Ltd</div>
              <div style={{ fontSize: 10 }}>17, 80 ft Road, Kengeri Ring Road,</div>
              <div style={{ fontSize: 10 }}>Mallathalli, Bengaluru-560056</div>
              <div style={{ fontSize: 10, marginTop: 3 }}>GSTIN: 29AADCE6858N3ZS</div>
              <div style={{ ...bold, fontSize: 15, marginTop: 6, letterSpacing: 1 }}>TAX INVOICE</div>
            </div>

            {isReturn && (
              <div style={{ ...center, ...bold, fontSize: 14, border: "2px solid #000", marginBottom: 6, padding: "2px 0" }}>
                *** REFUND ***
              </div>
            )}

            {/* ─── Txn Details ─── */}
            <div style={{ fontSize: 12, marginBottom: 4 }}>
              <div style={flexBetween}>
                <span>{isReturn ? "REFUND NO:" : "INVOICE NO:"}</span>
                <span style={bold}>{txIdShort}…</span>
              </div>
              <div style={flexBetween}>
                <span>DATE:</span>
                <span>{new Date(tx.timestamp).toLocaleString("en-GB")}</span>
              </div>
              <div style={flexBetween}>
                <span>CUST:</span>
                <span style={bold}>{customer?.name || "Walk-in"}</span>
              </div>
              <div style={flexBetween}>
                <span>PHONE:</span>
                <span>{customer?.phone || "-"}</span>
              </div>
              {/* Replace TIER with GST */}
              {customer?.gstin && (
                <div style={flexBetween}>
                  <span>CUST GST:</span>
                  <span style={bold}>{customer.gstin}</span>
                </div>
              )}
              {tx.bharatpeTxnId && (
                <div style={flexBetween}>
                  <span>BP-TXN:</span>
                  <span style={bold}>{tx.bharatpeTxnId}</span>
                </div>
              )}
            </div>

          <div style={borderBottomDashed} />

          {/* ─── Item Table ─── */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #000", padding: "2px 3px", textAlign: "left", width: "8%" }}>Sn</th>
                <th style={{ border: "1px solid #000", padding: "2px 3px", textAlign: "left", width: "38%" }}>Item Name</th>
                <th style={{ border: "1px solid #000", padding: "2px 3px", textAlign: "right", width: "14%" }}>MRP</th>
                <th style={{ border: "1px solid #000", padding: "2px 3px", textAlign: "right", width: "10%" }}>Qty</th>
                <th style={{ border: "1px solid #000", padding: "2px 3px", textAlign: "right", width: "14%" }}>Rate</th>
                <th style={{ border: "1px solid #000", padding: "2px 3px", textAlign: "right", width: "16%" }}>Amt</th>
              </tr>
            </thead>
            <tbody>
              {tx.items.map((item, idx) => {
                const rate = effectiveUnitPrice(item, pride);
                const amt = lineAmount(item, pride);
                return (
                  <tr key={item.pid}>
                    <td style={{ border: "1px solid #000", padding: "2px 3px", textAlign: "left" }}>{idx + 1}</td>
                    <td style={{ border: "1px solid #000", padding: "2px 3px", textAlign: "left" }}>
                      <div style={{ fontWeight: "bold" }}>{item.name}</div>
                      <div style={{ fontSize: 9 }}>{item.pid}{item.weighed ? " /KG" : ""}</div>
                    </td>
                    <td style={{ border: "1px solid #000", padding: "2px 3px", textAlign: "right" }}>{item.unitPrice.toFixed(2)}</td>
                    <td style={{ border: "1px solid #000", padding: "2px 3px", textAlign: "right" }}>
                      {item.weighed ? item.quantity.toFixed(2) : item.quantity}
                    </td>
                    <td style={{ border: "1px solid #000", padding: "2px 3px", textAlign: "right" }}>{rate.toFixed(2)}</td>
                    <td style={{ border: "1px solid #000", padding: "2px 3px", textAlign: "right", fontWeight: "bold" }}>{amt.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={borderBottomDashed} />

          {/* ─── Totals ─── */}
          <div style={{ fontSize: 10 }}>
            <div style={flexBetween}>
              <span>SUBTOTAL</span>
              <span>{tx.subtotal.toFixed(2)}</span>
            </div>
            {tx.memberDiscount > 0 && (
              <div style={flexBetween}>
                <span>PRIDE DISCOUNT</span>
                <span>−{tx.memberDiscount.toFixed(2)}</span>
              </div>
            )}
            {tx.surcharge > 0 && (
              <div style={{ ...flexBetween, fontWeight: "bold" }}>
                <span>SODEXO +5%</span>
                <span>{tx.surcharge.toFixed(2)}</span>
              </div>
            )}
            <div style={{ ...flexBetween, fontWeight: "bold", fontSize: 12, borderTop: "1px solid #000", marginTop: 4, paddingTop: 4 }}>
              <span>NET AMOUNT</span>
              <span>{formatINR(tx.total)}</span>
            </div>
            <div style={{ ...flexBetween, fontSize: 9, marginTop: 2 }}>
              <span>Total GST Included</span>
              <span>{totalGst.toFixed(2)}</span>
            </div>
          </div>

          <div style={borderBottomDashed} />

          {/* ─── GST Summary Table ─── */}
          <div style={{ ...bold, fontSize: 12, marginBottom: 3, textAlign: "center" }}>GST SUMMARY</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #000", padding: "2px 2px", textAlign: "right" }}>Taxable Val</th>
                <th style={{ border: "1px solid #000", padding: "2px 2px", textAlign: "right" }}>CGST%</th>
                <th style={{ border: "1px solid #000", padding: "2px 2px", textAlign: "right" }}>CGST Amt</th>
                <th style={{ border: "1px solid #000", padding: "2px 2px", textAlign: "right" }}>SGST%</th>
                <th style={{ border: "1px solid #000", padding: "2px 2px", textAlign: "right" }}>SGST Amt</th>
                <th style={{ border: "1px solid #000", padding: "2px 2px", textAlign: "right" }}>Tot GST</th>
              </tr>
            </thead>
            <tbody>
              {gstBuckets.map((b) => (
                <tr key={b.rate}>
                  <td style={{ border: "1px solid #000", padding: "2px 2px", textAlign: "right" }}>{b.taxableValue.toFixed(2)}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 2px", textAlign: "right" }}>{b.cgstRate.toFixed(1)}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 2px", textAlign: "right" }}>{b.cgstAmt.toFixed(2)}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 2px", textAlign: "right" }}>{b.sgstRate.toFixed(1)}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 2px", textAlign: "right" }}>{b.sgstAmt.toFixed(2)}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 2px", textAlign: "right", fontWeight: "bold" }}>{b.totalGst.toFixed(2)}</td>
                </tr>
              ))}
              {gstBuckets.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ border: "1px solid #000", padding: "2px 2px", textAlign: "center" }}>—</td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={borderBottomDashed} />

          {/* ─── PRIDE Nudge ─── */}
          <div style={{ ...sectionDivider, textAlign: "center" }}>
            <div style={{ ...bold, fontSize: 10, letterSpacing: 1, marginBottom: 3 }}>--- YOUR SAVINGS ---</div>
            {pride ? (
              <div style={{ fontSize: 11, fontWeight: "bold", color: "#000" }}>
                YOU SAVED {formatINR(actualSavings)} WITH PRIDE!
              </div>
            ) : (
              <div style={{ fontSize: 11, fontWeight: "bold", color: "#000" }}>
                JOIN PRIDE TO HAVE SAVED {formatINR(potentialSavings)} ON THIS BILL!
              </div>
            )}
          </div>

          {/* ─── Tenders ─── */}
          <div style={{ fontSize: 10 }}>
            {tx.tenders.map((t, idx) => (
              <div key={idx} style={flexBetween}>
                <span>{t.method.toUpperCase()}</span>
                <span style={bold}>{t.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={borderBottomDashed} />

          {/* ─── Kannada Footer & QRs ─── */}
          <div style={{ ...center, marginTop: 6 }}>
            <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 2 }}>ಧನ್ಯವಾದಗಳು!</div>
            <div style={{ fontSize: 9, lineHeight: 1.3, marginBottom: 6 }}>
              ನಿಮ್ಮ ಮುಂದಿನ ಖರೀದಿಗೆ ಸ್ವಾಗತ, ಆರೋಗ್ಯಕರ ಬದುಕಿಗೆ ಶುಭವಾಗಲಿ.
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 6 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 56, height: 56, border: "1px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>
                  iOS QR
                </div>
                <div style={{ fontSize: 8, marginTop: 2 }}>Download iOS</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 56, height: 56, border: "1px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>
                  Android QR
                </div>
                <div style={{ fontSize: 8, marginTop: 2 }}>Download Android</div>
              </div>
            </div>

            <div style={{ fontSize: 11, fontWeight: "bold" }}>THANK YOU!</div>
            <div style={{ fontSize: 11 }}>Loyalty earned: {Math.floor(tx.total / 10)} PTS</div>
            <div style={{ fontFamily: "monospace", letterSpacing: 3, fontSize: 10, marginTop: 4 }}>||||| | || ||| | ||||</div>
            <div style={{ fontSize: 8, marginTop: 2, wordBreak: "break-all" }}>{tx.id}</div>
          </div>
        </div>
      </div>

        {/* ─── Actions ─── */}
        <div className="p-5 flex flex-col justify-between w-[320px] bg-card no-print">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="text-primary" size={28} />
              <div>
                <div className="font-extrabold text-xl uppercase tracking-tight">Paid</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {tx.method === "Split" ? `SPLIT (${tx.tenders.length})` : tx.method}
                </div>
              </div>
            </div>
            <div className="border-2 border-foreground p-3 bg-background mb-3">
              <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1">Total Paid</div>
              <div className="font-mono font-extrabold text-3xl tabular-nums">{formatINR(tx.total)}</div>
              {tx.memberDiscount > 0 && (
                <div className="mt-1 font-mono font-bold text-xs text-accent">PRIDE Saved {formatINR(tx.memberDiscount)}</div>
              )}
              {tx.bharatpeTxnId && (
                <div className="mt-1 font-mono font-bold text-[10px] text-muted-foreground">
                  BharatPe: {tx.bharatpeTxnId}
                </div>
              )}
            </div>

            <div className="border-2 border-foreground bg-background">
              <button
                onClick={() => setPaperless(!paperless)}
                className={`w-full px-3 py-2 flex items-center justify-between font-extrabold text-xs uppercase tracking-widest border-b-2 border-foreground
                  ${paperless ? "bg-accent text-accent-foreground" : "bg-card hover:bg-secondary"}`}
              >
                <span>Digital Receipt</span>
                <span className={`px-2 py-0.5 border-2 border-foreground ${paperless ? "bg-foreground text-background" : "bg-muted"}`}>
                  {paperless ? "ON" : "OFF"}
                </span>
              </button>
              {paperless && (
                <div className="p-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => send("WhatsApp")}
                    disabled={sending || sent === "WhatsApp"}
                    className={`pressable border-2 border-foreground h-12 font-extrabold text-xs tracking-widest flex items-center justify-center gap-1
                      ${sent === "WhatsApp" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"} disabled:opacity-60`}
                  >
                    <MessageCircle size={16} /> {sent === "WhatsApp" ? "SENT" : sending && chosen === "WhatsApp" ? "..." : "WHATSAPP"}
                  </button>
                  <button
                    onClick={() => send("SMS")}
                    disabled={sending || sent === "SMS"}
                    className={`pressable border-2 border-foreground h-12 font-extrabold text-xs tracking-widest flex items-center justify-center gap-1
                      ${sent === "SMS" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"} disabled:opacity-60`}
                  >
                    <Smartphone size={16} /> {sent === "SMS" ? "SENT" : sending && chosen === "SMS" ? "..." : "SMS"}
                  </button>
                  <div className="col-span-2 font-mono font-bold text-[10px] text-muted-foreground text-center">
                    {sent ? `Sent to ${customer?.phone}` : `Will send to ${customer?.phone}`}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2 mt-3">
            {!paperless && (
              <button
                onClick={handlePrint}
                disabled={printing}
                className="pressable w-full bg-accent text-accent-foreground border-2 border-foreground h-12 font-extrabold tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Printer size={20} /> {printing ? "PRINTING..." : "PRINT"}
              </button>
            )}
            <button
              onClick={done}
              className="pressable-primary w-full bg-primary text-primary-foreground border-2 border-foreground h-14 font-extrabold tracking-widest text-lg"
            >
              NEW SALE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
