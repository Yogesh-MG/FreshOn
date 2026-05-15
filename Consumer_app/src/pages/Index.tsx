import { Link } from "react-router-dom";
import hero from "@/assets/hero-produce.jpg";
import { useQuery } from "@tanstack/react-query";
import { inventory as inventoryModule } from "@freshon/api";
import { ProductCard } from "@/components/freshon/ProductCard";
import { FarmerCard } from "@/components/freshon/FarmerCard";
import { AIBanner } from "@/components/freshon/AIBanner";
import { PageShell } from "@/components/freshon/PageShell";
import { StickyCartBar } from "@/components/freshon/StickyCartBar";
import { ProductSkeleton, CategorySkeleton } from "@/components/freshon/Skeletons";
import { Leaf, ShieldCheck, Sprout, Clock } from "lucide-react";
import { groupBatchesByProduct } from "@/utils/product-utils";
import { PrideBanner } from "@/components/freshon/PrideBanner";
import { ErrorBoundary } from "@/components/freshon/ErrorBoundary";

const Home = () => {
  return (
    <ErrorBoundary>
      <HomeContent />
    </ErrorBoundary>
  );
};

const HomeContent = () => {
  // Fetch all data in parallel instead of sequentially
  const { data: homeData, isLoading } = useQuery({
    queryKey: ["home-page-data"],
    queryFn: async () => {
      const [categoriesRes, freshRes, farmersRes] = await Promise.all([
        inventoryModule.listCategories(),
        inventoryModule.listBatches({ is_farm_fresh: true }),
        inventoryModule.listFarmers(),
      ]);

      return {
        categories: categoriesRes?.results || [],
        fresh: groupBatchesByProduct(freshRes?.results || []),
        farmers: farmersRes?.results || [],
      };
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
    gcTime: 10 * 60 * 1000,
  });

  const categories = homeData?.categories || [];
  const freshData = homeData?.fresh || [];
  const farmers = homeData?.farmers || [];
  const categoriesLoading = isLoading;
  const freshLoading = isLoading;

  const best = freshData.slice(0, 4);
  const recommended = freshData.slice(0, 4);

  return (
    <PageShell>
      {/* Hero */}
      <section className="container pt-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-fresh md:rounded-[28px]">
          <div className="grid items-center gap-4 p-5 md:grid-cols-2 md:gap-6 md:p-10">
            <div className="order-2 md:order-1">
              <span className="freshon-chip mb-3 bg-background/80">
                <Clock className="h-3 w-3 text-mint" /> Delivered in <b className="text-forest">12 minutes</b>
              </span>
              <h1 className="font-display text-3xl font-bold leading-tight text-forest md:text-5xl">
                Fresh from farms <br />
                <span className="font-serif italic font-medium">to your home.</span>
              </h1>
              <p className="mt-3 max-w-md text-sm text-foreground/80 md:text-base">
                Hand-picked organic produce, harvested today and delivered straight from the farmer who grew it.
              </p>
              <div className="mt-5 flex gap-2">
                <Link to="/category/vegetables" className="inline-flex h-12 items-center rounded-full bg-forest px-6 text-sm font-semibold text-forest-foreground shadow-soft transition hover:bg-forest/90">
                  Shop Fresh →
                </Link>
                <Link to="/farmers" className="inline-flex h-12 items-center rounded-full bg-background px-6 text-sm font-semibold text-forest hover:bg-background/80">
                  Meet farmers
                </Link>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <img src={hero} alt="Fresh organic vegetables" width={1536} height={1024} className="aspect-[5/4] w-full rounded-xl object-cover md:rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mt-8">
        <h2 className="mb-3 font-display text-lg font-bold">Shop by category</h2>
        <div className="scrollbar-hidden -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-6 md:px-0">
          {categoriesLoading 
            ? Array(6).fill(0).map((_, i) => <CategorySkeleton key={i} />)
            : Array.isArray(categories) && categories.map((c: any) => (
              <Link
                key={c.id}
                to={`/category/${c.slug}`}
                className="freshon-card flex w-24 shrink-0 flex-col items-center gap-2 p-3 text-center hover:bg-mint-soft md:w-auto"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full bg-mint-soft text-2xl">{c.emoji}</span>
                <span className="text-xs font-semibold">{c.name}</span>
              </Link>
            ))
          }
        </div>
      </section>

      {/* AI recommendations */}
      <section className="container mt-8">
        <AIBanner title="Recommended for you" hint="Based on your last orders & today's freshest stock">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {recommended.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </AIBanner>
      </section>

      <PrideBanner />

      {/* Fresh today */}
      <Section title="Fresh today" subtitle="Harvested in the last 12 hours" link="/category/vegetables">
        <div className="scrollbar-hidden -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-4 md:px-0 md:gap-4">
          {freshLoading
            ? Array(4).fill(0).map((_, i) => <div key={i} className="w-44 shrink-0 md:w-auto"><ProductSkeleton /></div>)
            : freshData.map((p) => (
                <div key={p.id} className="w-44 shrink-0 md:w-auto"><ProductCard product={p} /></div>
              ))
          }
        </div>
      </Section>

      {/* Best sellers */}
      <Section title="Best sellers" subtitle="Customer favourites this week">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {best.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </Section>

      {/* Farmers */}
      <Section title="From local farmers" subtitle="Real people growing your food">
        <div className="scrollbar-hidden -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:flex md:gap-4 md:px-0">
          {farmers.map((f) => <FarmerCard key={f.id} farmer={f} />)}
        </div>
      </Section>

      {/* Trust */}
      <section className="container mt-10 mb-12">
        <div className="rounded-2xl bg-forest p-6 text-forest-foreground md:p-10">
          <h3 className="font-serif text-2xl font-medium md:text-3xl">Why Freshon?</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { icon: ShieldCheck, t: "No chemicals", d: "Independently tested. Zero pesticides on our organic range." },
              { icon: Sprout, t: "Direct from farmers", d: "We pay farmers fairly. You get traceability on every item." },
              { icon: Leaf, t: "Freshly harvested", d: "Picked today, on your doorstep within hours." },
            ].map((b) => (
              <div key={b.t} className="rounded-xl bg-background/10 p-4 backdrop-blur">
                <b.icon className="mb-3 h-6 w-6 text-mint" />
                <h4 className="font-display text-base font-bold">{b.t}</h4>
                <p className="mt-1 text-sm opacity-85">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Company Footer */}
      <footer className="mt-12 border-t border-border bg-surface/50 py-10 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-display text-xl font-bold text-forest">Freshon</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                FreshOn is a farm-to-fork initiative connecting health-conscious consumers directly with local farmers. 
                We ensure 100% organic, pesticide-free produce harvested on the same day it reaches your doorstep.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Company Details</h3>
              <ul className="mt-3 space-y-2 text-sm text-foreground/80">
                <li>Freshon Organic Solutions Pvt Ltd</li>
                <li>#45, Farm Hub North, Hebbal, Bangalore</li>
                <li>Karnataka, India - 560024</li>
                <li className="pt-2">
                  <a 
                    href="https://freshon.in" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1.5 font-bold text-forest hover:underline"
                  >
                    Visit Website <Leaf className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-border/50 pt-6 text-center text-[10px] text-muted-foreground uppercase tracking-widest">
            © 2026 Freshon. All rights reserved.
          </div>
        </div>
      </footer>
    </PageShell>
  );
};

const Section = ({ title, subtitle, link, children }: { title: string; subtitle?: string; link?: string; children: React.ReactNode }) => (
  <section className="container mt-8">
    <div className="mb-3 flex items-end justify-between">
      <div>
        <h2 className="font-display text-lg font-bold md:text-xl">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground md:text-sm">{subtitle}</p>}
      </div>
      {link && <Link to={link} className="text-xs font-semibold text-forest hover:underline">See all →</Link>}
    </div>
    {children}
  </section>
);

export default Home;
