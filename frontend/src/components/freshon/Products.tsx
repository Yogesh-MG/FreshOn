import { Sparkles, ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { Link } from "react-router-dom";

import { groupBatchesByProduct } from "@/utils/product-utils";

export const FreshToday = () => {
  const { data: products = [] } = useQuery({
    queryKey: ["web-fresh-today"],
    queryFn: () => api.get("/api/inventory/batches/?is_farm_fresh=true").then((res) => {
      const items = res.data.results ?? res.data;
      if (!Array.isArray(items)) return [];
      return groupBatchesByProduct(items).slice(0, 4);
    }),
  });

  return (
    <section className="rounded-[40px] bg-mint-soft/30 p-8 md:p-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-1.5 text-xs font-bold text-forest">
            <Sparkles className="h-4 w-4" /> Just harvested
          </div>
          <h2 className="mt-4 font-display text-4xl font-bold">Fresh Today</h2>
          <p className="mt-2 text-lg text-muted-foreground">Picked this morning. On your table by evening.</p>
        </div>
        <Link to="/categories" className="font-bold text-forest hover:underline">View all →</Link>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
        {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
};

export const ProductGrid = () => {
  // Best of the harvest: Processed products like Ghee, Honey, Jaggery, Spices
  const { data: products = [] } = useQuery({
    queryKey: ["web-best-harvest"],
    queryFn: () => api.get("/api/inventory/batches/").then((res) => {
      const items = res.data.results ?? res.data;
      if (!Array.isArray(items)) return [];
      
      // Filter for processed / long shelf life categories
      const processedSlugs = ["oils-and-ghee", "honey-and-jams", "spices-and-masala", "dairy-and-eggs", "snacks"];
      const filtered = items.filter((b: any) => 
        b && (processedSlugs.includes(b.category_slug) || 
        processedSlugs.includes(b.category_name?.toLowerCase()?.replace(/ /g, "-")))
      );

      const toGroup = filtered.length > 0 ? filtered : items;
      return groupBatchesByProduct(toGroup).slice(0, 10);
    }),
  });

  return (
    <section id="products" className="py-16">
      <div className="flex items-end justify-between border-b pb-6">
        <div>
          <h2 className="font-display text-3xl font-bold">Best of the harvest</h2>
          <p className="text-muted-foreground">Processed with care for longer shelf life.</p>
        </div>
        <Link to="/categories" className="font-bold text-forest hover:underline text-sm">Explore all categories →</Link>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
        {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
};
