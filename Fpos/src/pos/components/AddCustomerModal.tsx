import { useState, useEffect, useRef } from "react";
import { usePos } from "../store";
import { X, UserPlus, Loader2 } from "lucide-react";

export default function AddCustomerModal({ onClose, defaultPhone }: { onClose: () => void; defaultPhone?: string }) {
  const addCustomer = usePos((s) => s.addCustomer);
  const loading = usePos((s) => s.loading);
  const storeError = usePos((s) => s.error);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(defaultPhone || "");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultPhone) {
      nameRef.current?.focus();
    }
  }, [defaultPhone]);
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!name.trim() || phone.length < 10) {
      setErr("NAME & 10-DIGIT PHONE REQUIRED");
      return;
    }
    const customer = await addCustomer({
      name: name.trim(),
      phone,
      email: email.trim() || undefined,
    });
    if (customer) onClose();
    else if (storeError) setErr(storeError);
  };

  return (
    <div className="fixed inset-0 bg-foreground/70 flex items-center justify-center z-50">
      <div className="border-sharp-3 bg-card w-[420px] p-5" style={{ boxShadow: "8px 8px 0 0 hsl(var(--foreground))" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserPlus size={22}/>
            <h2 className="text-xl font-extrabold uppercase tracking-tight">New Customer</h2>
          </div>
          <button onClick={onClose} className="border-2 border-foreground p-1 hover:bg-destructive hover:text-destructive-foreground"><X size={18}/></button>
        </div>

        <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1">Name *</label>
        <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} disabled={loading}
          className="w-full border-2 border-foreground bg-background px-3 py-2 font-bold text-base outline-none focus:border-primary mb-3 disabled:opacity-50"/>

        <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1">Phone *</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          inputMode="numeric" disabled={loading}
          className="w-full border-2 border-foreground bg-background px-3 py-2 font-mono font-bold text-base outline-none focus:border-primary mb-3 disabled:opacity-50"/>

        <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1">Email (optional)</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}
          className="w-full border-2 border-foreground bg-background px-3 py-2 font-bold text-base outline-none focus:border-primary mb-4 disabled:opacity-50"/>

        {err && <div className="bg-destructive text-destructive-foreground font-extrabold text-center py-2 mb-3 text-xs uppercase tracking-wider">{err}</div>}

        <div className="grid grid-cols-2 gap-2">
          <button onClick={onClose} disabled={loading}
            className="pressable border-2 border-foreground bg-card h-12 font-extrabold text-sm tracking-widest disabled:opacity-50">CANCEL</button>
          <button onClick={submit} disabled={loading}
            className="pressable-primary bg-primary text-primary-foreground border-2 border-foreground h-12 font-extrabold text-sm tracking-widest flex items-center justify-center gap-1 disabled:opacity-50">
            {loading ? <><Loader2 size={16} className="animate-spin"/> SAVING...</> : "SAVE"}
          </button>
        </div>
      </div>
    </div>
  );
}
