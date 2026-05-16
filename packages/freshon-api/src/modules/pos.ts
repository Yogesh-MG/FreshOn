// packages/freshon-api/src/modules/pos.ts
// POS (Fpos) module — PIN login, shift management, orders, wastage.
// These endpoints map to the PLANNED apps/pos/ Django app.

import { getClient } from "../client";
import { setAuthTokens } from "../client";
import type {
  PosLoginRequest,
  PosProduct,
  PosOrderRequest,
  PosTransaction,
  PosShiftOpenRequest,
  PosShiftCloseRequest,
  PosShiftSummary,
  PosWastageEntry,
  PosCustomer,
  PosSettings,
  PosCompanyProfile,
} from "../types";

// ─── Auth ─────────────────────────────────────────────────────────────

/**
 * POS terminal login via employee ID + PIN.
 * POST /api/pos/login/
 */
export async function posLogin(
  data: PosLoginRequest
): Promise<{ message: string; access: string; refresh: string; employee_name: string }> {
  const res = await getClient().post("/api/pos/login/", data);

  if (res.data.access && res.data.refresh) {
    setAuthTokens(res.data.access, res.data.refresh);
  }

  return res.data;
}

// ─── Shift Management ─────────────────────────────────────────────────

/**
 * Open a new POS shift.
 * POST /api/pos/shift/open/
 */
export async function openShift(
  data: PosShiftOpenRequest
): Promise<{ message: string; shift_id: string }> {
  const res = await getClient().post("/api/pos/shift/open/", data);
  return res.data;
}

/**
 * Close the current POS shift.
 * POST /api/pos/shift/close/
 */
export async function closeShift(
  data: PosShiftCloseRequest
): Promise<PosShiftSummary> {
  const res = await getClient().post<PosShiftSummary>("/api/pos/shift/close/", data);
  return res.data;
}

/**
 * Get the current shift's summary (live stats).
 * GET /api/pos/shift/summary/
 */
export async function getShiftSummary(): Promise<PosShiftSummary> {
  const res = await getClient().get<PosShiftSummary>("/api/pos/shift/summary/");
  return res.data;
}

// ─── Settings ─────────────────────────────────────────────────────────

/**
 * Get POS terminal settings.
 * GET /api/pos/settings/
 */
export async function getPosSettings(): Promise<PosSettings> {
  const res = await getClient().get<PosSettings>("/api/pos/settings/");
  return res.data;
}

// ─── Product Catalog ──────────────────────────────────────────────────

/**
 * Get the POS product catalog (synced from inventory).
 * GET /api/pos/products/
 */
export async function getProducts(params?: {
  category?: string;
  search?: string;
}): Promise<PosProduct[]> {
  const res = await getClient().get<PosProduct[]>("/api/pos/products/", { params });
  return res.data;
}

// ─── Customer Lookup ──────────────────────────────────────────────────

/**
 * Look up a customer by phone number for POS loyalty/PRIDE integration.
 * GET /api/pos/customers/lookup/
 */
export async function lookupCustomer(phone: string): Promise<PosCustomer | null> {
  try {
    const res = await getClient().get<PosCustomer>("/api/pos/customers/lookup/", {
      params: { phone },
    });
    return res.data;
  } catch {
    return null;
  }
}

/**
 * Register a walk-in customer at the POS.
 * POST /api/pos/customers/
 */
export async function addCustomer(data: {
  name: string;
  phone: string;
  email?: string;
}): Promise<PosCustomer> {
  const res = await getClient().post<PosCustomer>("/api/pos/customers/", data);
  return res.data;
}

// ─── Company (B2B) ────────────────────────────────────────────────────

/**
 * List B2B companies.
 * GET /api/pos/companies/
 */
export async function listCompanies(): Promise<PosCompanyProfile[]> {
  const res = await getClient().get<PosCompanyProfile[]>("/api/pos/companies/");
  return res.data;
}

/**
 * Register a B2B company.
 * POST /api/pos/companies/create/
 */
export async function createCompany(data: {
  name: string;
  gstin: string;
  address?: string;
  pan?: string;
  email?: string;
}): Promise<PosCompanyProfile> {
  const res = await getClient().post<PosCompanyProfile>("/api/pos/companies/create/", data);
  return res.data;
}

// ─── Customer Transactions ────────────────────────────────────────────

/**
 * Search a customer's last transactions by phone for no-receipt returns.
 * GET /api/pos/orders/lookup/?phone=...
 */
export async function searchTransactionsByPhone(phone: string): Promise<PosTransaction[]> {
  const res = await getClient().get<PosTransaction[]>("/api/pos/orders/lookup/", {
    params: { phone },
  });
  return res.data;
}

// ─── Orders ───────────────────────────────────────────────────────────

/**
 * Create a walk-in POS order.
 * POST /api/pos/orders/
 */
export async function createOrder(data: PosOrderRequest): Promise<PosTransaction> {
  const res = await getClient().post<PosTransaction>("/api/pos/orders/", data);
  return res.data;
}

// ─── Wastage ──────────────────────────────────────────────────────────

/**
 * Log a wastage entry.
 * POST /api/pos/wastage/
 */
export async function logWastage(
  data: PosWastageEntry
): Promise<{ message: string; id: string }> {
  const res = await getClient().post<{ message: string; id: string }>(
    "/api/pos/wastage/",
    data
  );
  return res.data;
}

/**
 * Get wastage entries for the current shift.
 * GET /api/pos/wastage/
 */
export async function getWastage(): Promise<PosWastageEntry[]> {
  const res = await getClient().get<PosWastageEntry[]>("/api/pos/wastage/");
  return res.data;
}

// ─── Returns & Refunds ────────────────────────────────────────────────

/**
 * Look up a past transaction by receipt ID for return processing.
 * GET /api/pos/orders/lookup/?receipt_id=...
 */
export async function lookupTransaction(
  receiptId: string
): Promise<PosTransaction & { transaction_type: string }> {
  const res = await getClient().get<PosTransaction & { transaction_type: string }>(
    "/api/pos/orders/lookup/",
    { params: { receipt_id: receiptId } }
  );
  return res.data;
}

export interface PosRefundRequest {
  original_transaction_id: string;
  manager_pin: string;
  items: { pid: string; quantity: number }[];
  refund_method: "Cash" | "UPI" | "Card" | "Sodexo" | "Wallet";
}

export interface PosRefundResponse extends PosTransaction {
  transaction_type: "RETURN";
  original_transaction_id: string;
  authorized_by: string;
}

/**
 * Process a return/refund for a past transaction.
 * Requires manager PIN authorization.
 * POST /api/pos/orders/refund/
 */
export async function processRefund(
  data: PosRefundRequest
): Promise<PosRefundResponse> {
  const res = await getClient().post<PosRefundResponse>(
    "/api/pos/orders/refund/",
    data
  );
  return res.data;
}
