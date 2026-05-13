import { Link } from "react-router-dom";
import { useCart } from "@/store/cart";
import { PageShell } from "@/components/freshon/PageShell";
import { Plus, Minus, Trash2, ShoppingBag, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/freshon/ProductCard";

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
          <div className="mt-5 grid gap-6 md:grid-cols-[1fr,360px]">
            {/* Items */}
            <div className="space-y-3">
              {items.map(({ product, qty }) => (
                <div key={product.id} className="freshon-card flex gap-3 p-3">
                  <img src={product.image} alt={product.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-sm font-semibold">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">{product.unit}</p>
                      </div>
                      <button onClick={() => remove(product.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-end justify-between">
                      <div className="inline-flex h-8 items-center gap-1 rounded-full bg-mint text-mint-foreground">
                        <button onClick={() => setQty(product.id, qty - 1)} className="grid h-8 w-8 place-items-center"><Minus className="h-3 w-3" /></button>
                        <span className="min-w-5 text-center text-xs font-bold">{qty}</span>
                        <button onClick={() => setQty(product.id, qty + 1)} className="grid h-8 w-8 place-items-center"><Plus className="h-3 w-3" /></button>
                      </div>
                      <span className="font-display text-sm font-bold">₹{product.price * qty}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Smart suggestions */}
              {suggestions.length > 0 && (
                <div className="rounded-2xl bg-mint-soft p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-forest" />
                    <h3 className="font-display text-sm font-bold text-forest">Frequently bought together</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {suggestions.map((p) => <ProductCard key={p.id} product={p} compact />)}
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <aside className="space-y-3 md:sticky md:top-24 md:self-start">
              <div className="freshon-card p-5">
                <h3 className="font-display text-base font-bold">Bill details</h3>
                <dl className="mt-4 space-y-2 text-sm">
                  <Row label="Subtotal" value={`₹${subtotal}`} />
                  <Row label="Delivery" value={delivery === 0 ? "FREE" : `₹${delivery}`} highlight={delivery === 0} />
                  {subtotal < 199 && subtotal > 0 && (
                    <p className="rounded-lg bg-mint-soft p-2 text-xs text-forest">Add ₹{199 - subtotal} more for free delivery</p>
                  )}
                  <div className="border-t border-border pt-3">
                    <Row label="Total" value={`₹${total}`} bold />
                  </div>
                </dl>
              </div>
              <Link to="/checkout" className="hidden h-14 w-full items-center justify-between rounded-full bg-earth px-6 text-sm font-semibold text-earth-foreground shadow-cta transition hover:bg-earth/90 md:inline-flex">
                Proceed to checkout
                <span>₹{total} →</span>
              </Link>
            </aside>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background p-3 shadow-cta md:hidden">
          <Link to="/checkout" className="flex h-14 items-center justify-between rounded-full bg-earth px-5 text-sm font-semibold text-earth-foreground">
            <span>Checkout · ₹{total}</span>
            <span>→</span>
          </Link>
        </div>
      )}
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
