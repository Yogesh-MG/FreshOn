import { Icon } from "@/components/freshon/Icon";

interface Props {
  onBack: () => void;
}

const SUPPORT_OPTIONS = [
  { icon: "call", label: "Call Support", hint: "9:00 AM - 6:00 PM", color: "bg-blue-100 text-blue-600" },
  { icon: "chat", label: "WhatsApp Chat", hint: "Usually replies in 1h", color: "bg-green-100 text-green-600" },
  { icon: "mail", label: "Email Us", hint: "support@freshon.in", color: "bg-purple-100 text-purple-600" },
  { icon: "help_outline", label: "View FAQ", hint: "Common questions", color: "bg-amber-100 text-amber-600" },
];

export const HelpSupportScreen = ({ onBack }: Props) => {
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <header className="px-5 h-16 flex items-center gap-4 border-b border-border/60">
        <button onClick={onBack} className="size-10 rounded-xl glass flex items-center justify-center tap">
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-xl font-bold">Help & Support</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-8">
        <div className="text-center space-y-4 py-8">
          <div className="size-24 rounded-[32px] bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
            <Icon name="support_agent" className="text-5xl" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">How can we help?</h2>
            <p className="text-sm text-foreground/50 mt-1">Our team is here to support your growth.</p>
          </div>
        </div>

        <div className="grid gap-3">
          {SUPPORT_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              className="w-full flex items-center gap-4 p-4 rounded-2xl glass border border-border/40 hover:border-primary/30 transition-colors tap"
            >
              <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${opt.color}`}>
                <Icon name={opt.icon} className="text-xl" filled />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-sm">{opt.label}</p>
                <p className="text-[11px] font-medium text-foreground/50">{opt.hint}</p>
              </div>
              <Icon name="chevron_right" className="text-foreground/30" />
            </button>
          ))}
        </div>

        <div className="bg-secondary/5 rounded-2xl p-6 border border-secondary/10">
          <h3 className="font-bold text-sm mb-3">Farm Visit Request</h3>
          <p className="text-xs text-foreground/60 leading-relaxed mb-4">
            Need an on-site inspection for organic certification or technical assistance?
          </p>
          <button className="w-full h-12 rounded-xl bg-secondary text-secondary-deep font-bold text-sm tap">
            Schedule a Visit
          </button>
        </div>
      </main>

      <footer className="p-5 text-center opacity-20">
        <p className="text-[10px] font-bold uppercase tracking-widest">Version 1.0.0 (Build 42)</p>
      </footer>
    </div>
  );
};
