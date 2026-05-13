import { useCallback, useEffect, useState } from "react";

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface UseLocationReturn {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  requestPermission: () => Promise<boolean>;
  setManualLocation: (location: LocationData) => void;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationData | null>(() => {
    // Restore from localStorage if available
    const saved = localStorage.getItem("userLocation");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Check if geolocation is available
  const hasGeolocation = useCallback(() => {
    return "geolocation" in navigator;
  }, []);

  // Request location permission and get position
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!hasGeolocation()) {
      setError("Geolocation is not supported by your browser");
      setPermissionDenied(true);
      return false;
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          setLocation(locationData);
          localStorage.setItem("userLocation", JSON.stringify(locationData));
          setLoading(false);
          setPermissionDenied(false);
          resolve(true);
        },
        (error) => {
          setLoading(false);

          if (error.code === error.PERMISSION_DENIED) {
            setPermissionDenied(true);
            setError("Location permission denied");
          } else if (error.code === error.TIMEOUT) {
            setError("Location request timed out");
          } else {
            setError("Unable to retrieve location");
          }

          resolve(false);
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 0,
        }
      );
    });
  }, [hasGeolocation]);

  // Auto-request location on mount if not already granted
  useEffect(() => {
    // Only auto-request if we don't have a saved location
    if (!location && !permissionDenied) {
      requestPermission();
    }
  }, []);

  const setManualLocation = useCallback((newLocation: LocationData) => {
    setLocation(newLocation);
    localStorage.setItem("userLocation", JSON.stringify(newLocation));
    setPermissionDenied(false);
    setError(null);
  }, []);

  return {
    location,
    loading,
    error,
    permissionDenied,
    requestPermission,
    setManualLocation,
  };
}
