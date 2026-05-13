import { Link } from "react-router-dom";
import { Star, ArrowRight, ShieldCheck, TrendingUp } from "lucide-react";
import { TouchScale } from "./TouchScale";

export const PrideBanner = () => {
  return (
    <section className="container mt-8">
      <TouchScale>
        <Link to="/pride" className="block">
          <div className="relative overflow-hidden rounded-[32px] bg-forest p-6 text-white shadow-lg">
            {/* Decorative backgrounds */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-harvest/10 rounded-full blur-3xl -mr-24 -mt-24" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-harvest px-3 py-1 text-[8px] font-bold text-harvest-foreground mb-4 uppercase tracking-wider">
                <Star className="h-2.5 w-2.5 fill-current" />
                Founding Partner Program
              </div>
              
              <h2 className="font-serif text-2xl font-medium leading-tight mb-3">
                Get <span className="text-mint font-bold italic underline decoration-harvest underline-offset-4">50% off</span> <br />
                every grocery bill.
              </h2>
              
              <p className="text-forest-foreground opacity-80 text-xs max-w-[240px] mb-6 leading-relaxed">
                Invest in pure food. 30% flat discount + 10% monthly credits. 100% refundable.
              </p>

              <div className="flex gap-3 mb-6">
                  <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-lg">
                      <ShieldCheck className="h-3 w-3 text-mint" />
                      100% Secure
                  </div>
                  <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-lg">
                      <TrendingUp className="h-3 w-3 text-mint" />
                      ₹60K+ Saved/yr
                  </div>
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-bold text-mint">
                Join PRIDE Partnership
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            {/* Price Badge */}
            <div className="absolute top-1/2 -right-6 -translate-y-1/2 opacity-20 rotate-12">
                <div className="text-8xl font-serif font-bold text-mint">30%</div>
            </div>
          </div>
        </Link>
      </TouchScale>
    </section>
  );
};
