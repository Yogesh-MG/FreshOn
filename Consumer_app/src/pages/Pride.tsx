import { Link } from "react-router-dom";
import { PageShell } from "@/components/freshon/PageShell";
import { 
  ChevronRight, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Leaf, 
  Sprout, 
  Award, 
  Wallet, 
  Zap, 
  Lock, 
  Gift, 
  Truck, 
  Phone,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Handshake,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { TouchScale } from "@/components/freshon/TouchScale";

const Pride = () => {
  const [selectedTier, setSelectedTier] = useState<"TIER_1" | "TIER_2" | "TIER_3">("TIER_2");

  const tiers = {
    TIER_1: { amount: "1.5L", savings: "18,000+", limit: "3,000" },
    TIER_2: { amount: "3L", savings: "36,000+", limit: "6,000" },
    TIER_3: { amount: "5L", savings: "60,000+", limit: "10,000" },
  };

  return (
    <PageShell hideTabBar>
      <div className="bg-background text-foreground overflow-hidden pb-24">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center pt-12 pb-16 px-6 overflow-hidden bg-gradient-to-b from-cream to-background text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-1.5 text-[10px] font-bold text-white mb-6 tracking-wider uppercase">
              PRIDE PARTNERSHIP
            </div>
            
            <h1 className="font-serif text-4xl font-medium leading-[1.2] mb-6">
              Up to <span className="text-forest underline decoration-harvest decoration-4 underline-offset-4">50% off</span> <br />
              every grocery bill <br />
              <span className="text-harvest italic">forever.</span>
            </h1>

            <div className="grid grid-cols-2 gap-3 mb-10">
                {[
                    { label: "11 yrs", sub: "Trusted", icon: Award },
                    { label: "₹60K+", sub: "Saved/yr", icon: TrendingUp },
                    { label: "1,600+", sub: "Products", icon: Sprout },
                    { label: "Zero", sub: "Lock-in", icon: Lock },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-border/50 p-4 rounded-2xl flex flex-col items-center shadow-sm">
                        <stat.icon className="h-5 w-5 text-forest mb-2" />
                        <p className="text-lg font-bold text-foreground">{stat.label}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <TouchScale>
              <button className="h-16 w-full rounded-full bg-forest text-white font-bold text-lg shadow-xl shadow-forest/20 flex items-center justify-center gap-3 active:scale-95 group">
                Become a PRIDE Partner
                <ArrowRight className="h-5 w-5" />
              </button>
            </TouchScale>
            
            <p className="mt-4 text-xs text-muted-foreground font-medium">
              Starts from ₹1.5L · <span className="text-forest">100% refundable anytime</span>
            </p>
          </motion.div>
        </section>

        {/* Benefits Cards - Mobile Stack */}
        <section className="py-12 px-6">
            <h2 className="font-serif text-3xl mb-8 text-center">4 Direct Benefits</h2>
            <div className="space-y-4">
                {[
                    { v: "30", l: "30% Flat Discount", d: "Applied at billing counter. No codes. No waiting. Instant, every visit.", sub: "Instant · At billing" },
                    { v: "10", l: "10% Wallet Savings", d: "Credited to your wallet every month. Use anytime. Never expires.", sub: "Monthly · Zero expiry" },
                    { v: "5", l: "5% Loyalty Bonus", d: "Stay invested for 12 months, receive an extra 5% — our thanks.", sub: "Credited yearly" },
                    { v: "5", l: "5% Referral Bonus", d: "Refer a friend. When they first purchase, 5% goes to you. No cap.", sub: "Unlimited" },
                ].map((item, i) => (
                    <div key={i} className="bg-surface p-6 rounded-[32px] border border-border/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-4xl font-serif font-bold text-forest">{item.v}</div>
                            <div className="text-[8px] font-bold uppercase tracking-wider bg-mint-soft text-forest px-2 py-1 rounded-full">{item.sub}</div>
                        </div>
                        <h3 className="text-lg font-bold mb-2">{item.l}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.d}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* Investment Tiers - Mobile Picker */}
        <section className="py-12 px-6 bg-surface">
            <h2 className="font-serif text-3xl mb-8 text-center">Choose Your Investment</h2>
            <div className="space-y-4">
                {[
                    { id: "TIER_1", t: "Basic", a: "1.5L", l: "3,000", s: "18,000+", color: "bg-white" },
                    { id: "TIER_2", t: "Preferred", a: "3L", l: "6,000", s: "36,000+", color: "bg-mint-soft", popular: true },
                    { id: "TIER_3", t: "Founding", a: "5L", l: "10,000", s: "60,000+", color: "bg-forest", text: "text-white" },
                ].map((tier) => (
                    <TouchScale key={tier.id}>
                        <button 
                            onClick={() => setSelectedTier(tier.id as any)}
                            className={cn(
                                "w-full p-6 rounded-[32px] text-left transition-all relative border-2",
                                tier.color,
                                tier.text || "text-foreground",
                                selectedTier === tier.id ? "border-harvest shadow-lg" : "border-transparent opacity-90"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-70 mb-1">{tier.t}</h3>
                                    <p className="text-3xl font-serif font-bold">₹{tier.a}</p>
                                </div>
                                {tier.popular && (
                                    <div className="bg-harvest text-white text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                        Most Chosen
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-4 flex gap-4 text-[10px]">
                                <div>
                                    <span className="opacity-70">Monthly Limit: </span>
                                    <span className="font-bold">₹{tier.l}</span>
                                </div>
                                <div>
                                    <span className="opacity-70">Annual Savings: </span>
                                    <span className="font-bold text-harvest">₹{tier.s}</span>
                                </div>
                            </div>
                        </button>
                    </TouchScale>
                ))}
            </div>
        </section>

        {/* Security / Documentation */}
        <section className="py-12 px-6 text-center">
            <ShieldCheck className="h-12 w-12 text-forest mx-auto mb-6" />
            <h2 className="font-serif text-3xl mb-4">Your investment is protected.</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                100% refundable anytime with 1 month's notice. Legal documents signed by Sattya issued before activation.
            </p>
            <div className="space-y-3">
                <div className="bg-surface p-4 rounded-2xl flex items-center gap-4 text-left">
                    <Calendar className="h-5 w-5 text-forest shrink-0" />
                    <div>
                        <p className="text-sm font-bold">1 Month Notice</p>
                        <p className="text-[10px] text-muted-foreground">Full refund anytime, no penalties.</p>
                    </div>
                </div>
                <div className="bg-surface p-4 rounded-2xl flex items-center gap-4 text-left">
                    <Lock className="h-5 w-5 text-forest shrink-0" />
                    <div>
                        <p className="text-sm font-bold">Legally Signed</p>
                        <p className="text-[10px] text-muted-foreground">Term sheet & receipt issued same day.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Action Bar - Floating Sticky */}
        <div className="fixed bottom-0 inset-x-0 p-4 bg-background/80 backdrop-blur-md border-t border-border z-50">
            <TouchScale>
                <button className="h-14 w-full rounded-full bg-forest text-white font-bold shadow-lg flex items-center justify-center gap-2">
                    Reserve My Slot
                    <ArrowRight className="h-4 w-4" />
                </button>
            </TouchScale>
        </div>
      </div>
    </PageShell>
  );
};

export default Pride;
