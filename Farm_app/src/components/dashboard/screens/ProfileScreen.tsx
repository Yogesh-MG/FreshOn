import { useState } from "react";
import { useProfile } from "@/hooks/useFarmer";
import farmHero from "@/assets/farm-hero.jpg";
import { Icon } from "@/components/freshon/Icon";
import { FarmDetailsScreen } from "./sub/FarmDetailsScreen";
import { BankPayoutsScreen } from "./sub/BankPayoutsScreen";
import { LanguageScreen } from "./sub/LanguageScreen";
import { HelpSupportScreen } from "./sub/HelpSupportScreen";
import { PrivacyTermsScreen } from "./sub/PrivacyTermsScreen";
import { NotificationScreen } from "./sub/NotificationScreen";

interface Props {
  farmerName: string;
  onSignOut: () => void;
}

type ActiveScreen = "profile" | "farm" | "bank" | "language" | "help" | "privacy" | "notifications";

export const ProfileScreen = ({ farmerName, onSignOut }: Props) => {
  const { data: profile } = useProfile();
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("profile");
  
  const displayName = profile?.name || farmerName;
  const location = profile?.location || "Farm location";
  const acreage = profile?.total_acreage ? `${profile.total_acreage} acres` : "Acreage pending";

  const rows = [
    { id: "farm", icon: "agriculture", label: "Farm details", hint: `${acreage} - ${location}` },
    { id: "certification", icon: "verified_user", label: "Organic certification", hint: profile?.speciality || "Certification pending" },
    { id: "bank", icon: "account_balance", label: "Bank & payouts", hint: "Payout profile" },
    { id: "pickup", icon: "local_shipping", label: "Pickup preferences", hint: "Daily pickup" },
    { id: "language", icon: "language", label: "Language", hint: profile?.preferred_language === 'kn' ? 'ಕನ್ನಡ' : profile?.preferred_language === 'hi' ? 'हिन्दी' : 'English' },
    { id: "help", icon: "support_agent", label: "Help & support", hint: "" },
    { id: "privacy", icon: "policy", label: "Privacy & terms", hint: "" },
  ];

  if (activeScreen === "farm") return <FarmDetailsScreen onBack={() => setActiveScreen("profile")} />;
  if (activeScreen === "bank") return <BankPayoutsScreen onBack={() => setActiveScreen("profile")} />;
  if (activeScreen === "language") return <LanguageScreen onBack={() => setActiveScreen("profile")} />;
  if (activeScreen === "help") return <HelpSupportScreen onBack={() => setActiveScreen("profile")} />;
  if (activeScreen === "privacy") return <PrivacyTermsScreen onBack={() => setActiveScreen("profile")} />;
  if (activeScreen === "notifications") return <NotificationScreen onBack={() => setActiveScreen("profile")} />;

  return (
    <main className="px-5 pt-6 space-y-5 pb-20">
      <div className="relative rounded-[28px] overflow-hidden h-44 shadow-deep">
        <img src={profile?.image || farmHero} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-deep via-secondary-deep/40 to-transparent" />
        <div className="absolute inset-0 p-5 flex flex-col justify-end text-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-14 rounded-2xl bg-gradient-golden flex items-center justify-center font-extrabold text-secondary-deep text-xl shadow-glow">
                {displayName[0]}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Verified Farmer
                </p>
                <h2 className="text-2xl font-extrabold tracking-tight">{displayName}</h2>
              </div>
            </div>
            <button 
              onClick={() => setActiveScreen("notifications")}
              className="size-11 rounded-full glass flex items-center justify-center text-background tap"
            >
              <Icon name="notifications" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { v: String(profile?.rating || 4.9), l: "Rating", icon: "star" },
          { v: String(profile?.years_of_experience || 0), l: "Years", icon: "shopping_basket" },
          { v: acreage.replace(" acres", ""), l: "Acres", icon: "schedule" },
        ].map((s) => (
          <div key={s.l} className="glass rounded-2xl p-3 text-center">
            <Icon name={s.icon} className="text-primary-foreground text-base" filled />
            <p className="text-lg font-extrabold tabular-nums mt-1">{s.v}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/55">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl divide-y divide-border/60 overflow-hidden">
        {rows.map((r) => (
          <button
            key={r.label}
            onClick={() => r.id !== "certification" && r.id !== "pickup" && setActiveScreen(r.id as ActiveScreen)}
            className="w-full flex items-center gap-3 px-4 py-3.5 tap text-left hover:bg-muted/40"
          >
            <div className="size-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <Icon name={r.icon} className="text-base" filled />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{r.label}</p>
              {r.hint && <p className="text-[11px] font-medium text-foreground/55">{r.hint}</p>}
            </div>
            <Icon name="chevron_right" className="text-foreground/40" />
          </button>
        ))}
      </div>

      <button
        onClick={onSignOut}
        className="w-full h-12 rounded-full glass text-destructive font-bold text-sm tap flex items-center justify-center gap-2"
      >
        <Icon name="logout" className="text-base" weight={700} />
        Sign out
      </button>
    </main>
  );
};

