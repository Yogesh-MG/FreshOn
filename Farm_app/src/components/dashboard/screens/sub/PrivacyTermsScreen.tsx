import { Icon } from "@/components/freshon/Icon";

interface Props {
  onBack: () => void;
}

const SECTIONS = [
  { title: "Terms of Service", icon: "gavel" },
  { title: "Privacy Policy", icon: "security" },
  { title: "Organic Compliance", icon: "verified" },
  { title: "Payout Policies", icon: "payments" },
];

export const PrivacyTermsScreen = ({ onBack }: Props) => {
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <header className="px-5 h-16 flex items-center gap-4 border-b border-border/60">
        <button onClick={onBack} className="size-10 rounded-xl glass flex items-center justify-center tap">
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-xl font-bold">Privacy & Terms</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className="grid gap-3">
          {SECTIONS.map((section) => (
            <button
              key={section.title}
              className="w-full flex items-center justify-between p-5 rounded-2xl glass border border-border/40 tap"
            >
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-foreground/60">
                  <Icon name={section.icon} />
                </div>
                <p className="font-bold text-sm">{section.title}</p>
              </div>
              <Icon name="open_in_new" className="text-xs text-foreground/30" />
            </button>
          ))}
        </div>

        <div className="space-y-4 px-1">
          <h2 className="font-bold text-lg">Our Commitment</h2>
          <div className="space-y-4 text-sm text-foreground/60 leading-relaxed">
            <p>
              FreshOn is committed to protecting your data and ensuring fair trade practices. We collect farm location data to optimize delivery routes and build trust with consumers.
            </p>
            <p>
              By using the FreshOn Farmer application, you agree to our organic pledge and certify that all products submitted are grown using sustainable methods described in your profile.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-border/40 opacity-40">
          <p className="text-[10px] font-bold uppercase tracking-widest text-center">
            Last Updated: May 2026
          </p>
        </div>
      </main>
    </div>
  );
};
