import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { PageShell } from "@/components/freshon/PageShell";
import { ProductCard } from "@/components/freshon/ProductCard";
import { Search as SearchIcon, TrendingUp, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { groupBatchesByProduct } from "@/utils/product-utils";

const Search = () => {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  // 1. Fetch Search Results
  const { data: results = [] } = useQuery({
    queryKey: ["search", q],
    enabled: q.trim().length > 0,
    queryFn: () => api.get(`/api/inventory/batches/?search=${q}`).then((res) => {
      const items = res.data.results ?? res.data;
      if (!Array.isArray(items)) return [];
      return groupBatchesByProduct(items);
    }),
  });

  // 2. Fetch Trending (Just fetch latest batches)
  const { data: trending = [] } = useQuery({
    queryKey: ["trending"],
    queryFn: () => api.get("/api/inventory/batches/").then((res) => {
      const items = res.data.results ?? res.data;
      if (!Array.isArray(items)) return [];
      return groupBatchesByProduct(items).slice(0, 6);
    }),
  });

  const recent = ["Tomato", "Spinach", "Milk"];
  const suggestions = q.trim() ? ["organic " + q, q + " 1 kg", "fresh " + q] : [];

  return (
    <PageShell>
      <div className="container max-w-3xl pt-4 pb-20">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Search "tomato", "milk", "spinach"...'
            className="h-12 w-full rounded-full bg-surface pl-11 pr-4 text-sm font-medium outline-none ring-mint/40 focus:ring-2"
          />
        </div>

        {!q.trim() ? (
          <>
            <section className="mt-6">
              <h3 className="mb-2 flex items-center gap-1.5 font-display text-sm font-bold"><Clock className="h-4 w-4 text-muted-foreground" /> Recent searches</h3>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <button key={r} onClick={() => setQ(r)} className="freshon-chip">{r}</button>
                ))}
              </div>
            </section>
            <section className="mt-6">
              <h3 className="mb-3 flex items-center gap-1.5 font-display text-sm font-bold"><TrendingUp className="h-4 w-4 text-harvest" /> Trending now</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {trending.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          </>
        ) : (
          <>
            {suggestions.length > 0 && (
              <ul className="mt-3 space-y-1">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button onClick={() => setQ(s)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-surface">
                      <SearchIcon className="h-3.5 w-3.5 text-muted-foreground" /> {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <section className="mt-5">
              <p className="mb-3 text-xs text-muted-foreground">{results.length} results for "{q}"</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {results.map((p) => <ProductCard key={p.id} product={p} />)}
                {results.length === 0 && (
                  <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
                    Nothing found. <Link to="/" className="text-forest underline">Browse all</Link>
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </PageShell>
  );
};

export default Search;
