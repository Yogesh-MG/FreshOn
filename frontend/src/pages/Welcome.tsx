import { Link } from "react-router-dom";
import { Leaf, Clock, ShieldCheck, ChevronRight } from "lucide-react";

const Welcome = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-mint/30">
      {/* Background/Brand Section */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-forest px-6 text-center text-forest-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-mint blur-3xl" />
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-harvest blur-3xl" />
        </div>
        
        <img src="/logo.png" alt="Freshon.in" className="relative z-10 mb-8 h-24 w-auto brightness-0 invert" />
        
        <h1 className="relative z-10 font-display text-4xl font-bold leading-tight md:text-5xl">
          Harvested Today.<br />
          <span className="font-serif italic font-medium text-mint">Delivered in 12 min.</span>
        </h1>
        <p className="relative z-10 mt-4 max-w-sm text-lg opacity-90">
          Direct from local farmers to your kitchen. Pesticide-free, organic, and always fresh.
        </p>
      </div>

      {/* Features & Actions */}
      <div className="flex flex-col gap-8 rounded-t-[32px] bg-background px-8 pt-10 pb-12 shadow-2xl">
        <div className="grid gap-5">
          {[
            { icon: Clock, t: "Ultra-Fast Delivery", d: "Your order reaches you within 12 minutes." },
            { icon: ShieldCheck, t: "Pesticide Free", d: "Independently tested organic produce." },
            { icon: Leaf, t: "Traceable Sourcing", d: "Know the farmer who grew your food." },
          ].map((f) => (
            <div key={f.t} className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint-soft text-forest">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold">{f.t}</h3>
                <p className="text-xs text-muted-foreground">{f.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-3">
          <Link
            to="/signup"
            className="flex h-14 w-full items-center justify-center rounded-full bg-forest text-sm font-semibold text-forest-foreground shadow-soft transition-transform active:scale-95"
          >
            Get Started <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="flex h-14 w-full items-center justify-center rounded-full bg-surface text-sm font-semibold text-forest transition-transform active:scale-95"
          >
            I already have an account
          </Link>
        </div>
        
        <p className="text-center text-[10px] text-muted-foreground">
          By continuing, you agree to our <span className="underline">Terms</span> and <span className="underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default Welcome;
