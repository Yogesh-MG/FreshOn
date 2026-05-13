/**
 * Dynamically loads Google Maps API script
 */

declare global {
  interface Window {
    google: any;
  }
}

let scriptLoading: Promise<void> | null = null;

export async function loadGoogleMapsScript(): Promise<void> {
  // If already loaded, return immediately
  if (window.google?.maps) {
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (scriptLoading) {
    return scriptLoading;
  }

  // Start loading
  scriptLoading = new Promise((resolve, reject) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("VITE_GOOGLE_MAPS_API_KEY is not set in .env");
      reject(new Error("Google Maps API key not configured"));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      scriptLoading = null;
      resolve();
    };

    script.onerror = () => {
      scriptLoading = null;
      reject(new Error("Failed to load Google Maps API"));
    };

    document.head.appendChild(script);
  });

  return scriptLoading;
}

export async function ensureGoogleMapsLoaded(): Promise<void> {
  try {
    await loadGoogleMapsScript();
  } catch (error) {
    console.error("Error loading Google Maps:", error);
  }
}
