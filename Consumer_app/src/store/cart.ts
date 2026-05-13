import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cn } from "@/lib/utils";

export type Product = {
  id: string;
  batchId: number;
  name: string;
  price: number;
  image: string;
  unit: string;
  mrp?: number;
  organic?: boolean;
};

type CartItem = { product: Product; qty: number };

type CartState = {
  items: Record<string, CartItem>;
  add: (p: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},
      add: (p) =>
        set((s) => {
          const cur = s.items[p.id];
          return { items: { ...s.items, [p.id]: { product: p, qty: (cur?.qty ?? 0) + 1 } } };
        }),
      remove: (id) =>
        set((s) => {
          const next = { ...s.items };
          delete next[id];
          return { items: next };
        }),
      setQty: (id, qty) =>
        set((s) => {
          if (qty <= 0) {
            const next = { ...s.items };
            delete next[id];
            return { items: next };
          }
          const cur = s.items[id];
          if (!cur) return s;
          return { items: { ...s.items, [id]: { ...cur, qty } } };
        }),
      clear: () => set({ items: {} }),
      count: () => Object.values(get().items).reduce((a, i) => a + i.qty, 0),
      subtotal: () => Object.values(get().items).reduce((a, i) => a + i.qty * i.product.price, 0),
    }),
    { name: "freshon-cart" },
  ),
);
