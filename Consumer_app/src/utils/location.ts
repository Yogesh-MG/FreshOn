import { LocationData } from "@/hooks/use-location";

export function getStoredLocation(): LocationData | null {
  const saved = localStorage.getItem("userLocation");
  return saved ? JSON.parse(saved) : null;
}

export function getStoredAddress(): string | null {
  return localStorage.getItem("userAddress");
}

export function getLocationForCheckout(): {
  location: LocationData | null;
  address: string | null;
  hasLocationData: boolean;
} {
  const location = getStoredLocation();
  const address = getStoredAddress();

  return {
    location,
    address,
    hasLocationData: !!location || !!address,
  };
}

export function clearLocationData(): void {
  localStorage.removeItem("userLocation");
  localStorage.removeItem("userAddress");
}
