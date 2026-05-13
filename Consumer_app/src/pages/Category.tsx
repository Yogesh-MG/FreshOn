import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { ProductCard } from "@/components/freshon/ProductCard";
import { PageShell } from "@/components/freshon/PageShell";
import { StickyCartBar } from "@/components/freshon/StickyCartBar";
import { ChevronLeft, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { groupBatchesByProduct } from "@/utils/product-utils";

const Category = () => {
  const { id } = useParams();
  const [sort, setSort] = useState<"popular" | "price" | "newest">("popular");
  const [organicOnly, setOrganicOnly] = useState(false);

  // 1. Fetch Category Info by slug
  const { data: category } = useQuery({
    queryKey: ["category", id],
    queryFn: () => api.get(`/api/inventory/categories/${id}/`).then((res) => res.data),
  });

  // 2. Fetch Batches for this Category
  const { data: list = [] } = useQuery({
    queryKey: ["category-batches", id, organicOnly],
    queryFn: () => {
      let url = `/api/inventory/batches/?category_slug=${id}`;
      if (organicOnly) url += "&is_organic=true";
      
      return api.get(url).then((res) => {
        const items = res.data.results ?? res.data;
        if (!Array.isArray(items)) return [];
        return groupBatchesByProduct(items);
      });
    },
  });

  return (
    <PageShell>
      <div className="container pt-4">
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-forest">
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold md:text-3xl">
          {category?.emoji} {category?.name ?? "Category"}
        </h1>
        <p className="text-sm text-muted-foreground">{list.length} fresh items available</p>

        {/* Filter row */}
        <div className="scrollbar-hidden mt-4 flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setOrganicOnly((v) => !v)} className={cn("freshon-chip cursor-pointer", organicOnly && "bg-forest text-forest-foreground")}>
            <SlidersHorizontal className="h-3 w-3" /> Organic only
          </button>
          {(["popular", "price", "newest"] as const).map((k) => (
            <button key={k} onClick={() => setSort(k)} className={cn("freshon-chip cursor-pointer capitalize", sort === k && "bg-forest text-forest-foreground")}>
              {k === "price" ? "Price: low to high" : k}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
          {list.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-muted-foreground">No items match your filters.</p>
          )}
        </div>
      </div>
      <StickyCartBar />
    </PageShell>
  );
};

export default Category;
