import { Link } from "react-router-dom";
import { Plus, Minus, Leaf, Sprout } from "lucide-react";
import type { Product } from "@/data/catalog";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useMe } from "@/hooks/use-me";
import { useUIStore } from "@/store/ui";
import { getCleanImageUrl } from "@/utils/image-utils";

export const ProductCard = ({ product, compact }: { product: Product; compact?: boolean }) => {
  const { data: user } = useMe();
  const openAuthModal = useUIStore((s) => s.openAuthModal);
  
  const items = useCart((s) => s.items);
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const variants = product.variants || [];
  const hasVariants = variants.length > 0;
  
  // Get active data (from variant or base product)
  const activeUnit = hasVariants ? variants[selectedVariantIdx].unit : product.unit;
  const activePrice = hasVariants ? variants[selectedVariantIdx].price : product.price;
  const activeMrp = hasVariants ? variants[selectedVariantIdx].mrp : product.mrp;
  const activeStock = hasVariants ? variants[selectedVariantIdx].stock : product.stock;
  
  // PRIDE Pricing Logic
  const pridePrice = Math.round(activePrice * 0.7);
  const isPrideMember = user?.partnership;
  
  // For the cart, we use a composite key if there are variants
  const cartKey = hasVariants ? `${product.id}-${variants[selectedVariantIdx].id}` : product.id;
  const qty = items[cartKey]?.qty ?? 0;
  const [pop, setPop] = useState(false);

  const handleAdd = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }

    // We create a temporary product object for the cart that represents this specific variant
    const cartItem = {
      ...product,
      id: cartKey,
      unit: activeUnit,
      price: activePrice,
      mrp: activeMrp,
    };
    add(cartItem);
    setPop(true);
    setTimeout(() => setPop(false), 320);
  };

  const discount = activeMrp ? Math.round(((activeMrp - activePrice) / activeMrp) * 100) : 0;

  return (
    <div className={cn("freshon-card group relative overflow-hidden p-2.5 hover:-translate-y-0.5", compact && "p-1.5")}>
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
          <img
            src={getCleanImageUrl(product.image)}
            alt={product.name}
            loading="lazy"
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {discount > 0 && (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-harvest px-1.5 py-0.5 text-[9px] font-bold text-harvest-foreground">
              {discount}% OFF
            </span>
          )}
          {activeStock <= 8 && (
            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-background/95 px-1.5 py-0.5 text-[9px] font-semibold text-earth">
              Only {activeStock} left
            </span>
          )}
          {/* PRIDE Savings Badge */}
          {!isPrideMember && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
              <div className="bg-gradient-to-r from-harvest to-orange-400 text-white text-[8px] font-bold py-0.5 px-2 rounded-l-full shadow-lg border-y border-l border-white/20 animate-pulse">
                PRIDE: ₹{pridePrice}
              </div>
            </div>
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1">
          {product.organic && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-mint-soft px-1.5 py-0.5 text-[9px] font-semibold text-forest">
              <Leaf className="h-2.5 w-2.5" /> Organic
            </span>
          )}
          {product.farmFresh && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-mint-soft px-1.5 py-0.5 text-[9px] font-semibold text-forest">
              <Sprout className="h-2.5 w-2.5" /> Farm Fresh
            </span>
          )}
        </div>

        <h3 className="mt-1 line-clamp-1 font-display text-[13px] font-semibold text-foreground leading-tight">{product.name}</h3>
        <p className="text-[11px] text-muted-foreground">{activeUnit} · {product.harvestDate}</p>
      </Link>

      {/* Variant Selector */}
      {hasVariants && (
        <div className="mt-2 flex gap-1 overflow-x-auto scrollbar-hidden">
          {variants.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setSelectedVariantIdx(i)}
              className={cn(
                "whitespace-nowrap rounded-lg px-2 py-1 text-[10px] font-bold transition-colors",
                selectedVariantIdx === i 
                  ? "bg-forest text-white" 
                  : "bg-surface text-muted-foreground hover:bg-mint-soft"
              )}
            >
              {v.unit}
            </button>
          ))}
        </div>
      )}

      <div className="mt-1.5 flex items-center justify-between gap-1">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className={cn("font-display text-[15px] font-bold text-foreground", isPrideMember && "text-forest")}>
              ₹{isPrideMember ? pridePrice : activePrice}
            </span>
            {!isPrideMember && (
              <span className="text-[10px] text-muted-foreground line-through">₹{activePrice}</span>
            )}
          </div>
          {!isPrideMember && (
            <span className="text-[9px] font-bold text-forest -mt-1 flex items-center gap-0.5">
              <Sprout className="h-2 w-2" /> ₹{pridePrice} with PRIDE
            </span>
          )}
        </div>

        {qty === 0 ? (
          <button
            onClick={handleAdd}
            className={cn(
              "inline-flex h-8 items-center gap-0.5 rounded-full bg-mint px-2.5 text-[11px] font-bold text-mint-foreground shadow-soft transition-all duration-200 hover:bg-mint/90 active:scale-95",
              pop && "animate-pop",
            )}
          >
            <Plus className="h-3 w-3" /> ADD
          </button>
        ) : (
          <div className="inline-flex h-8 items-center rounded-full bg-mint text-mint-foreground shadow-soft">
            <button onClick={() => setQty(cartKey, qty - 1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-mint/80" aria-label="Decrease">
              <Minus className="h-3 w-3" />
            </button>
            <span className="min-w-4 text-center text-[11px] font-bold">{qty}</span>
            <button onClick={() => setQty(cartKey, qty + 1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-mint/80" aria-label="Increase">
              <Plus className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
