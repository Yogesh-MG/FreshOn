/**
 * Geocoding service using Google Maps API
 */

export interface GeocodingResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface LocationSuggestion {
  id: string | number;
  address: string;
  latitude: number;
  longitude: number;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Debounce helper to avoid too many API calls
let debounceTimer: NodeJS.Timeout;

/**
 * Search for addresses using Google Maps Geocoding API
 */
export async function searchAddresses(
  query: string
): Promise<LocationSuggestion[]> {
  if (query.length < 3) return [];
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
    console.warn("Google Maps API Key is missing or using placeholder.");
    return [];
  }

  try {
    const params = new URLSearchParams({
      address: query,
      key: GOOGLE_MAPS_API_KEY,
      region: "in", // Restrict to India
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
    );

    const data = await response.json();

    if (data.status !== "OK") {
      if (data.status === "ZERO_RESULTS") return [];
      throw new Error(`Google Geocoding failed: ${data.status}`);
    }

    const results: GeocodingResult[] = data.results;

    return results.map((result, index) => ({
      id: result.place_id || index,
      address: result.formatted_address,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
    }));
  } catch (error) {
    console.error("Address search failed:", error);
    return [];
  }
}

/**
 * Reverse geocode coordinates to get address using Google Maps
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
    return null;
  }

  try {
    const params = new URLSearchParams({
      latlng: `${latitude},${longitude}`,
      key: GOOGLE_MAPS_API_KEY,
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
    );

    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(`Google Reverse Geocoding failed: ${data.status}`);
    }

    // Get the first result (usually the most specific)
    return data.results[0]?.formatted_address || null;
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
