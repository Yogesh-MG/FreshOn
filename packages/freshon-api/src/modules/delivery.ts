// packages/freshon-api/src/modules/delivery.ts
// Delivery management module — slots, addresses, location validation.
// Maps to Django's apps/delivery/ endpoints.

import { getClient } from "../client";
import type {
  DeliverySlot,
  DeliveryAddress,
  SaveAddressRequest,
  LocationValidationRequest,
  LocationValidationResponse,
} from "../types";

// ─── Slots ────────────────────────────────────────────────────────────

/**
 * List available delivery slots (EXPRESS, SAME_DAY, NEXT_DAY).
 * GET /api/delivery/slots/
 */
export async function listSlots(): Promise<DeliverySlot[]> {
  const res = await getClient().get<DeliverySlot[]>("/api/delivery/slots/");
  return res.data;
}

// ─── Addresses ────────────────────────────────────────────────────────

/**
 * List the user's saved delivery addresses.
 * GET /api/delivery/addresses/
 */
export async function listAddresses(): Promise<DeliveryAddress[]> {
  const res = await getClient().get<DeliveryAddress[]>("/api/delivery/addresses/");
  return res.data;
}

/**
 * Save a new delivery address.
 * POST /api/delivery/addresses/
 */
export async function saveAddress(data: SaveAddressRequest): Promise<DeliveryAddress> {
  const res = await getClient().post<DeliveryAddress>("/api/delivery/addresses/", data);
  return res.data;
}

/**
 * Update an existing delivery address.
 * PATCH /api/delivery/addresses/{id}/
 */
export async function updateAddress(
  id: number,
  data: Partial<SaveAddressRequest>
): Promise<DeliveryAddress> {
  const res = await getClient().patch<DeliveryAddress>(
    `/api/delivery/addresses/${id}/`,
    data
  );
  return res.data;
}

/**
 * Delete a delivery address.
 * DELETE /api/delivery/addresses/{id}/
 */
export async function deleteAddress(id: number): Promise<void> {
  await getClient().delete(`/api/delivery/addresses/${id}/`);
}

// ─── Location Validation ──────────────────────────────────────────────

/**
 * Validate if a location is within a Freshon service area.
 * POST /api/delivery/validate-location/
 *
 * Gracefully degrades: returns { valid: true } if the endpoint isn't deployed yet.
 */
export async function validateLocation(
  data: LocationValidationRequest
): Promise<LocationValidationResponse> {
  try {
    const res = await getClient().post<LocationValidationResponse>(
      "/api/delivery/validate-location/",
      data
    );
    return {
      valid: res.data.valid ?? true,
      message: res.data.message ?? "Location accepted",
      service_area: res.data.service_area,
      distance_km: res.data.distance_km,
    };
  } catch (error: unknown) {
    const axiosErr = error as { response?: { status?: number; data?: { message?: string } } };

    // 404 = endpoint not yet implemented — allow the location
    if (axiosErr.response?.status === 404) {
      return {
        valid: true,
        message: "Location accepted (validation pending)",
      };
    }

    return {
      valid: false,
      message:
        axiosErr.response?.data?.message ??
        "Unable to validate location, please try again",
    };
  }
}
