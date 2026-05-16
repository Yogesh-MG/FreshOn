// packages/freshon-api/src/modules/wallet.ts
// Wallet, PRIDE Partnership, and Referral module.
// Maps to Django's apps/wallet/ endpoints.

import { getClient } from "../client";
import type {
  Wallet,
  WalletDetail,
  WalletTransaction,
  WalletTopup,
  TopupInitRequest,
  TopupInitResponse,
  TopupVerifyRequest,
  Partnership,
  Referral,
  ReferralCodeResponse,
  PaginatedResponse,
} from "../types";

// ─── Wallet ───────────────────────────────────────────────────────────

/**
 * Get current wallet balance.
 * GET /api/wallet/balance/
 */
export async function getBalance(): Promise<Wallet> {
  const res = await getClient().get<Wallet>("/api/wallet/balance/");
  return res.data;
}

/**
 * Get wallet details including recent transactions and partnership info.
 * GET /api/wallet/detail/
 */
export async function getWalletDetail(): Promise<WalletDetail> {
  const res = await getClient().get<WalletDetail>("/api/wallet/detail/");
  return res.data;
}

/**
 * Get transaction history with optional filters.
 * GET /api/wallet/history/
 */
export async function getTransactionHistory(params?: {
  reason?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<WalletTransaction>> {
  const res = await getClient().get<PaginatedResponse<WalletTransaction>>(
    "/api/wallet/history/",
    { params }
  );
  return res.data;
}

// ─── Top-up ───────────────────────────────────────────────────────────

/**
 * Initiate a wallet top-up via Razorpay.
 * POST /api/wallet/initiate_topup/
 */
export async function initiateTopup(data: TopupInitRequest): Promise<TopupInitResponse> {
  const res = await getClient().post<TopupInitResponse>(
    "/api/wallet/initiate_topup/",
    data
  );
  return res.data;
}

/**
 * Verify a completed top-up payment.
 * POST /api/wallet/verify_topup/
 */
export async function verifyTopup(data: TopupVerifyRequest): Promise<WalletTopup> {
  const res = await getClient().post<WalletTopup>("/api/wallet/verify_topup/", data);
  return res.data;
}

/**
 * Get top-up history.
 * GET /api/wallet/topup_history/
 */
export async function getTopupHistory(): Promise<WalletTopup[]> {
  const res = await getClient().get<WalletTopup[]>("/api/wallet/topup_history/");
  return res.data;
}

// ─── PRIDE Partnership ────────────────────────────────────────────────

/**
 * Get current user's PRIDE partnership details.
 * GET /api/partnerships/my_partnership/
 */
export async function getPartnership(): Promise<Partnership> {
  const res = await getClient().get<Partnership>("/api/wallet/partnerships/my_partnership/");
  return res.data;
}

/**
 * Request a partnership refund (100% refundable with 1-month notice).
 * POST /api/wallet/partnerships/request_refund/
 */
export async function requestRefund(): Promise<{ message: string }> {
  const res = await getClient().post<{ message: string }>(
    "/api/wallet/partnerships/request_refund/"
  );
  return res.data;
}

// ─── Referrals ────────────────────────────────────────────────────────

/**
 * Get current user's referral list with total bonus earned.
 * GET /api/wallet/referrals/my_referrals/
 */
export async function getMyReferrals(): Promise<Referral[]> {
  const res = await getClient().get<Referral[]>("/api/wallet/referrals/my_referrals/");
  return res.data;
}

/**
 * Get (or generate) the user's unique referral code and share link.
 * GET /api/wallet/referrals/referral_code/
 */
export async function getReferralCode(): Promise<ReferralCodeResponse> {
  const res = await getClient().get<ReferralCodeResponse>(
    "/api/wallet/referrals/referral_code/"
  );
  return res.data;
}
