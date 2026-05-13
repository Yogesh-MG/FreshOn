import { Link, useParams } from "react-router-dom";
import { PageShell } from "@/components/freshon/PageShell";
import { StickyCartBar } from "@/components/freshon/StickyCartBar";
import { ProductCard } from "@/components/freshon/ProductCard";
import { useCart } from "@/store/cart";
import { ChevronLeft, Leaf, Plus, Minus, MapPin, Calendar, Star, Sprout } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";

import { useMe } from "@/hooks/use-me";
import { useUIStore } from "@/store/ui";
import { groupBatchesByProduct } from "@/utils/product-utils";
import { normalizeImageUrl } from "@/utils/image-utils";
import { useState, useEffect } from "react";

const Product = () => {
  const { data: user } = useMe();
  const openAuthModal = useUIStore((s) => s.openAuthModal);
  
  const { id } = useParams();
  const items = useCart((s) => s.items);
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);

  const handleAddToCart = (p: any) => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    add(p);
  };

  // 1. Fetch ALL batches for this product
  // First we need to know the product_id of the current batch
  const { data: initialBatch } = useQuery({
    queryKey: ["batch-raw", id],
    queryFn: () => api.get(`/api/inventory/batches/${id}/`).then((res) => res.data),
  });

  const { data: variants = [], isLoading } = useQuery({
    queryKey: ["product-variants", initialBatch?.product_id],
    enabled: !!initialBatch?.product_id,
    queryFn: () => api.get(`/api/inventory/batches/?product_id=${initialBatch.product_id}`).then((res) => {
      const items = res.data.results ?? res.data;
      return items.map((b: any) => ({
        id: b.id,
        unit: b.variant.unit,
        price: parseFloat(b.price),
        mrp: b.mrp ? parseFloat(b.mrp) : undefined,
        stock: b.stock_level,
        harvestDate: b.harvest_date_display,
        image: normalizeImageUrl(b.batch_image || b.base_image),
        organic: b.is_organic,
        farmFresh: b.is_farm_fresh,
        description: b.description,
        farmer: b.farmer,
        benefits: b.benefits || [],
        storage: b.storage_instructions,
        category: b.category_name,
      }));
    }),
  });

  const [selectedIdx, setSelectedIdx] = useState(0);
  
  // Update selection if the initial ID matches a specific variant
  useEffect(() => {
    if (variants.length > 0 && initialBatch) {
      const idx = variants.findIndex((v: any) => v.id === initialBatch.id);
      if (idx !== -1) setSelectedIdx(idx);
    }
  }, [variants, initialBatch]);

  const product = variants[selectedIdx];

  // 2. Fetch Related (Grouped by product)
  const { data: related = [] } = useQuery({
    queryKey: ["related", product?.category],
    enabled: !!product,
    queryFn: () => api.get(`/api/inventory/batches/?category_name=${product?.category}`).then((res) => {
      const items = res.data.results ?? res.data;
      const grouped = groupBatchesByProduct(items);
      return grouped.filter((p: any) => p.id !== initialBatch?.product_id).slice(0, 4);
    }),
  });

  if (isLoading) return <PageShell><div className="p-20 text-center">Loading...</div></PageShell>;
  if (!product) return <PageShell><div className="p-20 text-center">Not found.</div></PageShell>;

  const farmer = product.farmer;
  const qty = items[product.id]?.qty ?? 0;

  return (
    <PageShell>
      <div className="container pt-4">
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-forest">
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>

        <div className="mt-3 grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-surface">
            <img src={normalizeImageUrl(product.image)} alt={product.name} width={800} height={800} className="aspect-square w-full object-cover" />
          </div>

          <div>
            <div className="flex flex-wrap gap-1.5">
              {product.organic && (
                <span className="inline-flex items-center gap-1 rounded-full bg-mint-soft px-2 py-1 text-xs font-semibold text-forest">
                  <Leaf className="h-3 w-3" /> Certified Organic
                </span>
              )}
              {product.farmFresh && <span className="freshon-chip bg-mint-soft text-forest">Farm Fresh</span>}
            </div>

            <h1 className="mt-2 font-display text-3xl font-bold">{initialBatch?.product_name}</h1>
            
            {/* Variant Selector */}
            <div className="mt-4 flex flex-wrap gap-2">
              {variants.map((v: any, i: number) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedIdx(i)}
                  className={cn(
                    "rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all",
                    selectedIdx === i 
                      ? "border-forest bg-mint-soft text-forest" 
                      : "border-transparent bg-surface text-muted-foreground hover:bg-surface/80"
                  )}
                >
                  {v.unit}
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className={cn("font-display text-3xl font-bold", isPrideMember && "text-forest")}>
                  ₹{isPrideMember ? Math.round(product.price * 0.7) : product.price}
                </span>
                {product.mrp && <span className="text-sm text-muted-foreground line-through">₹{product.mrp}</span>}
              </div>
              {!isPrideMember && (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-bold text-forest flex items-center gap-1">
                    <Sprout className="h-4 w-4" /> ₹{Math.round(product.price * 0.7)} with PRIDE
                  </span>
                  <span className="text-xs font-bold text-harvest bg-harvest/10 px-2 py-0.5 rounded-full">Save 30%</span>
                </div>
              )}
            </div>

            {/* Trust info */}
            <div className="mt-5 grid gap-3 rounded-2xl bg-mint-soft p-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-forest" />
                <span>Harvested <b>{product.harvestDate}</b></span>
              </div>
              {farmer && (
                <Link to={`/farmer/${farmer.id}`} className="flex items-center gap-3 rounded-xl bg-background p-2.5">
                  <img src={normalizeImageUrl(farmer.image)} alt={farmer.name} className="h-10 w-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Grown by</p>
                    <p className="font-semibold leading-tight">{farmer.name}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {farmer.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-mint-soft px-2 py-1 text-xs font-bold text-forest">
                    <Star className="h-3 w-3 fill-harvest text-harvest" /> {farmer.rating}
                  </div>
                </Link>
              )}
              {product.stock <= 8 && <p className="text-xs font-semibold text-earth">⚡ Only {product.stock} left in stock</p>}
            </div>

            {/* Add to cart */}
            <div className="mt-6 flex items-center gap-3">
              {qty === 0 ? (
                <button onClick={() => handleAddToCart(product)} className="h-12 flex-1 rounded-full bg-mint text-sm font-semibold text-mint-foreground shadow-soft transition hover:bg-mint/90 active:scale-[0.98]">
                  Add to cart · ₹{isPrideMember ? Math.round(product.price * 0.7) : product.price}
                </button>
              ) : (
                <div className="flex h-12 flex-1 items-center justify-between rounded-full bg-mint text-mint-foreground shadow-soft">
                  <button onClick={() => setQty(product.id, qty - 1)} className="grid h-12 w-12 place-items-center"><Minus className="h-4 w-4" /></button>
                  <span className="font-display text-lg font-bold">{qty} in cart</span>
                  <button onClick={() => setQty(product.id, qty + 1)} className="grid h-12 w-12 place-items-center"><Plus className="h-4 w-4" /></button>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mt-8 space-y-5">
              <div>
                <h3 className="font-display text-base font-bold">About this product</h3>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">{product.description}</p>
              </div>
              <div>
                <h3 className="font-display text-base font-bold">Benefits</h3>
                <ul className="mt-2 grid gap-1.5">
                  {product.benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-mint-soft text-forest">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-display text-base font-bold">Storage</h3>
                <p className="mt-1 text-sm text-foreground/80">{product.storage}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        <section className="mt-12 mb-8">
          <h2 className="mb-3 font-display text-lg font-bold">You may also like</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </div>
      <StickyCartBar />
    </PageShell>
  );
};

export default Product;
