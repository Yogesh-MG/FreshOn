/**
 * POS Zustand Store — Backend-Synchronized via @freshon/api SDK.
 *
 * All mutations (login, shift, order, wastage, customer) are async and
 * persist to the Django backend. Local state is kept in sync for
 * instantaneous UI updates with optimistic patterns where appropriate.
 */
import { create } from "zustand";
import { pos, clearAuthTokens, getAccessToken } from "@freshon/api";
import type {
  PosProduct,
  PosCustomer,
  PosTransaction,
  PosShiftSummary,
} from "@freshon/api";

// ─── Local-only UI Types ──────────────────────────────────────────────

export type Theme = "dark" | "light";
export type PaymentMethod = "Cash" | "UPI" | "Card" | "Sodexo" | "Wallet";
export type WastageReason = "Spoiled" | "Damaged" | "Expired";

export type Stage =
  | "login"
  | "shift-open"
  | "pos"
  | "payment"
  | "receipt"
  | "return"
  | "shift-close";

export type Mode = "sale" | "wastage";

export interface CartItem {
  pid: string;
  name: string;
  unitPrice: number;
  weighed: boolean;
  quantity: number;
  memberEligible?: boolean;
  gstRate?: number;
}

export interface Tender {
  method: PaymentMethod;
  amount: number;
}

export interface WastageEntry {
  pid: string;
  name: string;
  quantity: number;
  weighed: boolean;
  unitPrice: number;
  reason: WastageReason;
  timestamp: number;
}

export interface Shift {
  id: string;
  startedAt: number;
  openingCash: number;
  cashSales: number;
  totalSales: number;
  txnCount: number;
  refundTotal: number;
}

export interface HeldOrder {
  id: string;
  cart: CartItem[];
  customer: PosCustomer | null;
  timestamp: number;
}

export interface Transaction {
  id: string;
  customerId: string;
  items: CartItem[];
  tenders: Tender[];
  method: PaymentMethod | "Split";
  subtotal: number;
  memberDiscount: number;
  surcharge: number;
  total: number;
  timestamp: number;
  receiptDelivery?: "Print" | "WhatsApp" | "SMS";
  bharatpeTxnId?: string;
  transactionType?: "SALE" | "RETURN";
  relatedTransactionId?: string;
}

export interface ReturnItem {
  pid: string;
  name: string;
  unitPrice: number;
  weighed: boolean;
  originalQty: number;
  returnQty: number;
  selected: boolean;
}

export interface LookedUpTransaction {
  id: string;
  items: ReturnItem[];
  method: string;
  subtotal: number;
  total: number;
  timestamp: number;
  customerName?: string;
}

export const PRIDE_DISCOUNT_PCT = 0.10;

// ─── Derived Helpers ──────────────────────────────────────────────────

export const memberPriceOf = (
  p: { unitPrice: number; memberEligible?: boolean },
  pride: boolean
) =>
  pride && p.memberEligible
    ? +(p.unitPrice * (1 - PRIDE_DISCOUNT_PCT)).toFixed(2)
    : p.unitPrice;

// ─── GST Rate Inference (category-based fallback) ─────────────────────

const GST_EXEMPT_CATEGORIES = new Set([
  "Vegetables", "Fruits", "Flowers", "Microgreens",
]);

const GST_FIVE_CATEGORIES = new Set([
  "Dairy & Eggs", "Grains & Rice", "Pulses & Dals",
  "Flour & Atta", "Nuts & Seeds", "Oils & Ghee",
  "Kitchen Staples", "Breakfast", "Herbs & Seasoning",
]);

export const inferGstRate = (category?: string): number => {
  if (!category) return 18;
  if (GST_EXEMPT_CATEGORIES.has(category)) return 0;
  if (GST_FIVE_CATEGORIES.has(category)) return 5;
  return 18;
};

export const lineTotal = (i: CartItem, pride: boolean) =>
  memberPriceOf(i, pride) * i.quantity;

export const subtotalOf = (cart: CartItem[], pride = false) =>
  cart.reduce((s, i) => s + lineTotal(i, pride), 0);

export const grossSubtotalOf = (cart: CartItem[]) =>
  cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

export const surchargeOf = (subtotal: number, m: PaymentMethod) =>
  m === "Sodexo" ? +(subtotal * 0.05).toFixed(2) : 0;

export const formatINR = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Store Interface ──────────────────────────────────────────────────

interface PosState {
  // Theme
  theme: Theme;
  toggleTheme: () => void;

  // Auth & Session
  user: { employeeId: string; name: string } | null;
  stage: Stage;
  loading: boolean;
  error: string | null;
  clearError: () => void;

  // Mode
  mode: Mode;
  setMode: (m: Mode) => void;

  // Data (from backend)
  products: PosProduct[];
  productsLoading: boolean;

  // Customer
  selectedCustomer: PosCustomer | null;
  customerSearchResults: PosCustomer[];
  customerSearching: boolean;

  // Cart
  cart: CartItem[];

  // Wastage
  wastage: WastageEntry[];
  wastageDraft: { pid: string; name: string; quantity: number; weighed: boolean; unitPrice: number }[];

  // Held Orders
  heldOrders: HeldOrder[];

  // Transaction / Receipt
  lastTransaction: Transaction | null;
  scanFlash: number;

  // Shift
  shift: Shift | null;
  shiftSummary: PosShiftSummary | null;

  // Return / Refund
  lookedUpTx: LookedUpTransaction | null;
  returnLoading: boolean;
  returnError: string | null;
  lastRefund: Transaction | null;

  // Printer Config
  selectedPrinter: string | null;
  setPrinter: (name: string) => void;

  // ── Actions ──

  // Auth
  login: (employeeId: string, pin: string) => Promise<boolean>;
  logout: () => void;

  // Shift
  openShift: (openingCash: number) => Promise<void>;
  closeShift: () => void;
  submitCloseShift: (closingCash: number, notes?: string) => Promise<void>;
  finishCloseShift: () => void;

  // Products
  fetchProducts: (params?: { category?: string; search?: string }) => Promise<void>;

  // Customer
  searchCustomer: (phone: string) => Promise<void>;
  selectCustomer: (c: PosCustomer | null) => void;
  addCustomer: (data: { name: string; phone: string; email?: string }) => Promise<PosCustomer | null>;
  clearCustomerSearch: () => void;

  // Cart
  scan: (pid: string, weight?: number) => boolean;
  addProduct: (p: PosProduct, qty?: number) => void;
  setQty: (pid: string, qty: number) => void;
  removeItem: (pid: string) => void;
  clearCart: () => void;

  // Wastage
  addWastageDraft: (p: PosProduct, qty?: number) => void;
  setWastageQty: (pid: string, qty: number) => void;
  removeWastageDraft: (pid: string) => void;
  submitWastage: (reason: WastageReason) => Promise<void>;
  clearWastageDraft: () => void;

  // Payment & Order
  setStage: (s: Stage) => void;
  pay: (tenders: Tender[], bharatpeTxnId?: string) => Promise<Transaction | null>;
  setReceiptDelivery: (d: "Print" | "WhatsApp" | "SMS") => void;

  // Held Orders Actions
  holdCart: () => void;
  resumeHeldOrder: (id: string) => void;
  deleteHeldOrder: (id: string) => void;

  // Return / Refund Actions
  lookupTransaction: (receiptId: string) => Promise<boolean>;
  toggleReturnItem: (pid: string) => void;
  setReturnQty: (pid: string, qty: number) => void;
  processRefund: (managerPin: string, refundMethod: PaymentMethod) => Promise<boolean>;
  clearReturn: () => void;

  // Customer Transactions
  fetchCustomerTransactions: (phone: string) => Promise<Transaction[]>;
}

// ─── Store Implementation ─────────────────────────────────────────────

export const usePos = create<PosState>((set, get) => ({
  // Theme
  theme: "dark",
  toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

  // Auth
  user: null,
  stage: "login",
  loading: false,
  error: null,
  clearError: () => set({ error: null }),

  // Mode
  mode: "sale",
  setMode: (m) => set({ mode: m }),

  // Data
  products: [],
  productsLoading: false,

  // Customer
  selectedCustomer: null,
  customerSearchResults: [],
  customerSearching: false,

  // Cart
  cart: [],

  // Wastage
  wastage: [],
  wastageDraft: [],

  // Held Orders
  heldOrders: [],


  // Transaction
  lastTransaction: null,
  scanFlash: 0,

  // Shift
  shift: null,
  shiftSummary: null,

  // Return / Refund
  lookedUpTx: null,
  returnLoading: false,
  returnError: null,
  lastRefund: null,

  // ── Auth Actions ────────────────────────────────────────────────────

  login: async (employeeId, pin) => {
    set({ loading: true, error: null });
    try {
      const res = await pos.posLogin({ employee_id: employeeId, pin });
      // SDK's posLogin automatically stores tokens via setAuthTokens
      set({
        user: { employeeId, name: res.employee_name },
        stage: "shift-open",
        loading: false,
      });
      return true;
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || "Login failed";
      set({ error: message, loading: false });
      return false;
    }
  },

  logout: () => {
    clearAuthTokens();
    set({
      user: null,
      stage: "login",
      cart: [],
      selectedCustomer: null,
      customerSearchResults: [],
      lastTransaction: null,
      wastageDraft: [],
      mode: "sale",
      shift: null,
      shiftSummary: null,
      products: [],
      error: null,
    });
  },

  // ── Shift Actions ───────────────────────────────────────────────────

  openShift: async (openingCash) => {
    const { user } = get();
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const res = await pos.openShift({
        employee_id: user.employeeId,
        opening_cash: openingCash,
      });

      set({
        stage: "pos",
        shift: {
          id: res.shift_id,
          startedAt: Date.now(),
          openingCash,
          cashSales: 0,
          totalSales: 0,
          txnCount: 0,
          refundTotal: 0,
        },
        loading: false,
      });

      // Auto-fetch products after opening shift
      get().fetchProducts();
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || "Failed to open shift";
      set({ error: message, loading: false });
    }
  },

  closeShift: () => set({ stage: "shift-close" }),

  submitCloseShift: async (closingCash, notes) => {
    set({ loading: true, error: null });
    try {
      const summary = await pos.closeShift({
        closing_cash: closingCash,
        notes,
      });

      set({ shiftSummary: summary, loading: false });
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || "Failed to close shift";
      set({ error: message, loading: false });
    }
  },

  finishCloseShift: () => {
    clearAuthTokens();
    set({
      shift: null,
      shiftSummary: null,
      user: null,
      stage: "login",
      cart: [],
      wastageDraft: [],
      selectedCustomer: null,
      customerSearchResults: [],
      mode: "sale",
      products: [],
      error: null,
    });
  },

  // ── Product Catalog ─────────────────────────────────────────────────

  fetchProducts: async (params) => {
    set({ productsLoading: true });
    try {
      const products = await pos.getProducts(params);
      set({ products, productsLoading: false });
    } catch (err: any) {
      console.error("[POS] Failed to fetch products:", err);
      set({ productsLoading: false });
    }
  },

  // ── Customer Actions ────────────────────────────────────────────────

  searchCustomer: async (phone) => {
    if (phone.length < 3) {
      set({ customerSearchResults: [] });
      return;
    }

    set({ customerSearching: true });
    try {
      const customer = await pos.lookupCustomer(phone);
      set({
        customerSearchResults: customer ? [customer] : [],
        customerSearching: false,
      });
    } catch {
      set({ customerSearchResults: [], customerSearching: false });
    }
  },

  selectCustomer: (c) => set({ selectedCustomer: c, customerSearchResults: [] }),

  addCustomer: async (data) => {
    set({ loading: true, error: null });
    try {
      const customer = await pos.addCustomer(data);
      set({
        selectedCustomer: customer,
        customerSearchResults: [],
        loading: false,
      });
      return customer;
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || "Failed to add customer";
      set({ error: message, loading: false });
      return null;
    }
  },

  clearCustomerSearch: () => set({ customerSearchResults: [] }),

  // ── Cart Actions ────────────────────────────────────────────────────

  scan: (pid, weight) => {
    const p = get().products.find((x) => x.pid === pid);
    if (!p) return false;
    const qty = p.weighed ? weight ?? 1 : 1;
    if (get().mode === "wastage") get().addWastageDraft(p, qty);
    else get().addProduct(p, qty);
    set({ scanFlash: Date.now() });
    return true;
  },

  addProduct: (p, qty = 1) => {
    set((s) => {
      const existing = s.cart.find((i) => i.pid === p.pid);
      if (existing) {
        return {
          cart: s.cart.map((i) =>
            i.pid === p.pid
              ? { ...i, quantity: +(i.quantity + qty).toFixed(3) }
              : i
          ),
        };
      }
      return {
        cart: [
          ...s.cart,
          {
            pid: p.pid,
            name: p.name,
            unitPrice: p.price,
            weighed: p.weighed,
            quantity: qty,
            memberEligible: p.member_eligible,
            gstRate: inferGstRate(p.category),
          },
        ],
      };
    });
  },

  setQty: (pid, qty) =>
    set((s) => ({
      cart: s.cart.map((i) =>
        i.pid === pid ? { ...i, quantity: Math.max(0.01, qty) } : i
      ),
    })),

  removeItem: (pid) =>
    set((s) => ({ cart: s.cart.filter((i) => i.pid !== pid) })),

  clearCart: () => set({ cart: [] }),

  // ── Wastage Actions ─────────────────────────────────────────────────

  addWastageDraft: (p, qty = 1) => {
    set((s) => {
      const existing = s.wastageDraft.find((i) => i.pid === p.pid);
      if (existing) {
        return {
          wastageDraft: s.wastageDraft.map((i) =>
            i.pid === p.pid
              ? { ...i, quantity: +(i.quantity + qty).toFixed(3) }
              : i
          ),
        };
      }
      return {
        wastageDraft: [
          ...s.wastageDraft,
          {
            pid: p.pid,
            name: p.name,
            quantity: qty,
            weighed: p.weighed,
            unitPrice: p.price,
          },
        ],
      };
    });
  },

  setWastageQty: (pid, qty) =>
    set((s) => ({
      wastageDraft: s.wastageDraft.map((i) =>
        i.pid === pid ? { ...i, quantity: Math.max(0.01, qty) } : i
      ),
    })),

  removeWastageDraft: (pid) =>
    set((s) => ({
      wastageDraft: s.wastageDraft.filter((i) => i.pid !== pid),
    })),

  clearWastageDraft: () => set({ wastageDraft: [] }),

  submitWastage: async (reason) => {
    const draft = get().wastageDraft;
    if (draft.length === 0) return;

    set({ loading: true, error: null });

    try {
      // Submit each wastage entry to backend
      for (const d of draft) {
        await pos.logWastage({
          pid: d.pid,
          name: d.name,
          quantity: d.quantity,
          weighed: d.weighed,
          unit_price: d.unitPrice,
          reason,
        });
      }

      const ts = Date.now();
      const entries: WastageEntry[] = draft.map((d) => ({
        ...d,
        reason,
        timestamp: ts,
      }));

      set((s) => ({
        wastage: [...entries, ...s.wastage],
        products: s.products.map((p) => {
          const e = entries.find((x) => x.pid === p.pid);
          return e
            ? { ...p, stock: Math.max(0, +(p.stock - e.quantity).toFixed(3)) }
            : p;
        }),
        wastageDraft: [],
        mode: "sale" as const,
        loading: false,
      }));
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || "Failed to log wastage";
      set({ error: message, loading: false });
    }
  },

  // ── Stage & Payment ─────────────────────────────────────────────────

  setStage: (s) => set({ stage: s }),

  pay: async (tenders, bharatpeTxnId) => {
    const { cart, selectedCustomer, shift } = get();
    if (!selectedCustomer || cart.length === 0 || tenders.length === 0)
      return null;

    const pride = !!selectedCustomer.pride;
    const subtotal = +subtotalOf(cart, pride).toFixed(2);
    const gross = +grossSubtotalOf(cart).toFixed(2);
    const memberDiscount = +(gross - subtotal).toFixed(2);

    const sodexoTender = tenders.find((t) => t.method === "Sodexo");
    const surchargeSimple = sodexoTender
      ? +(sodexoTender.amount * 0.05).toFixed(2)
      : 0;
    const total = +(subtotal + surchargeSimple).toFixed(2);
    const cashAmt = tenders
      .filter((t) => t.method === "Cash")
      .reduce((s, t) => s + t.amount, 0);
    const isSplit = tenders.length > 1;
    const method = isSplit ? ("Split" as const) : tenders[0].method;
    const walletAmt = tenders
      .filter((t) => t.method === "Wallet")
      .reduce((s, t) => s + t.amount, 0);
    set({ loading: true, error: null });

    try {
      // Map cart items to SDK format (snake_case)
      const sdkItems = cart.map((i) => ({
        pid: i.pid,
        name: i.name,
        unit_price: memberPriceOf(i, pride),
        weighed: i.weighed,
        quantity: i.quantity,
        member_eligible: i.memberEligible,
      }));

      const sdkTenders = tenders.map((t) => ({
        method: t.method,
        amount: t.amount,
      }));

      // Submit to backend
      const backendTx = await pos.createOrder({
        customer_id: String(selectedCustomer.id),
        items: sdkItems,
        tenders: sdkTenders,
        subtotal,
        member_discount: memberDiscount,
        surcharge: surchargeSimple,
        total,
      });

      // Build local transaction from backend response
      const tx: Transaction = {
        id: backendTx.id,
        customerId: String(selectedCustomer.id),
        items: cart,
        tenders,
        method,
        subtotal,
        memberDiscount,
        surcharge: surchargeSimple,
        total,
        timestamp: backendTx.timestamp || Date.now(),
        receiptDelivery: "Print",
        bharatpeTxnId,
      };

      set((s) => ({
        lastTransaction: tx,
        stage: "receipt" as const,
        loading: false,
        selectedCustomer:
          s.selectedCustomer && walletAmt > 0
            ? {
                ...s.selectedCustomer,
                wallet_balance: +((s.selectedCustomer.wallet_balance ?? 0) - walletAmt).toFixed(2),
              }
            : s.selectedCustomer,
        shift: s.shift
          ? {
              ...s.shift,
              cashSales: +(s.shift.cashSales + cashAmt).toFixed(2),
              totalSales: +(s.shift.totalSales + total).toFixed(2),
              txnCount: s.shift.txnCount + 1,
            }
          : s.shift,
        products: s.products.map((p) => {
          const ci = cart.find((c) => c.pid === p.pid);
          return ci
            ? { ...p, stock: Math.max(0, +(p.stock - ci.quantity).toFixed(3)) }
            : p;
        }),
      }));

      return tx;
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || "Order submission failed";
      set({ error: message, loading: false });
      return null;
    }
  },
  setReceiptDelivery: (d) =>
    set((s) => ({
      lastTransaction: s.lastTransaction
        ? { ...s.lastTransaction, receiptDelivery: d }
        : null,
    })),

  // ── Held Orders Actions ─────────────────────────────────────────────

  holdCart: () => {
    const { cart, selectedCustomer, heldOrders } = get();
    if (cart.length === 0) return;

    const newHeldOrder: HeldOrder = {
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      cart: [...cart],
      customer: selectedCustomer,
      timestamp: Date.now(),
    };

    set({
      heldOrders: [newHeldOrder, ...heldOrders],
      cart: [],
      selectedCustomer: null,
    });
  },

  resumeHeldOrder: (id) => {
    const { heldOrders, cart } = get();
    const order = heldOrders.find((o) => o.id === id);
    if (!order) return;

    // If current cart is not empty, we might want to hold it first? 
    // For now, we just swap.
    set({
      cart: order.cart,
      selectedCustomer: order.customer,
      heldOrders: heldOrders.filter((o) => o.id !== id),
    });
  },

  deleteHeldOrder: (id) => {
    set((s) => ({
      heldOrders: s.heldOrders.filter((o) => o.id !== id),
    }));
  },

  // ── Return / Refund Actions ──────────────────────────────────────────

  lookupTransaction: async (receiptId) => {
    set({ returnLoading: true, returnError: null, lookedUpTx: null });
    try {
      const tx = await pos.lookupTransaction(receiptId);

      const items: ReturnItem[] = (tx.items || []).map((i: any) => ({
        pid: i.pid,
        name: i.name,
        unitPrice: Number(i.unit_price),
        weighed: i.weighed,
        originalQty: Number(i.quantity),
        returnQty: Number(i.quantity),
        selected: true,
      }));

      set({
        lookedUpTx: {
          id: tx.id,
          items,
          method: tx.method,
          subtotal: Number(tx.subtotal),
          total: Number(tx.total),
          timestamp: tx.timestamp || Date.now(),
          customerName: tx.customer_name,
        },
        returnLoading: false,
        stage: "return",
      });
      return true;
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || "Transaction not found";
      set({ returnError: message, returnLoading: false });
      return false;
    }
  },

  toggleReturnItem: (pid) => {
    set((s) => ({
      lookedUpTx: s.lookedUpTx
        ? {
            ...s.lookedUpTx,
            items: s.lookedUpTx.items.map((i) =>
              i.pid === pid ? { ...i, selected: !i.selected } : i
            ),
          }
        : null,
    }));
  },

  setReturnQty: (pid, qty) => {
    set((s) => ({
      lookedUpTx: s.lookedUpTx
        ? {
            ...s.lookedUpTx,
            items: s.lookedUpTx.items.map((i) =>
              i.pid === pid
                ? { ...i, returnQty: Math.min(Math.max(0.01, qty), i.originalQty) }
                : i
            ),
          }
        : null,
    }));
  },

  processRefund: async (managerPin, refundMethod) => {
    const { lookedUpTx, shift } = get();
    if (!lookedUpTx) return false;

    const selectedItems = lookedUpTx.items.filter((i) => i.selected);
    if (selectedItems.length === 0) return false;

    set({ returnLoading: true, returnError: null });

    try {
      const result = await pos.processRefund({
        original_transaction_id: lookedUpTx.id,
        manager_pin: managerPin,
        items: selectedItems.map((i) => ({
          pid: i.pid,
          quantity: i.returnQty,
        })),
        refund_method: refundMethod,
      });

      const refundTotal = Math.abs(Number(result.total));

      const refundTx: Transaction = {
        id: result.id,
        customerId: "",
        items: selectedItems.map((i) => ({
          pid: i.pid,
          name: i.name,
          unitPrice: i.unitPrice,
          weighed: i.weighed,
          quantity: i.returnQty,
        })),
        tenders: [{ method: refundMethod, amount: refundTotal }],
        method: refundMethod,
        subtotal: -refundTotal,
        memberDiscount: 0,
        surcharge: 0,
        total: -refundTotal,
        timestamp: Date.now(),
        transactionType: "RETURN",
        relatedTransactionId: lookedUpTx.id,
      };

      set((s) => ({
        lastRefund: refundTx,
        lastTransaction: refundTx,
        stage: "receipt" as const,
        returnLoading: false,
        lookedUpTx: null,
        selectedCustomer:
          s.selectedCustomer && refundMethod === "Wallet"
            ? {
                ...s.selectedCustomer,
                wallet_balance: +((s.selectedCustomer.wallet_balance ?? 0) + refundTotal).toFixed(2),
              }
            : s.selectedCustomer,
        shift: s.shift
          ? {
              ...s.shift,
              refundTotal: +(s.shift.refundTotal + refundTotal).toFixed(2),
              totalSales: +(s.shift.totalSales - refundTotal).toFixed(2),
              cashSales:
                refundMethod === "Cash"
                  ? +(s.shift.cashSales - refundTotal).toFixed(2)
                  : s.shift.cashSales,
              txnCount: s.shift.txnCount + 1,
            }
          : s.shift,
        // Restock products locally
        products: s.products.map((p) => {
          const ri = selectedItems.find((x) => x.pid === p.pid);
          return ri
            ? { ...p, stock: +(p.stock + ri.returnQty).toFixed(3) }
            : p;
        }),
      }));

      return true;
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || "Refund failed";
      set({ returnError: message, returnLoading: false });
      return false;
    }
  },

  clearReturn: () => set({
    lookedUpTx: null,
    returnError: null,
    returnLoading: false,
    lastRefund: null,
    stage: "pos" as const,
  }),

  // ── Customer Transactions ─────────────────────────────────────────────

  // Printer Config
  selectedPrinter: "PRINTER POS-80",
  setPrinter: (name) => set({ selectedPrinter: name }),

  fetchCustomerTransactions: async (phone) => {
    try {
      const txs = await pos.searchTransactionsByPhone(phone);
      return txs.map((tx) => ({
        id: tx.id,
        customerId: String(tx.customer_id ?? ""),
        items: (tx.items || []).map((i: any) => ({
          pid: i.pid,
          name: i.name,
          unitPrice: Number(i.unit_price),
          weighed: i.weighed,
          quantity: i.quantity,
          memberEligible: i.member_eligible,
        })),
        tenders: (tx.tenders || []).map((t: any) => ({
          method: t.method as PaymentMethod,
          amount: t.amount,
        })),
        method: (tx.method === "Split" ? "Split" : tx.method) as PaymentMethod | "Split",
        subtotal: Number(tx.subtotal),
        memberDiscount: Number(tx.member_discount),
        surcharge: Number(tx.surcharge),
        total: Number(tx.total),
        timestamp: tx.timestamp || Date.now(),
        receiptDelivery: tx.receipt_delivery,
      }));
    } catch {
      return [];
    }
  },
}));
