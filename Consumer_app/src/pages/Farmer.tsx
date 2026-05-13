import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { PageShell } from "@/components/freshon/PageShell";
import { ProductCard } from "@/components/freshon/ProductCard";
import { ChevronLeft, MapPin, Star, Award } from "lucide-react";
import { StickyCartBar } from "@/components/freshon/StickyCartBar";
import { groupBatchesByProduct } from "@/utils/product-utils";

const Farmer = () => {
  const { id } = useParams();

  // 1. Fetch Farmer Profile
  const { data: farmer, isLoading } = useQuery({
    queryKey: ["farmer", id],
    queryFn: () => api.get(`/api/inventory/farmers/${id}/`).then((res) => res.data),
  });

  // 2. Fetch Farmer's Batches
  const { data: items = [] } = useQuery({
    queryKey: ["farmer-batches", id],
    enabled: !!id,
    queryFn: () => api.get(`/api/inventory/batches/?farmer=${id}`).then((res) => {
      const items = res.data.results ?? res.data;
      if (!Array.isArray(items)) return [];
      return groupBatchesByProduct(items);
    }),
  });

  if (isLoading) return <PageShell><div className="container py-16 text-center">Loading...</div></PageShell>;
  if (!farmer) return <PageShell><div className="container py-16 text-center">Farmer not found.</div></PageShell>;

  return (
    <PageShell>
      <div className="container pt-4 pb-12">
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground"><ChevronLeft className="h-4 w-4" /> Back</Link>

        <div className="mt-4 grid gap-6 md:grid-cols-[280px,1fr]">
          <div className="overflow-hidden rounded-2xl">
            <img src={farmer.image} alt={farmer.name} className="aspect-square w-full object-cover" />
          </div>
          <div>
            <span className="freshon-chip bg-mint-soft text-forest"><Award className="h-3 w-3" /> Verified Farmer</span>
            <h1 className="mt-2 font-serif text-3xl font-medium md:text-4xl">{farmer.name}</h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {farmer.location}</span>
              <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-harvest text-harvest" /> {farmer.rating}</span>
            </div>
            <p className="mt-4 text-sm text-foreground/80">
              {farmer.name} has been farming for {farmer.years_of_experience} years, specialising in <b>{farmer.speciality.toLowerCase()}</b>.
              Every harvest is grown without synthetic pesticides and reaches you within hours of picking.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { v: `${farmer.years_of_experience}+`, l: "Years farming" },
                { v: farmer.rating.toString(), l: "Avg rating" },
                { v: "100%", l: "Organic" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-mint-soft p-3 text-center">
                  <p className="font-display text-base font-bold text-forest">{s.v}</p>
                  <p className="text-[10px] text-foreground/70">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h2 className="mt-10 font-display text-lg font-bold">From this farm</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
      <StickyCartBar />
    </PageShell>
  );
};

export default Farmer;
