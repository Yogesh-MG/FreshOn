import { Tractor, ShieldCheck, Sprout } from "lucide-react";

const items = [
  { icon: Tractor, title: "Direct from Farmers", desc: "No middlemen. Better prices for you, fairer pay for them." },
  { icon: ShieldCheck, title: "No Chemicals", desc: "Lab-tested for pesticides. Certified organic produce only." },
  { icon: Sprout, title: "Freshly Harvested", desc: "Picked the same day. On your doorstep within hours." },
];

export const Trust = () => (
  <section className="container mx-auto px-4 py-12 md:py-16">
    <div className="grid md:grid-cols-3 gap-4 md:gap-6">
      {items.map((it) => (
        <div key={it.title} className="bg-card rounded-2xl p-6 shadow-card border border-border/40 hover:shadow-soft transition-smooth">
          <div className="h-12 w-12 rounded-2xl gradient-leaf flex items-center justify-center mb-4 shadow-soft">
            <it.icon className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="font-display text-xl font-600 text-primary mb-1">{it.title}</h3>
          <p className="text-sm text-muted-foreground">{it.desc}</p>
        </div>
      ))}
    </div>
  </section>
);
