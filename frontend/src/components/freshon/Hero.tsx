import { ArrowRight, Clock, Leaf } from "lucide-react";
import hero from "@/assets/hero-produce.jpg";

export const Hero = () => (
  <section className="relative overflow-hidden gradient-hero">
    <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-leaf-light/20 blur-3xl" />
    <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-sun/10 blur-3xl" />

    <div className="container mx-auto px-4 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center relative">
      <div className="animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/70 backdrop-blur border border-border text-xs font-medium text-leaf mb-5">
          <Leaf className="h-3.5 w-3.5" /> 100% Organic · Direct from Farms
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-600 leading-[1.05] text-primary">
          Fresh from <span className="italic text-leaf-light">farms</span><br />
          to your home.
        </h1>
        <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-md">
          Hand-picked organic produce delivered in under 2 hours. No middlemen, no chemicals — just real food from real farmers.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a href="#products" className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl gradient-leaf text-primary-foreground font-semibold shadow-pop hover:shadow-soft transition-smooth">
            Shop Now
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-smooth" />
          </a>
          <div className="flex items-center gap-2 text-sm text-foreground/80">
            <div className="h-9 w-9 rounded-full bg-background flex items-center justify-center shadow-card">
              <Clock className="h-4 w-4 text-leaf" />
            </div>
            <div>
              <div className="font-semibold">Delivery in 90 min</div>
              <div className="text-xs text-muted-foreground">Free above ₹299</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 rounded-[2rem] gradient-leaf blur-2xl opacity-20 -z-10" />
        <img
          src={hero}
          alt="Fresh organic vegetables and fruits"
          width={1536}
          height={1024}
          className="rounded-[2rem] shadow-pop w-full object-cover aspect-[4/3] animate-float"
        />
        <div className="absolute -bottom-5 -left-5 bg-background rounded-2xl shadow-pop px-4 py-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-leaf/10 flex items-center justify-center">
            <Leaf className="h-5 w-5 text-leaf" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Trusted by</div>
            <div className="font-bold text-sm">50,000+ families</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
