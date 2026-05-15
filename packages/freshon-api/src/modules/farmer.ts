// packages/freshon-api/src/modules/farmer.ts
// Farmer (Farm_app) module — registration, profile, media, batches, dashboard.
// These endpoints map to the PLANNED apps/farmer/ Django app.

import { getClient } from "../client";
import type {
  FarmerProfileUpdate,
  FarmerBatch,
  FarmerAddBatchRequest,
  FarmerDashboardMetrics,
  FarmerPayout,
  FarmerRegistrationRequest,
  CurrentUser,
  FarmerBankDetails,
  FarmerNotification,
  FarmerOrder,
} from "../types";

// ─── Registration & Auth ──────────────────────────────────────────────

/**
 * Register or authenticate a farmer via phone + OTP.
 * POST /api/farmer/register/
 *
 * Step 1: Send { phone } to receive an OTP.
 * Step 2: Send { phone, otp } to verify and get tokens.
 */
export async function registerFarmer(
  data: FarmerRegistrationRequest
): Promise<{
  message: string;
  user?: CurrentUser;
  access?: string;
  refresh?: string;
}> {
  const res = await getClient().post("/api/farmer/register/", data);
  return res.data;
}

// ─── Profile ──────────────────────────────────────────────────────────

/**
 * Get the farmer's profile.
 * GET /api/farmer/profile/
 */
export async function getProfile(): Promise<FarmerProfileUpdate & { id: number }> {
  const res = await getClient().get("/api/farmer/profile/");
  return res.data;
}

/**
 * Update the farmer's profile.
 * PATCH /api/farmer/profile/
 */
export async function updateProfile(
  data: FarmerProfileUpdate
): Promise<FarmerProfileUpdate & { id: number }> {
  const res = await getClient().patch("/api/farmer/profile/", data);
  return res.data;
}

// ─── Media Upload ─────────────────────────────────────────────────────

/**
 * Upload farm/product video or profile photo.
 * POST /api/farmer/media/
 *
 * Uses FormData for file upload.
 */
export async function uploadMedia(
  type: "farm_video" | "product_video" | "profile_photo",
  file: File | Blob
): Promise<{ url: string; type: string }> {
  const formData = new FormData();
  formData.append("type", type);
  formData.append("file", file);

  const res = await getClient().post<{ url: string; type: string }>(
    "/api/farmer/media/",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
}

// ─── Dashboard ────────────────────────────────────────────────────────

/**
 * Get the farmer's aggregated dashboard metrics.
 * GET /api/farmer/dashboard/
 */
export async function getDashboard(): Promise<FarmerDashboardMetrics> {
  const res = await getClient().get<FarmerDashboardMetrics>("/api/farmer/dashboard/");
  return res.data;
}

// ─── Batches ──────────────────────────────────────────────────────────

/**
 * List the farmer's own inventory batches.
 * GET /api/farmer/batches/
 */
export async function listBatches(): Promise<FarmerBatch[]> {
  const res = await getClient().get<FarmerBatch[]>("/api/farmer/batches/");
  return res.data;
}

/**
 * Add a new harvest batch.
 * POST /api/farmer/batches/
 */
export async function addBatch(data: FarmerAddBatchRequest): Promise<FarmerBatch> {
  const res = await getClient().post<FarmerBatch>("/api/farmer/batches/", data);
  return res.data;
}

/**
 * Update an existing batch (e.g. update stock after harvest).
 * PATCH /api/farmer/batches/{id}/
 */
export async function updateBatch(
  id: string,
  data: Partial<FarmerAddBatchRequest>
): Promise<FarmerBatch> {
  const res = await getClient().patch<FarmerBatch>(`/api/farmer/batches/${id}/`, data);
  return res.data;
}

// ─── Payouts ──────────────────────────────────────────────────────────

/**
 * Get the farmer's payout history.
 * GET /api/farmer/payouts/
 */
export async function getPayouts(): Promise<FarmerPayout[]> {
  const res = await getClient().get<FarmerPayout[]>("/api/farmer/payouts/");
  return res.data;
}

// ─── Bank Details ─────────────────────────────────────────────────────

/**
 * Get the farmer's bank account details.
 * GET /api/farmer/bank/
 */
export async function getBankDetails(): Promise<FarmerBankDetails> {
  const res = await getClient().get<FarmerBankDetails>("/api/farmer/bank/");
  return res.data;
}

/**
 * Update the farmer's bank account details.
 * POST /api/farmer/bank/
 */
export async function updateBankDetails(
  data: Partial<FarmerBankDetails>
): Promise<FarmerBankDetails> {
  const res = await getClient().post<FarmerBankDetails>("/api/farmer/bank/", data);
  return res.data;
}

// ─── Notifications ───────────────────────────────────────────────────

/**
 * Get the farmer's notifications.
 * GET /api/farmer/notifications/
 */
export async function getNotifications(): Promise<FarmerNotification[]> {
  const res = await getClient().get<FarmerNotification[]>("/api/farmer/notifications/");
  return res.data;
}

/**
 * Mark a notification as read (or all if no ID provided).
 * POST /api/farmer/notifications/
 */
export async function markNotificationRead(id?: string): Promise<{ status: string }> {
  const res = await getClient().post<{ status: string }>("/api/farmer/notifications/", { id });
  return res.data;
}

// ─── Orders ───────────────────────────────────────────────────────────

/**
 * Get orders containing this farmer's products.
 * GET /api/farmer/orders/
 */
export async function getOrders(): Promise<FarmerOrder[]> {
  const res = await getClient().get<FarmerOrder[]>("/api/farmer/orders/");
  return res.data;
}
