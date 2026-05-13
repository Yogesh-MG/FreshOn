// packages/freshon-api/src/modules/delivery-partner.ts
// Delivery Partner (Del_app) module — assignments, status, proof of delivery.
// These endpoints map to the PLANNED apps/delivery_partner/ Django app.

import { getClient } from "../client";
import type {
  DeliveryMission,
  DeliveryPartnerStats,
  DeliveryPartnerStatusRequest,
  ProofOfDeliveryRequest,
} from "../types";

// ─── Status ───────────────────────────────────────────────────────────

/**
 * Update the partner's online/offline status + current GPS.
 * PATCH /api/delivery-partner/status/
 */
export async function updateStatus(
  data: DeliveryPartnerStatusRequest
): Promise<{ message: string; online: boolean }> {
  const res = await getClient().patch<{ message: string; online: boolean }>(
    "/api/delivery-partner/status/",
    data
  );
  return res.data;
}

// ─── Assignments ──────────────────────────────────────────────────────

/**
 * Get active delivery assignments.
 * GET /api/delivery-partner/assignments/
 */
export async function getAssignments(): Promise<DeliveryMission[]> {
  const res = await getClient().get<DeliveryMission[]>(
    "/api/delivery-partner/assignments/"
  );
  return res.data;
}

/**
 * Accept a delivery assignment.
 * POST /api/delivery-partner/assignments/{id}/accept/
 */
export async function acceptAssignment(
  missionId: string
): Promise<DeliveryMission> {
  const res = await getClient().post<DeliveryMission>(
    `/api/delivery-partner/assignments/${missionId}/accept/`
  );
  return res.data;
}

/**
 * Mark that the partner has picked up the order from the hub.
 * POST /api/delivery-partner/assignments/{id}/pickup/
 */
export async function markPickup(
  missionId: string
): Promise<{ message: string }> {
  const res = await getClient().post<{ message: string }>(
    `/api/delivery-partner/assignments/${missionId}/pickup/`
  );
  return res.data;
}

/**
 * Mark that the partner is in transit (with GPS coords).
 * POST /api/delivery-partner/assignments/{id}/transit/
 */
export async function markInTransit(
  missionId: string,
  coords: { latitude: number; longitude: number }
): Promise<{ message: string }> {
  const res = await getClient().post<{ message: string }>(
    `/api/delivery-partner/assignments/${missionId}/transit/`,
    coords
  );
  return res.data;
}

/**
 * Mark a stop as delivered with proof.
 * POST /api/delivery-partner/assignments/{id}/deliver/
 */
export async function markDelivered(
  missionId: string,
  stopId: string,
  proof: ProofOfDeliveryRequest
): Promise<{ message: string }> {
  const { mission_id: _m, stop_id: _s, ...proofData } = proof;
  const res = await getClient().post<{ message: string }>(
    `/api/delivery-partner/assignments/${missionId}/deliver/`,
    { stop_id: stopId, ...proofData }
  );
  return res.data;
}

// ─── Proof Upload ─────────────────────────────────────────────────────

/**
 * Upload proof-of-delivery media (photo).
 * POST /api/delivery-partner/proof/
 */
export async function uploadProof(data: FormData): Promise<{ url: string }> {
  const res = await getClient().post<{ url: string }>(
    "/api/delivery-partner/proof/",
    data,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
}

// ─── Earnings ─────────────────────────────────────────────────────────

/**
 * Get today's earnings summary.
 * GET /api/delivery-partner/earnings/
 */
export async function getEarnings(): Promise<DeliveryPartnerStats> {
  const res = await getClient().get<DeliveryPartnerStats>(
    "/api/delivery-partner/earnings/"
  );
  return res.data;
}
