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
  PosSettings,
  PosCompanyProfile,
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
  manualDiscountPercentage: number;
  manualDiscountAmount: number;
  discountReason: string;
  surcharge: number;
  roundingAdjustment: number;
  total: number;
  timestamp: number;
  receiptDelivery?: "Print" | "WhatsApp" | "SMS";
  bharatpeTxnId?: string;
  transactionType?: "SALE" | "RETURN";
  relatedTransactionId?: string;
  isAnonymous?: boolean;
  isB2b?: boolean;
  invoiceNumber?: string;
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

export const PRIDE_DISCOUNT_PCT = 0.30;

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
  posSettings: PosSettings | null;

  // Customer
  selectedCustomer: PosCustomer | null;
  customerSearchResults: PosCustomer[];
  customerSearching: boolean;
  isAnonymous: boolean;
  setAnonymous: (v: boolean) => void;

  // B2B
  isB2b: boolean;
  selectedCompany: PosCompanyProfile | null;
  companies: PosCompanyProfile[];
  setB2b: (v: boolean) => void;
  selectCompany: (c: PosCompanyProfile | null) => void;
  fetchCompanies: () => Promise<void>;
  createCompany: (data: { name: string; gstin: string; address?: string; pan?: string; email?: string }) => Promise<PosCompanyProfile | null>;

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

  // Manual Discount
  manualDiscountPercentage: number;
  manualDiscountAmount: number;
  discountReason: string;
  applyManualDiscount: (percent: number, reason: string) => void;
  clearManualDiscount: () => void;

  // Cash Rounding
  roundingEnabled: boolean;
  roundingAdjustment: number;
  setRoundingEnabled: (v: boolean) => void;

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

  // Settings
  fetchPosSettings: () => Promise<void>;

  // Customer
  searchCustomer: (phone: string) => Promise<void>;
  selectCustomer: (c: PosCustomer | null) => void;
  addCustomer: (data: {
    name: string;
    phone: string;
    email?: string;
    is_b2b?: boolean;
    company_name?: string;
    gstin?: string;
    pan?: string;
    address?: string;
  }) => Promise<PosCustomer | null>;
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
  posSettings: null,

  // Customer
  selectedCustomer: null,
  customerSearchResults: [],
  customerSearching: false,
  isAnonymous: false,
  setAnonymous: (v) => set({ isAnonymous: v }),

  // B2B
  isB2b: false,
  selectedCompany: null,
  companies: [],
  setB2b: (v) => set({ isB2b: v, selectedCompany: v ? get().selectedCompany : null }),
  selectCompany: (c) => set({ selectedCompany: c }),
  fetchCompanies: async () => {
    try {
      const companies = await pos.listCompanies();
      set({ companies });
    } catch (err: any) {
      console.error("[POS] Failed to fetch companies:", err);
    }
  },
  createCompany: async (data) => {
    set({ loading: true, error: null });
    try {
      const company = await pos.createCompany(data);
      set((s) => ({ companies: [...s.companies, company], loading: false }));
      return company;
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Failed to create company";
      set({ error: message, loading: false });
      return null;
    }
  },

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

  // Manual Discount
  manualDiscountPercentage: 0,
  manualDiscountAmount: 0,
  discountReason: "",
  applyManualDiscount: (percent, reason) => {
    const { cart, selectedCustomer } = get();
    const pride = !!selectedCustomer?.pride;
    const subtotal = +subtotalOf(cart, pride).toFixed(2);
    const amount = +(subtotal * (percent / 100)).toFixed(2);
    set({ manualDiscountPercentage: percent, manualDiscountAmount: amount, discountReason: reason });
  },
  clearManualDiscount: () => set({ manualDiscountPercentage: 0, manualDiscountAmount: 0, discountReason: "" }),

  // Cash Rounding
  roundingEnabled: false,
  roundingAdjustment: 0,
  setRoundingEnabled: (v) => set({ roundingEnabled: v, roundingAdjustment: 0 }),

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
      // Fetch settings after login
      get().fetchPosSettings();
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
      posSettings: null,
      isAnonymous: false,
      isB2b: false,
      selectedCompany: null,
      manualDiscountPercentage: 0,
      manualDiscountAmount: 0,
      discountReason: "",
      roundingEnabled: false,
      roundingAdjustment: 0,
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

      // Auto-fetch products and settings after opening shift
      get().fetchProducts();
      get().fetchPosSettings();
      get().fetchCompanies();
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
      posSettings: null,
      isAnonymous: false,
      isB2b: false,
      selectedCompany: null,
      manualDiscountPercentage: 0,
      manualDiscountAmount: 0,
      discountReason: "",
      roundingEnabled: false,
      roundingAdjustment: 0,
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

  // ── Settings ────────────────────────────────────────────────────────

  fetchPosSettings: async () => {
    try {
      const settings = await pos.getPosSettings();
      set({ posSettings: settings });
    } catch (err: any) {
      console.error("[POS] Failed to fetch settings:", err);
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
      const res = await pos.lookupCustomer(phone);
      if (res && res.is_b2b && res.company) {
        // Business detected
        set({
          customerSearchResults: [res],
          customerSearching: false,
        });
      } else {
        set({
          customerSearchResults: res ? [res] : [],
          customerSearching: false,
        });
      }
    } catch {
      set({ customerSearchResults: [], customerSearching: false });
    }
  },

  selectCustomer: (c) => {
    if (c && (c as any).is_b2b && (c as any).company) {
      set({
        selectedCustomer: c,
        isB2b: true,
        selectedCompany: (c as any).company,
        customerSearchResults: [],
        isAnonymous: false
      });
    } else {
      set({
        selectedCustomer: c,
        isB2b: false,
        selectedCompany: null,
        customerSearchResults: [],
        isAnonymous: false
      });
    }
  },

  addCustomer: async (data) => {
    set({ loading: true, error: null });
    try {
      const customer = await pos.addCustomer(data as any);
      if (customer && (customer as any).is_b2b && (customer as any).company) {
        set({
          selectedCustomer: customer,
          isB2b: true,
          selectedCompany: (customer as any).company,
          customerSearchResults: [],
          loading: false,
        });
      } else {
        set({
          selectedCustomer: customer,
          customerSearchResults: [],
          loading: false,
        });
      }
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
    const { cart, selectedCustomer, shift, isAnonymous, isB2b, selectedCompany, manualDiscountPercentage, manualDiscountAmount, discountReason, roundingEnabled, posSettings } = get();
    if (cart.length === 0 || tenders.length === 0) return null;
    if (!isAnonymous && !selectedCustomer) return null;

    const pride = !!selectedCustomer?.pride;
    const subtotal = +subtotalOf(cart, pride).toFixed(2);
    const gross = +grossSubtotalOf(cart).toFixed(2);
    const memberDiscount = +(gross - subtotal).toFixed(2);

    // Manual discount is applied after PRIDE discount
    const afterMemberDiscount = subtotal - manualDiscountAmount;

    const sodexoTender = tenders.find((t) => t.method === "Sodexo");
    const surchargeSimple = sodexoTender
      ? +(sodexoTender.amount * 0.05).toFixed(2)
      : 0;

    // Cash rounding
    let roundingAdjustment = 0;
    const totalBeforeRounding = +(afterMemberDiscount + surchargeSimple).toFixed(2);
    if (roundingEnabled && posSettings?.rounding_enabled) {
      const slab = posSettings.rounding_slab || 5;
      const roundedTotal = Math.ceil(totalBeforeRounding / slab) * slab;
      roundingAdjustment = +(roundedTotal - totalBeforeRounding).toFixed(2);
    }

    const total = +(totalBeforeRounding + roundingAdjustment).toFixed(2);

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
        gst_rate: i.gstRate ?? 18,
      }));

      const sdkTenders = tenders.map((t) => ({
        method: t.method,
        amount: t.amount,
      }));

      // Determine discount applied by (current user if any discount)
      const discountAppliedById = manualDiscountAmount > 0 ? get().user?.employeeId : undefined;

      // Submit to backend
      const backendTx = await pos.createOrder({
        customer_id: selectedCustomer ? String(selectedCustomer.id) : "",
        items: sdkItems,
        tenders: sdkTenders,
        subtotal,
        member_discount: memberDiscount,
        manual_discount_percentage: manualDiscountPercentage,
        manual_discount_amount: manualDiscountAmount,
        discount_reason: discountReason,
        discount_applied_by_id: discountAppliedById,
        surcharge: surchargeSimple,
        rounding_adjustment: roundingAdjustment,
        total,
        is_anonymous: isAnonymous,
        is_b2b: isB2b,
        company_id: selectedCompany ? String(selectedCompany.id) : undefined,
      });

      // Build local transaction from backend response
      const tx: Transaction = {
        id: backendTx.id,
        customerId: selectedCustomer ? String(selectedCustomer.id) : "",
        items: cart,
        tenders,
        method,
        subtotal,
        memberDiscount,
        manualDiscountPercentage,
        manualDiscountAmount,
        discountReason,
        surcharge: surchargeSimple,
        roundingAdjustment,
        total,
        timestamp: backendTx.timestamp || Date.now(),
        receiptDelivery: "Print",
        bharatpeTxnId,
        isAnonymous,
        isB2b,
        invoiceNumber: backendTx.invoice_number,
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
        // Reset discount/rounding/B2B for next transaction
        manualDiscountPercentage: 0,
        manualDiscountAmount: 0,
        discountReason: "",
        roundingEnabled: false,
        roundingAdjustment: 0,
        isAnonymous: false,
        isB2b: false,
        selectedCompany: null,
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
        manualDiscountPercentage: 0,
        manualDiscountAmount: 0,
        discountReason: "",
        surcharge: 0,
        roundingAdjustment: 0,
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
        manualDiscountPercentage: Number(tx.manual_discount_percentage ?? 0),
        manualDiscountAmount: Number(tx.manual_discount_amount ?? 0),
        discountReason: tx.discount_reason ?? "",
        surcharge: Number(tx.surcharge),
        roundingAdjustment: Number(tx.rounding_adjustment ?? 0),
        total: Number(tx.total),
        timestamp: tx.timestamp || Date.now(),
        receiptDelivery: tx.receipt_delivery,
        isAnonymous: tx.is_anonymous,
        isB2b: tx.is_b2b,
        invoiceNumber: tx.invoice_number,
      }));
    } catch {
      return [];
    }
  },
}));
