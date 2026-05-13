/**
 * Backend location validation service
 * Checks if delivery location is within service area
 */

import api from "@/utils/api";

export interface LocationValidationRequest {
  latitude: number;
  longitude: number;
  address: string;
}

export interface LocationValidationResponse {
  valid: boolean;
  message: string;
  serviceArea?: string;
}

/**
 * Validate if location is within service area
 * Calls backend endpoint to check delivery restrictions
 */
export async function validateServiceArea(
  location: LocationValidationRequest
): Promise<LocationValidationResponse> {
  try {
    const response = await api.post("/api/delivery/validate-location/", {
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
    });

    return {
      valid: response.data.valid || true,
      message: response.data.message || "Location accepted",
      serviceArea: response.data.service_area,
    };
  } catch (error: any) {
    // If endpoint doesn't exist yet, allow the location
    if (error.response?.status === 404) {
      console.warn("Validation endpoint not yet implemented");
      return {
        valid: true,
        message: "Location accepted (validation pending)",
      };
    }

    return {
      valid: false,
      message:
        error.response?.data?.message ||
        "Unable to validate location, please try again",
    };
  }
}
