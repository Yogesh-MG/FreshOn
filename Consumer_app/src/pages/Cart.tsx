import { Link } from "react-router-dom";
import { useCart } from "@/store/cart";
import { PageShell } from "@/components/freshon/PageShell";
import { Plus, Minus, Trash2, ShoppingBag, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/freshon/ProductCard";
import { cn } from "@/lib/utils";

const Cart = () => {
  const items = Object.values(useCart((s) => s.items));
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());
  const delivery = subtotal > 0 && subtotal < 199 ? 25 : 0;
  const total = Number(subtotal) + Number(delivery);
  const clear = useCart((s) => s.clear);

  const suggestions: any[] = []; // Disabled dummy suggestions

  return (
    <PageShell hideTabBar>
      <div className="container pt-4 pb-32">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Your cart</h1>
            <p className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? "item" : "items"}</p>
          </div>
          {items.length > 0 && (
            <button onClick={clear} className="text-xs font-bold text-destructive hover:underline">Clear all</button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-surface p-12 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint-soft">
              <ShoppingBag className="h-7 w-7 text-forest" />
            </div>
            <h2 className="mt-4 font-display text-lg font-bold">Your cart is empty</h2>
            <p className="mt-1 text-sm text-muted-foreground">Add some fresh produce to get started.</p>
            <Link to="/" className="mt-5 inline-flex h-11 items-center rounded-full bg-mint px-6 text-sm font-semibold text-mint-foreground">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-6 md:grid-cols-[1fr,380px]">
            {/* Items */}
            <div className="space-y-3">
              {/* Free Delivery Progress */}
              <div className="freshon-card bg-gradient-to-br from-mint-soft to-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-forest">
                    {subtotal >= 199 ? "You've unlocked FREE delivery! 🎉" : `Add ₹${199 - subtotal} for FREE delivery`}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground">Goal: ₹199</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/50 border border-mint/10">
                  <div 
                    className="h-full bg-mint transition-all duration-500 ease-out" 
                    style={{ width: `${Math.min(100, (subtotal / 199) * 100)}%` }} 
                  />
                </div>
              </div>

              <div className="space-y-3">
                {items.map((item) => {
                  const p = item.product;
                  const qty = item.qty;
                  return (
                    <div key={p.id} className="freshon-card flex gap-4 p-4">
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-surface">
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col py-0.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-display text-sm font-bold leading-tight">{p.name}</h3>
                            <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{p.unit}</p>
                          </div>
                          <button onClick={() => remove(p.id)} className="text-muted-foreground/50 hover:text-destructive" aria-label="Remove">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="mt-auto flex items-center justify-between">
                          <div className="inline-flex h-9 items-center rounded-xl bg-mint text-mint-foreground shadow-sm">
                            <button onClick={() => setQty(p.id, qty - 1)} className="grid h-9 w-9 place-items-center opacity-80"><Minus className="h-3.5 w-3.5" /></button>
                            <span className="min-w-6 text-center text-xs font-extrabold">{qty}</span>
                            <button onClick={() => setQty(p.id, qty + 1)} className="grid h-9 w-9 place-items-center opacity-80"><Plus className="h-3.5 w-3.5" /></button>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-sm font-bold">₹{p.price * qty}</p>
                            {p.mrp && <p className="text-[10px] text-muted-foreground line-through">₹{p.mrp * qty}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Smart suggestions placeholder */}
              {suggestions.length > 0 && (
                <div className="mt-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-forest" />
                    <h3 className="font-display text-sm font-bold">You might also like</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {suggestions.map((p) => <ProductCard key={p.id} product={p} compact />)}
                  </div>
                </div>
              )}
            </div>

            {/* Summary / Digital Receipt */}
            <aside className="space-y-4 md:sticky md:top-24 md:self-start">
              <div className="freshon-card relative overflow-hidden p-6 before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,theme(colors.mint.soft)_4px,theme(colors.mint.soft)_8px)]">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-8 w-8 rounded-full bg-mint-soft flex items-center justify-center">
                    <ShoppingBag className="h-4 w-4 text-forest" />
                  </div>
                  <h3 className="font-display text-base font-bold uppercase tracking-wider">Order Summary</h3>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Item total</span>
                    <span className="font-medium text-foreground">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery fee</span>
                    <span className={cn("font-medium", delivery === 0 ? "text-mint" : "text-foreground")}>
                      {delivery === 0 ? "FREE" : `₹${delivery}`}
                    </span>
                  </div>
                  
                  {/* PRIDE Savings Teaser */}
                  <div className="rounded-xl bg-forest/5 border border-forest/10 p-3 mt-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 text-forest font-bold">
                        <Sparkles className="h-3 w-3" /> PRIDE Savings
                      </span>
                      <span className="font-bold text-forest">-₹{Math.round(subtotal * 0.3)}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Unlock with PRIDE Membership</p>
                  </div>

                  <div className="relative pt-4 pb-2">
                    <div className="absolute inset-x-0 top-2 h-px bg-dashed border-t border-dashed border-border" />
                    <div className="flex items-center justify-between pt-4">
                      <span className="font-display text-lg font-bold">Total Amount</span>
                      <span className="font-display text-lg font-bold text-forest">₹{total}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link to="/checkout" className="group flex h-14 w-full items-center justify-between rounded-full bg-forest px-6 text-sm font-bold text-forest-foreground shadow-lg transition active:scale-[0.98]">
                  <span>Proceed to Checkout</span>
                  <span className="flex items-center gap-1 opacity-80 group-hover:translate-x-1 transition-transform">₹{total} →</span>
                </Link>
                <p className="text-center text-[10px] text-muted-foreground">
                  By proceeding, you agree to our <span className="underline">Refund Policy</span>
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </PageShell>
  );
};

const Row = ({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) => (
  <div className="flex items-center justify-between">
    <dt className={bold ? "font-display text-base font-bold" : "text-muted-foreground"}>{label}</dt>
    <dd className={bold ? "font-display text-base font-bold" : highlight ? "font-semibold text-mint" : "font-medium"}>{value}</dd>
  </div>
);

export default Cart;
