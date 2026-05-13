import { Link } from "react-router-dom";
import { Star, ArrowRight, ShieldCheck, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export const PrideBanner = () => {
  return (
    <section className="container">
      <Link to="/pride" className="group block">
        <div className="relative overflow-hidden rounded-[32px] bg-forest p-8 md:p-12 text-white shadow-xl shadow-forest/10 transition-all hover:shadow-2xl hover:shadow-forest/20">
          {/* Decorative backgrounds */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-harvest/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-mint/10 rounded-full blur-3xl -ml-24 -mb-24 transition-transform group-hover:scale-110" />

          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-harvest px-3 py-1 text-[10px] font-bold text-harvest-foreground mb-6 uppercase tracking-wider">
                <Star className="h-3 w-3 fill-current" />
                Founding Partner Program
              </div>
              
              <h2 className="font-serif text-3xl md:text-5xl font-medium leading-tight mb-4">
                Get up to <span className="text-mint font-bold italic underline decoration-harvest underline-offset-4">50% off</span> <br />
                your entire grocery bill.
              </h2>
              
              <p className="text-forest-foreground opacity-80 text-sm md:text-base max-w-md mb-8 leading-relaxed">
                Invest in pure food. Get 30% flat discount instantly + 10% monthly wallet credits. 100% refundable anytime.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/10 px-4 py-2 rounded-xl">
                      <ShieldCheck className="h-4 w-4 text-mint" />
                      100% Secure
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/10 px-4 py-2 rounded-xl">
                      <TrendingUp className="h-4 w-4 text-mint" />
                      ₹60,000+ Saved/yr
                  </div>
              </div>

              <div className="inline-flex items-center gap-2 font-bold text-mint group-hover:gap-4 transition-all">
                Become a PRIDE Partner
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>

            <div className="hidden md:flex flex-col items-center justify-center relative">
                <div className="text-center relative">
                    <div className="text-8xl font-serif font-bold text-mint mb-2">30%</div>
                    <div className="text-sm font-bold uppercase tracking-[0.3em] opacity-60">Instant Discount</div>
                    
                    <div className="absolute -top-12 -right-12 w-32 h-32 border-2 border-mint/20 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                         <div className="w-2 h-2 bg-harvest rounded-full" />
                    </div>
                </div>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
};
