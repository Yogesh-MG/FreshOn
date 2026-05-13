// packages/freshon-api/src/modules/profile.ts
// Customer profile module — unified address, preferences, settings.
// Maps to Django's CustomerProfileDataView in apps/accounts/views.py.

import { getClient } from "../client";
import type { CustomerProfileData, UpdateProfileRequest } from "../types";

/**
 * Get the customer's full profile (address + preferences + settings) in one call.
 * GET /api/auth/profile-data/
 */
export async function getProfile(): Promise<CustomerProfileData> {
  const res = await getClient().get<CustomerProfileData>("/api/auth/profile-data/");
  return res.data;
}

/**
 * Update profile data — can send any combination of address, preferences, settings.
 * PATCH /api/auth/profile-data/
 */
export async function updateProfile(
  data: UpdateProfileRequest
): Promise<Partial<CustomerProfileData>> {
  const res = await getClient().patch<Partial<CustomerProfileData>>(
    "/api/auth/profile-data/",
    data
  );
  return res.data;
}
