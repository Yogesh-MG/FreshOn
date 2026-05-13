import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Bike, Car, CheckCircle2, ChevronRight, FileCheck2, Loader2, Truck, Upload, Zap } from "lucide-react";
import { PhoneFrame } from "@/components/freshon/PhoneFrame";
import { FreshOnLogo } from "@/components/freshon/Logo";

type DocType = "aadhaar" | "pan" | "driving_licence" | "vehicle_rc" | "insurance";

const DOC_LIST: { id: DocType; label: string; hint: string }[] = [
  { id: "aadhaar", label: "Aadhaar Card", hint: "12-digit UID — front & back" },
  { id: "pan", label: "PAN Card", hint: "10-character alphanumeric" },
  { id: "driving_licence", label: "Driving Licence", hint: "Valid 2-wheeler / 4-wheeler" },
  { id: "vehicle_rc", label: "Vehicle RC", hint: "Registration certificate" },
  { id: "insurance", label: "Vehicle Insurance", hint: "Active policy document" },
];

const VEHICLES = [
  { id: "bicycle" as const, name: "Bicycle", icon: Bike },
  { id: "scooter" as const, name: "E-Scooter", icon: Zap },
  { id: "motorbike" as const, name: "Motorbike", icon: Car },
  { id: "van" as const, name: "Van", icon: Truck },
];

const profileSchema = z.object({
  full_name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(20),
  vehicle_type: z.enum(["bicycle", "scooter", "motorbike", "van"]),
  vehicle_number: z.string().trim().min(4, "Enter a valid vehicle number").max(20),
  address: z.string().trim().min(5).max(200),
  city: z.string().trim().min(2).max(60),
  pincode: z.string().trim().regex(/^\d{4,8}$/, "Enter a valid pincode"),
});

interface DocRow { doc_type: DocType; doc_number: string | null; file_path: string; status: string }

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [sessionId] = useState(() => `onboarding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Profile state
  const [profile, setProfile] = useState({
    full_name: "", phone: "", vehicle_type: "scooter" as "bicycle" | "scooter" | "motorbike" | "van",
    vehicle_number: "", address: "", city: "", pincode: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Docs state
  const [docs, setDocs] = useState<Record<DocType, DocRow | null>>({
    aadhaar: null, pan: null, driving_licence: null, vehicle_rc: null, insurance: null,
  });
  const [uploadingFor, setUploadingFor] = useState<DocType | null>(null);
  const [docNumbers, setDocNumbers] = useState<Record<DocType, string>>({
    aadhaar: "", pan: "", driving_licence: "", vehicle_rc: "", insurance: "",
  });

  // Load profile + docs from local storage
  useEffect(() => {
    const savedProfile = localStorage.getItem(`profile_${sessionId}`);
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    
    const savedDocs = localStorage.getItem(`docs_${sessionId}`);
    if (savedDocs) setDocs(JSON.parse(savedDocs));

    const savedDocNums = localStorage.getItem(`docNums_${sessionId}`);
    if (savedDocNums) setDocNumbers(JSON.parse(savedDocNums));
  }, [sessionId]);

  const saveProfile = async () => {
    const parsed = profileSchema.safeParse(profile);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSavingProfile(true);
    
    // Mock save
    setTimeout(() => {
      localStorage.setItem(`profile_${sessionId}`, JSON.stringify(profile));
      setSavingProfile(false);
      toast.success("Profile saved");
      setStep(2);
    }, 800);
  };

  const handleUpload = async (docType: DocType, file: File) => {
    if (file.size > 8 * 1024 * 1024) { toast.error("Max file size is 8 MB"); return; }
    
    setUploadingFor(docType);
    
    // Mock upload
    setTimeout(() => {
      const newDoc: DocRow = {
        doc_type: docType,
        doc_number: docNumbers[docType] || null,
        file_path: `mock/${file.name}`,
        status: "submitted"
      };
      const nextDocs = { ...docs, [docType]: newDoc };
      setDocs(nextDocs);
      localStorage.setItem(`docs_${sessionId}`, JSON.stringify(nextDocs));
      localStorage.setItem(`docNums_${sessionId}`, JSON.stringify(docNumbers));
      
      setUploadingFor(null);
      toast.success(`${DOC_LIST.find(d => d.id === docType)?.label} uploaded`);
    }, 1200);
  };

  const allUploaded = DOC_LIST.every((d) => docs[d.id]);

  const submitKyc = async () => {
    if (!allUploaded) { toast.error("Upload all 5 documents first"); return; }
    
    toast.success("KYC submitted! Review takes ~24h.");
    navigate("/auth", { replace: true });
  };

  return (
    <main className="min-h-screen">
      <PhoneFrame>
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between px-5 pt-6">
            <FreshOnLogo />
            <div className="w-10" />
          </header>

          {/* Stepper */}
          <div className="mx-5 mt-5 flex items-center gap-2">
            <StepDot n={1} active={step >= 1} done={step > 1} label="Profile" />
            <div className={`h-0.5 flex-1 rounded-full ${step > 1 ? "bg-primary" : "bg-border"}`} />
            <StepDot n={2} active={step >= 2} done={false} label="KYC Docs" />
          </div>

          <div className="flex-1 space-y-4 px-5 pb-10 pt-5">
            {step === 1 && (
              <div className="space-y-4 animate-fade-up">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Your details</h2>
                  <p className="text-sm text-muted-foreground">We'll use these for dispatch and payouts.</p>
                </div>
                <div className="space-y-3 rounded-3xl bg-card p-4 shadow-card-soft ring-1 ring-border">
                  <Field label="Full name">
                    <input className="field" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} maxLength={80} />
                  </Field>
                  <Field label="Phone">
                    <input className="field" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+91…" maxLength={20} />
                  </Field>
                  <div>
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Vehicle</span>
                    <div className="grid grid-cols-4 gap-2">
                      {VEHICLES.map((v) => {
                        const Icon = v.icon;
                        const active = profile.vehicle_type === v.id;
                        return (
                          <button key={v.id} type="button" onClick={() => setProfile({ ...profile, vehicle_type: v.id })}
                            className={`flex flex-col items-center gap-1 rounded-2xl p-2.5 text-[10px] font-bold transition
                              ${active ? "bg-gradient-primary text-primary-foreground shadow-glow-primary" : "bg-muted text-muted-foreground"}`}>
                            <Icon className="h-4 w-4" /> {v.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <Field label="Vehicle number">
                    <input className="field uppercase" value={profile.vehicle_number} onChange={(e) => setProfile({ ...profile, vehicle_number: e.target.value.toUpperCase() })} placeholder="MH 12 AB 1234" maxLength={20} />
                  </Field>
                  <Field label="Address">
                    <textarea className="field min-h-[72px] py-3" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} maxLength={200} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="City"><input className="field" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} maxLength={60} /></Field>
                    <Field label="Pincode"><input className="field" value={profile.pincode} onChange={(e) => setProfile({ ...profile, pincode: e.target.value })} maxLength={8} /></Field>
                  </div>
                </div>

                <button onClick={saveProfile} disabled={savingProfile} className="btn-primary w-full">
                  {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save & continue <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-up">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Upload your documents</h2>
                  <p className="text-sm text-muted-foreground">JPG, PNG, WEBP or PDF · max 8 MB each</p>
                </div>

                <div className="space-y-2.5">
                  {DOC_LIST.map((d) => {
                    const uploaded = !!docs[d.id];
                    const isUploading = uploadingFor === d.id;
                    return (
                      <div key={d.id} className={`rounded-2xl p-3 ring-1 transition
                        ${uploaded ? "bg-primary-soft ring-primary/40" : "bg-card ring-border"}`}>
                        <div className="flex items-start gap-3">
                          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl
                            ${uploaded ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {uploaded ? <CheckCircle2 className="h-5 w-5" /> : <FileCheck2 className="h-5 w-5" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-bold text-foreground">{d.label}</div>
                              {uploaded && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">Uploaded</span>}
                            </div>
                            <div className="text-xs text-muted-foreground">{d.hint}</div>
                            <input
                              type="text"
                              placeholder="Document number (optional)"
                              value={docNumbers[d.id]}
                              onChange={(e) => setDocNumbers({ ...docNumbers, [d.id]: e.target.value })}
                              maxLength={40}
                              className="field mt-2 h-10 text-xs"
                            />
                            <label className={`mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition
                              ${isUploading ? "bg-muted text-muted-foreground" : uploaded ? "bg-secondary text-secondary-foreground" : "bg-gradient-amber text-accent-foreground shadow-glow-amber"}`}>
                              {isUploading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…</>
                                : <><Upload className="h-3.5 w-3.5" /> {uploaded ? "Replace file" : "Upload file"}</>}
                              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden"
                                disabled={isUploading}
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(d.id, f); e.target.value = ""; }} />
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setStep(1)} className="rounded-2xl bg-muted px-4 py-3.5 text-sm font-bold text-foreground">Back</button>
                  <button onClick={submitKyc} disabled={!allUploaded} className="btn-primary flex-1">
                    Submit for verification <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                {!allUploaded && <p className="text-center text-xs text-muted-foreground">Upload all 5 documents to continue.</p>}
              </div>
            )}
          </div>
        </div>
      </PhoneFrame>

      <style>{`
        .field { width: 100%; height: 44px; border-radius: 12px; padding: 0 12px;
          background: hsl(var(--background)); border: 1px solid hsl(var(--border));
          font-size: 14px; font-weight: 500; color: hsl(var(--foreground));
          outline: none; transition: all .15s; }
        .field:focus { border-color: hsl(var(--primary)); box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15); }
        textarea.field { height: auto; }
        .btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          height: 48px; border-radius: 14px; padding: 0 20px;
          background: var(--gradient-primary); color: hsl(var(--primary-foreground));
          font-size: 14px; font-weight: 700; box-shadow: var(--shadow-glow-primary);
          transition: transform .15s; }
        .btn-primary:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }
      `}</style>
    </main>
  );
};

const StepDot = ({ n, active, done, label }: { n: number; active: boolean; done: boolean; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-extrabold transition
      ${done ? "bg-gradient-primary text-primary-foreground shadow-glow-primary"
        : active ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>
      {done ? <CheckCircle2 className="h-4 w-4" /> : n}
    </div>
    <span className={`text-xs font-bold uppercase tracking-wider ${active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
    {children}
  </label>
);

export default Onboarding;
