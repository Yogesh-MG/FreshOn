import { useState } from "react";
import { PageShell } from "@/components/freshon/PageShell";
import { ProductCard } from "@/components/freshon/ProductCard";
import { LayoutGrid, ChevronLeft, Search, Filter, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { cn } from "@/lib/utils";
import { groupBatchesByProduct } from "@/utils/product-utils";

// Categories page — lazy-loads subcategories on category click

const Categories = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  // 1. Fetch top-level categories (lightweight — no nested subcategories)
  const { data: mainGroups = [] } = useQuery({
    queryKey: ["categories-all"],
    queryFn: () => api.get("/api/inventory/categories/").then((res) => {
      const data = res.data;
      return Array.isArray(data) ? data : (data.results ?? []);
    }),
  });

  // 2. Lazy-fetch subcategories only when a category is selected
  const selectedGroup = mainGroups.find((i: any) => i.id.toString() === selectedGroupId);

  const { data: subCategories = [], isLoading: subsLoading } = useQuery({
    queryKey: ["subcategories", selectedGroup?.slug],
    enabled: !!selectedGroup?.slug,
    queryFn: () =>
      api
        .get(`/api/inventory/categories/${selectedGroup.slug}/subcategories/`)
        .then((res) => res.data),
  });

  // 3. Auto-select first subcategory once loaded
  const effectiveSubId = selectedSubId || (subCategories.length > 0 ? subCategories[0].id.toString() : null);

  // 4. Fetch products for the selected subcategory (or main category if no sub)
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["category-products", selectedGroupId, effectiveSubId],
    enabled: !!selectedGroupId,
    queryFn: () => {
      const url = effectiveSubId
        ? `/api/inventory/batches/?subcategory=${effectiveSubId}`
        : `/api/inventory/batches/?category=${selectedGroupId}`;

      return api.get(url).then((res) => {
        // Handle paginated response
        const items = res.data.results ?? res.data;
        if (!Array.isArray(items)) return [];
        return groupBatchesByProduct(items);
      });
    },
  });

  if (!selectedGroupId) {
    return (
      <PageShell>
        <div className="container pb-24 pt-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold">Categories</h1>
            <button className="rounded-full bg-surface p-2"><Search className="h-5 w-5" /></button>
          </div>

          <div className="grid grid-cols-4 gap-x-3 gap-y-6">
            {mainGroups.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedGroupId(cat.id.toString());
                  setSelectedSubId(null); // reset — will auto-pick first sub once loaded
                }}
                className="flex flex-col items-center gap-2 text-center"
              >
                <div className="aspect-square w-full overflow-hidden rounded-2xl bg-surface p-2 transition-transform active:scale-95">
                  <div className="grid h-full w-full place-items-center text-4xl">
                    {cat.emoji}
                  </div>
                </div>
                <span className="line-clamp-2 text-[10px] font-semibold leading-tight">{cat.name}</span>
                {cat.subcategory_count > 0 && (
                  <span className="text-[8px] text-muted-foreground">{cat.subcategory_count} sub</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex h-[calc(100vh-64px)] flex-col bg-background">
        {/* Header */}
        <header className="flex items-center gap-4 border-b border-border px-4 py-3">
          <button onClick={() => setSelectedGroupId(null)} className="rounded-full hover:bg-surface p-1">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="flex-1 font-display text-lg font-bold">{selectedGroup?.name}</h1>
          <button className="rounded-full hover:bg-surface p-1"><Search className="h-5 w-5" /></button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-20 border-r border-border bg-surface/30 overflow-y-auto pb-20">
            {subsLoading ? (
              <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              subCategories.map((sub: any) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubId(sub.id.toString())}
                  className={cn(
                    "relative flex w-full flex-col items-center gap-1.5 py-4 text-center transition-colors",
                    effectiveSubId === sub.id.toString() ? "bg-background text-forest" : "text-muted-foreground"
                  )}
                >
                  {effectiveSubId === sub.id.toString() && <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-forest" />}
                  <div className={cn(
                    "grid h-12 w-12 place-items-center rounded-xl text-2xl transition-all",
                    effectiveSubId === sub.id.toString() ? "bg-mint-soft scale-110" : "bg-surface"
                  )}>
                    {sub.emoji}
                  </div>
                  <span className={cn("px-1 text-[9px] font-bold leading-tight", effectiveSubId === sub.id.toString() ? "text-forest" : "text-muted-foreground")}>
                    {sub.name}
                  </span>
                </button>
              ))
            )}
          </aside>

          {/* Product Grid */}
          <main className="flex-1 overflow-y-auto p-4 pb-24">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[10px] font-bold">
                  <Filter className="h-3 w-3" /> Sort By
                </button>
                <button className="rounded-full border border-border px-3 py-1.5 text-[10px] font-bold">Fresh</button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-surface" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {products.length > 0 ? (
                  products.map((p: any) => <ProductCard key={p.id} product={p} />)
                ) : (
                  <p className="col-span-full py-20 text-center text-sm text-muted-foreground">No products found in this category.</p>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </PageShell>
  );
};

export default Categories;
