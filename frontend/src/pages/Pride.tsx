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

const Pride = () => {
  const [selectedTier, setSelectedTier] = useState<"TIER_1" | "TIER_2" | "TIER_3">("TIER_2");

  const tiers = {
    TIER_1: { amount: "1.5L", savings: "18,000+", limit: "3,000" },
    TIER_2: { amount: "3L", savings: "36,000+", limit: "6,000" },
    TIER_3: { amount: "5L", savings: "60,000+", limit: "10,000" },
  };

  return (
    <PageShell>
      <div className="bg-background text-foreground overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 pb-16 px-4 overflow-hidden bg-gradient-to-b from-cream to-background">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
             <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-mint rounded-full blur-[120px] animate-pulse" />
             <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-harvest rounded-full blur-[120px] animate-pulse delay-700" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container max-w-4xl text-center relative z-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-1.5 text-xs font-bold text-white mb-6 tracking-wider">
              PRIDE PARTNERSHIP
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl font-medium leading-[1.1] mb-8">
              Up to <span className="text-forest underline decoration-harvest decoration-4 underline-offset-8">50% off</span> <br />
              every grocery bill <br />
              <span className="text-harvest italic">forever.</span>
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-3xl mx-auto">
                {[
                    { label: "11 yrs", sub: "Trusted", icon: Award },
                    { label: "₹60K+", sub: "Saved/yr", icon: TrendingUp },
                    { label: "1,600+", sub: "Products", icon: Sprout },
                    { label: "Zero", sub: "Lock-in", icon: Lock },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/50 backdrop-blur-sm border border-border/50 p-4 rounded-2xl flex flex-col items-center shadow-sm">
                        <stat.icon className="h-5 w-5 text-forest mb-2" />
                        <p className="text-lg font-bold text-foreground">{stat.label}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col items-center gap-4">
              <button className="h-16 px-10 rounded-full bg-forest text-white font-bold text-lg shadow-xl shadow-forest/20 hover:bg-forest/90 transition-all flex items-center gap-3 active:scale-95 group">
                Become a PRIDE Partner
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-sm text-muted-foreground font-medium">
                Starts from ₹1.5L · <span className="text-forest">100% refundable anytime</span>
              </p>
            </div>
          </motion.div>

          <div className="mt-20 animate-bounce text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Scroll</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-muted-foreground to-transparent" />
            </div>
          </div>
        </section>

        {/* Who We Are */}
        <section className="py-24 container max-w-6xl">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="relative">
                    <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000" alt="Organic produce" className="rounded-[40px] shadow-2xl aspect-[4/5] object-cover" />
                    <div className="absolute -bottom-8 -right-8 bg-harvest p-8 rounded-3xl shadow-xl max-w-[240px] text-white">
                        <p className="font-serif text-3xl mb-1">11</p>
                        <p className="text-sm font-bold uppercase tracking-wider">Years of Operation</p>
                        <div className="mt-4 w-12 h-1 bg-white/30" />
                        <p className="mt-4 text-xs font-medium opacity-90 leading-relaxed">Built without a single bank loan or VC fund. Just farmer trust.</p>
                    </div>
                </div>
                <div>
                    <h2 className="font-serif text-4xl md:text-5xl mb-6">Bengaluru's most trusted organic grocery store.</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                        11 years. One brand. Zero adulteration. Every product sourced directly from farmers who respect their soil.
                    </p>
                    
                    <div className="space-y-6">
                        {[
                            { t: "1,600+ Organic Products", d: "Zero adulteration. Every product has a history. Every farmer has a name.", icon: Sprout },
                            { t: "Direct Farm. No Middlemen.", d: "Fair price for farmers. Honest price for you. Live processing in-store.", icon: Handshake },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-6 rounded-3xl bg-surface border border-border/50">
                                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-mint-soft text-forest shrink-0">
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">{item.t}</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-8 rounded-[32px] bg-forest/5 border border-forest/10 relative">
                        <span className="absolute -top-4 left-8 text-6xl text-forest/20 font-serif">"</span>
                        <p className="text-lg italic text-forest font-medium relative z-10">
                            This is not commerce. This is conscience. When you buy from us, you are protecting your family, supporting a farmer, and refusing to compromise on what matters most.
                        </p>
                        <div className="mt-6 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-forest" />
                            <div>
                                <p className="font-bold text-sm">Sattya</p>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Founder & CEO · FreshOn.in</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* What Is PRIDE? */}
        <section className="py-24 bg-forest text-white">
            <div className="container max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="font-serif text-4xl md:text-6xl mb-6">Not a loyalty card. <br /> A seat at our table.</h2>
                    <p className="max-w-2xl mx-auto text-forest-foreground opacity-80 text-lg">
                        Most businesses raise capital from banks and quietly pass the cost to customers. We designed a completely different model.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { t: "The Old Way", d: "Banks loan money. Returns collected from customers. You pay more. Profits leave.", icon: "🏦", color: "bg-white/10" },
                        { t: "The Insight", d: "What if the returns went back to customers instead? Same capital. But you are the investor.", icon: "💡", color: "bg-white/10" },
                        { t: "PRIDE Partnership", d: "You invest. Benefits return as grocery savings. Farmers thrive. Community grows.", icon: "🤝", color: "bg-mint" },
                    ].map((item, i) => (
                        <div key={i} className={cn("p-8 rounded-[40px] flex flex-col items-center text-center", item.color)}>
                            <div className="text-5xl mb-6">{item.icon}</div>
                            <h3 className="text-2xl font-bold mb-4">{item.t}</h3>
                            <p className="text-sm leading-relaxed opacity-90">{item.d}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-20 pt-20 border-t border-white/10 flex flex-wrap justify-center gap-8 md:gap-16">
                    {['People', 'Real Farmers', 'Integrity', 'Dignity', 'Ecosystem'].map((word, i) => (
                        <div key={i} className="text-center">
                            <p className="text-5xl font-serif font-bold text-mint mb-2">{word[0]}</p>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80">{word}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* 4 Direct Benefits */}
        <section className="py-24 container max-w-5xl">
            <div className="text-center mb-16">
                <h2 className="font-serif text-4xl md:text-5xl mb-4">4 Direct Benefits</h2>
                <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">Activates on your very first bill.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {[
                    { v: "30", l: "30% Flat Discount", d: "Applied at the billing counter. No codes. No waiting. Instant, every visit.", sub: "Instant · At billing" },
                    { v: "10", l: "10% Wallet Savings", d: "Credited to your PRIDE wallet every month. Use anytime. Never expires.", sub: "Monthly · Zero expiry" },
                    { v: "5", l: "5% Loyalty Bonus", d: "Stay invested for 12 months, receive an extra 5% — our thanks for the commitment.", sub: "Credited yearly" },
                    { v: "5", l: "5% Referral Bonus", d: "Refer a friend. When they first purchase, 5% goes into your wallet. No cap.", sub: "Per referral · Unlimited" },
                ].map((item, i) => (
                    <div key={i} className="bg-surface p-8 rounded-[40px] border border-border/50 group hover:border-mint transition-all">
                        <div className="flex items-start justify-between mb-6">
                            <div className="text-6xl font-serif font-bold text-forest group-hover:scale-110 transition-transform origin-left">{item.v}</div>
                            <div className="text-[10px] font-bold uppercase tracking-wider bg-mint-soft text-forest px-3 py-1 rounded-full">{item.sub}</div>
                        </div>
                        <h3 className="text-xl font-bold mb-3">{item.l}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.d}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* Savings Breakdown */}
        <section className="py-24 bg-surface">
            <div className="container max-w-4xl">
                <div className="freshon-card bg-white p-8 md:p-12 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-mint/5 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="relative z-10">
                        <h2 className="font-serif text-4xl mb-8 text-center md:text-left">The Savings Breakdown</h2>
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                {[
                                    { label: "Flat Discount (30%)", val: "₹36,000/yr", icon: Gift },
                                    { label: "Wallet Credits (10%)", val: "₹12,000/yr", icon: Wallet },
                                    { label: "Loyalty Bonus (5%)", val: "₹6,000/yr", icon: Star },
                                    { label: "Referral Bonus (5%)", val: "₹6,000/yr", icon: Users },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-mint-soft flex items-center justify-center text-forest">
                                                <item.icon className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                                        </div>
                                        <span className="font-bold">{item.val}</span>
                                    </div>
                                ))}
                                <div className="pt-6 border-t border-border flex items-center justify-between">
                                    <span className="font-display text-lg font-bold">Total Annual Benefit</span>
                                    <span className="font-display text-3xl font-bold text-forest">₹60,000+</span>
                                </div>
                            </div>
                            <div className="bg-forest p-8 rounded-[40px] text-white text-center">
                                <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Effective Savings</p>
                                <p className="text-7xl font-serif font-bold mb-4">~50%</p>
                                <p className="text-xs leading-relaxed opacity-90">Based on ₹5L tier investment with ₹10,000/month average bill.</p>
                                <button className="mt-8 w-full h-14 rounded-full bg-mint text-forest font-bold hover:bg-mint/90 transition-colors">See for ₹1.5L Tier</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Security Section */}
        <section className="py-24 container max-w-6xl">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="font-serif text-4xl md:text-5xl mb-6">Your investment is always yours. Ask for it back — anytime.</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                        100% principal refundable. No deductions. No penalty. Just 1 month's notice. We back this with signed legal documents.
                    </p>
                    <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                        {[
                            { l: "100% Refundable", icon: CheckCircle2 },
                            { l: "1 Month Notice", icon: Calendar },
                            { l: "Legally Signed", icon: ShieldCheck },
                        ].map((item, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-surface border border-border/50">
                                <item.icon className="h-6 w-6 text-forest mx-auto mb-2" />
                                <p className="text-[10px] font-bold uppercase tracking-wider">{item.l}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-cream p-8 md:p-12 rounded-[40px] border-2 border-forest/10 relative">
                    <div className="absolute top-6 right-6 text-forest/20">
                        <Lock className="h-12 w-12" />
                    </div>
                    <h3 className="font-serif text-2xl mb-8">Documentation before you pay</h3>
                    <div className="space-y-6">
                        {[
                            { n: "01", t: "Payment Receipt", d: "Official proof of investment — amount, date, tier — signed by FreshOn.in on the same day." },
                            { n: "02", t: "Signed Term Sheet", d: "All benefits, wallet carry-forward, full refund rights — signed by both parties." },
                        ].map((doc, i) => (
                            <div key={i} className="flex gap-4">
                                <span className="font-serif text-2xl text-forest opacity-30">{doc.n}</span>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">{doc.t}</h4>
                                    <p className="text-sm text-muted-foreground">{doc.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 p-4 rounded-xl bg-forest/5 border border-forest/10 text-xs font-bold text-forest text-center uppercase tracking-wider">
                        Documents issued before account activates
                    </div>
                </div>
            </div>
        </section>

        {/* Investment Tiers */}
        <section className="py-24 bg-background">
            <div className="container max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="font-serif text-4xl md:text-5xl mb-4">Choose Your Investment</h2>
                    <p className="text-muted-foreground uppercase tracking-widest text-sm font-bold">Founding Partner slots are limited.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { 
                            id: "TIER_1", 
                            t: "Basic Partner", 
                            a: "1.5L", 
                            l: "3,000", 
                            s: "18,000+", 
                            color: "bg-surface", 
                            perks: ["Core benefits"] 
                        },
                        { 
                            id: "TIER_2", 
                            t: "Preferred Partner", 
                            a: "3L", 
                            l: "6,000", 
                            s: "36,000+", 
                            color: "bg-mint-soft", 
                            popular: true, 
                            perks: ["Most chosen", "Higher limit"] 
                        },
                        { 
                            id: "TIER_3", 
                            t: "Founding Partner", 
                            a: "5L", 
                            l: "10,000", 
                            s: "60,000+", 
                            color: "bg-forest", 
                            text: "text-white", 
                            perks: ["Premium Exclusives ★", "Free Delivery", "Priority Processing", "Farm Visits", "Direct to CEO"] 
                        },
                    ].map((tier) => (
                        <button 
                            key={tier.id}
                            onClick={() => setSelectedTier(tier.id as any)}
                            className={cn(
                                "p-8 rounded-[40px] text-left transition-all relative overflow-hidden border-2",
                                tier.color,
                                tier.text || "text-foreground",
                                selectedTier === tier.id ? "border-harvest scale-[1.02] shadow-xl" : "border-transparent opacity-80"
                            )}
                        >
                            {tier.popular && (
                                <div className="absolute top-4 right-4 bg-harvest text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    Most Chosen
                                </div>
                            )}
                            <h3 className="text-xl font-bold mb-1">{tier.t}</h3>
                            <p className="text-4xl font-serif font-bold mb-6">₹{tier.a}</p>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="opacity-70">Eligible Monthly Bill</span>
                                    <span className="font-bold">₹{tier.l}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="opacity-70">Annual Savings</span>
                                    <span className="font-bold text-harvest">₹{tier.s}</span>
                                </div>
                            </div>

                            <ul className="space-y-3">
                                {tier.perks.map((p, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                                        {p}
                                    </li>
                                ))}
                            </ul>

                            <div className={cn(
                                "mt-10 h-14 w-full rounded-full flex items-center justify-center font-bold transition-all",
                                tier.id === "TIER_3" ? "bg-white text-forest" : "bg-forest text-white"
                            )}>
                                {selectedTier === tier.id ? "Selected Tier" : "Choose Tier"}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 container max-w-4xl text-center">
            <div className="bg-gradient-to-br from-cream to-mint-soft rounded-[50px] p-12 md:p-20 relative overflow-hidden">
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-harvest/20 rounded-full blur-[100px]" />
                <h2 className="font-serif text-4xl md:text-6xl mb-8">The returns stay in our community. Will you be part of it?</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                    Banks will give us money. We chose you instead — because you deserve to share in what we build together.
                </p>
                <button className="h-16 px-12 rounded-full bg-forest text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all active:scale-95">
                    Become a PRIDE Partner Now →
                </button>
                <div className="mt-8 flex items-center justify-center gap-6 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Sattya, Founder & CEO</span>
                    <div className="h-4 w-[1px] bg-border" />
                    <span>808 808 09 09</span>
                </div>
            </div>
        </section>
        
        {/* Footer info */}
        <section className="py-12 border-t border-border container text-center">
            <p className="text-xs text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                © 2025 FreshOn.in · Every PRIDE Partnership is backed by signed legal documents issued before your account activates. Your investment is 100% refundable anytime with 1 month's notice. Documentation within 24 hours.
            </p>
        </section>
      </div>
    </PageShell>
  );
};

export default Pride;
