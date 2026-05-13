/**
 * Geocoding service using Google Maps API
 * Requires VITE_GOOGLE_MAPS_API_KEY in .env
 */

import { ensureGoogleMapsLoaded } from "@/utils/googleMapsLoader";

export interface LocationSuggestion {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.warn("VITE_GOOGLE_MAPS_API_KEY is not set. Google Maps features will not work.");
}

// Debounce helper to avoid too many API calls
let debounceTimer: NodeJS.Timeout;
let placesService: google.maps.places.PlacesService | null = null;
let sessionToken: google.maps.places.AutocompleteSessionToken | null = null;

// Initialize Places Service
async function initPlacesService() {
  if (!placesService && window.google?.maps?.places) {
    const map = new google.maps.Map(document.createElement("div"));
    placesService = new google.maps.places.PlacesService(map);
    sessionToken = new google.maps.places.AutocompleteSessionToken();
  }
}

/**
 * Search for addresses using Google Places Autocomplete
 * Returns autocomplete suggestions as user types
 */
export async function searchAddresses(
  query: string
): Promise<LocationSuggestion[]> {
  if (query.length < 3) return [];

  try {
    // Ensure Google Maps is loaded
    await ensureGoogleMapsLoaded();

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
      `input=${encodeURIComponent(query)}&` +
      `key=${GOOGLE_MAPS_API_KEY}&` +
      `components=country:in&` +
      `sessiontoken=${sessionToken?.getToken() || ""}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Google Places API error");
    }

    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API error:", data.error_message);
      return [];
    }

    // Get details for each prediction
    const suggestions = await Promise.all(
      (data.predictions || []).slice(0, 8).map(async (prediction: any) => {
        const details = await getPlaceDetails(prediction.place_id);
        return {
          id: prediction.place_id,
          address: prediction.main_text + ", " + prediction.secondary_text,
          latitude: details?.latitude || 0,
          longitude: details?.longitude || 0,
          placeId: prediction.place_id,
        };
      })
    );

    return suggestions.filter(s => s.latitude && s.longitude);
  } catch (error) {
    console.error("Address search failed:", error);
    return [];
  }
}

/**
 * Get place details (coordinates) from place ID
 */
async function getPlaceDetails(placeId: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?` +
      `place_id=${placeId}&` +
      `key=${GOOGLE_MAPS_API_KEY}&` +
      `fields=geometry&` +
      `sessiontoken=${sessionToken?.getToken() || ""}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) throw new Error("Failed to get place details");

    const data = await response.json();

    if (data.result?.geometry?.location) {
      return {
        latitude: data.result.geometry.location.lat,
        longitude: data.result.geometry.location.lng,
      };
    }

    return null;
  } catch (error) {
    console.error("Place details fetch failed:", error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to get address
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    await ensureGoogleMapsLoaded();

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?` +
      `latlng=${latitude},${longitude}&` +
      `key=${GOOGLE_MAPS_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Reverse geocoding failed");
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }

    return null;
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return null;
  }
}

/**
 * Debounced search to avoid excessive API calls
 */
export function searchAddressesDebounced(
  query: string,
  callback: (results: LocationSuggestion[]) => void
): void {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    const results = await searchAddresses(query);
    callback(results);
  }, 300); // Wait 300ms after user stops typing
}
