// packages/freshon-api/src/modules/payment.ts
// Payment processing module — Razorpay init and verification.
// Maps to Django's apps/payment/ endpoints.

import { getClient } from "../client";
import type { RazorpayInitRequest, RazorpayInitResponse, RazorpayVerifyRequest } from "../types";

/**
 * Initialize a Razorpay order for payment.
 * POST /api/payment/razorpay-init/
 *
 * NOTE: Total is calculated server-side from items — do NOT send amounts.
 */
export async function initRazorpay(data: RazorpayInitRequest): Promise<RazorpayInitResponse> {
  const res = await getClient().post<RazorpayInitResponse>(
    "/api/payment/razorpay-init/",
    data
  );
  return res.data;
}

/**
 * Verify a completed Razorpay payment.
 * POST /api/payment/razorpay-verify/
 */
export async function verifyPayment(
  data: RazorpayVerifyRequest
): Promise<{ message: string; status: string }> {
  const res = await getClient().post<{ message: string; status: string }>(
    "/api/payment/razorpay-verify/",
    data
  );
  return res.data;
}
