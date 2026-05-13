import { MapPin, Quote } from "lucide-react";
import farmer from "@/assets/farmer.jpg";

export const FarmerHighlight = () => (
  <section className="container mx-auto px-4 py-12 md:py-16">
    <div className="rounded-[2rem] overflow-hidden gradient-leaf relative">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
      <div className="grid md:grid-cols-2 gap-8 items-center p-6 md:p-12 relative">
        <div className="relative">
          <img
            src={farmer}
            alt="Farmer Ramesh Patil from Nashik"
            loading="lazy"
            width={1024}
            height={1024}
            className="rounded-[1.5rem] w-full aspect-square object-cover shadow-pop"
          />
          <div className="absolute -bottom-4 -right-4 bg-background rounded-2xl px-4 py-3 shadow-pop">
            <div className="text-xs text-muted-foreground">Farming since</div>
            <div className="font-display text-2xl font-700 text-primary">1998</div>
          </div>
        </div>

        <div className="text-primary-foreground">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-medium mb-4">
            Sourced from local farms
          </div>
          <Quote className="h-8 w-8 opacity-60 mb-3" />
          <p className="font-display text-2xl md:text-3xl font-500 leading-snug">
            "We grow with love and zero chemicals. Freshon brings our harvest straight to families who care."
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div>
              <div className="font-bold text-lg">Ramesh Patil</div>
              <div className="flex items-center gap-1 text-sm opacity-80">
                <MapPin className="h-3.5 w-3.5" /> Nashik, Maharashtra
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
            {[["200+", "Partner farms"], ["12", "States"], ["48 hr", "Farm to door"]].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-2xl md:text-3xl font-700">{n}</div>
                <div className="text-xs opacity-80">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);
