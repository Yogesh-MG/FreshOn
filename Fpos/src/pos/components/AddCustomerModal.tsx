import { useState, useEffect, useRef } from "react";
import { usePos } from "../store";
import { X, UserPlus, Loader2, ChevronDown, ChevronUp, Building2 } from "lucide-react";

export default function AddCustomerModal({ onClose, defaultPhone }: { onClose: () => void; defaultPhone?: string }) {
  const addCustomer = usePos((s) => s.addCustomer);
  const loading = usePos((s) => s.loading);
  const storeError = usePos((s) => s.error);
  const searchCustomer = usePos((s) => s.searchCustomer);
  const customerSearchResults = usePos((s) => s.customerSearchResults);
  const customerSearching = usePos((s) => s.customerSearching);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState(defaultPhone || "");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  
  // B2B Fields
  const [isB2b, setIsB2b] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [address, setAddress] = useState("");
  const [showBusinessFields, setShowBusinessFields] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultPhone) {
      nameRef.current?.focus();
    }
  }, [defaultPhone]);

  // Auto-detect business if 10 digits
  useEffect(() => {
    if (phone.length === 10 && !customerSearching) {
      searchCustomer(phone);
    }
  }, [phone, searchCustomer]);

  useEffect(() => {
    if (phone.length === 10 && customerSearchResults.length > 0) {
      const match = customerSearchResults[0] as any;
      if (match.is_b2b && match.company) {
        setIsB2b(true);
        setShowBusinessFields(true);
        setCompanyName(match.company.name || "");
        setGstin(match.company.gstin || "");
        setPan(match.company.pan || "");
        setAddress(match.company.address || "");
        if (!name) setName(match.name || "");
        if (!email) setEmail(match.email || "");
      }
    }
  }, [customerSearchResults, phone]);

  const submit = async () => {
    if (!name.trim() || phone.length < 10) {
      setErr("NAME & 10-DIGIT PHONE REQUIRED");
      return;
    }
    if (isB2b && !gstin.trim()) {
      setErr("GSTIN REQUIRED FOR BUSINESS");
      return;
    }

    const customer = await addCustomer({
      name: name.trim(),
      phone,
      email: email.trim() || undefined,
      is_b2b: isB2b,
      company_name: isB2b ? companyName.trim() : undefined,
      gstin: isB2b ? gstin.trim() : undefined,
      pan: isB2b ? pan.trim() : undefined,
      address: isB2b ? address.trim() : undefined,
    });
    if (customer) onClose();
    else if (storeError) setErr(storeError);
  };

  return (
    <div className="fixed inset-0 bg-foreground/70 flex items-center justify-center z-50 p-4">
      <div className="border-sharp-3 bg-card w-full max-w-[450px] p-5 max-h-[90vh] overflow-y-auto scrollbar-sharp" style={{ boxShadow: "8px 8px 0 0 hsl(var(--foreground))" }}>
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-card z-10 pb-2 border-b-2 border-foreground/10">
          <div className="flex items-center gap-2">
            <UserPlus size={22}/>
            <h2 className="text-xl font-extrabold uppercase tracking-tight">New Customer</h2>
          </div>
          <button onClick={onClose} className="border-2 border-foreground p-1 hover:bg-destructive hover:text-destructive-foreground"><X size={18}/></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1">Person Name *</label>
            <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} disabled={loading}
              className="w-full border-2 border-foreground bg-background px-3 py-2 font-bold text-base outline-none focus:border-primary disabled:opacity-50"/>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1">Phone *</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric" disabled={loading}
              className="w-full border-2 border-foreground bg-background px-3 py-2 font-mono font-bold text-base outline-none focus:border-primary disabled:opacity-50"/>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1">Email (optional)</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}
              className="w-full border-2 border-foreground bg-background px-3 py-2 font-bold text-base outline-none focus:border-primary disabled:opacity-50"/>
          </div>

          <div className="pt-2">
            <button 
              onClick={() => {
                const newState = !showBusinessFields;
                setShowBusinessFields(newState);
                if (newState) setIsB2b(true);
              }}
              className={`w-full border-2 border-foreground flex items-center justify-between px-3 py-2 font-extrabold text-xs tracking-widest uppercase transition-colors ${showBusinessFields ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
            >
              <div className="flex items-center gap-2">
                <Building2 size={16} />
                Business Details
              </div>
              {showBusinessFields ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
            </button>

            {showBusinessFields && (
              <div className="border-2 border-t-0 border-foreground p-3 space-y-3 bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <input type="checkbox" id="is_b2b" checked={isB2b} onChange={(e) => setIsB2b(e.target.checked)} className="w-4 h-4 accent-primary" />
                  <label htmlFor="is_b2b" className="text-[10px] font-extrabold uppercase tracking-widest cursor-pointer">Register as B2B</label>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1">Company Name</label>
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={loading || !isB2b}
                    className="w-full border-2 border-foreground bg-background px-3 py-1.5 font-bold text-sm outline-none focus:border-primary disabled:opacity-50"/>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1">GSTIN</label>
                    <input value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} disabled={loading || !isB2b}
                      className="w-full border-2 border-foreground bg-background px-3 py-1.5 font-mono font-bold text-sm outline-none focus:border-primary disabled:opacity-50"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1">PAN</label>
                    <input value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} disabled={loading || !isB2b}
                      className="w-full border-2 border-foreground bg-background px-3 py-1.5 font-mono font-bold text-sm outline-none focus:border-primary disabled:opacity-50"/>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1">Address</label>
                  <textarea value={address} onChange={(e) => setAddress(e.target.value)} disabled={loading || !isB2b} rows={2}
                    className="w-full border-2 border-foreground bg-background px-3 py-1.5 font-bold text-sm outline-none focus:border-primary disabled:opacity-50 resize-none"/>
                </div>
              </div>
            )}
          </div>
        </div>

        {err && <div className="bg-destructive text-destructive-foreground font-extrabold text-center py-2 mt-4 text-xs uppercase tracking-wider">{err}</div>}

        <div className="grid grid-cols-2 gap-2 mt-5">
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
