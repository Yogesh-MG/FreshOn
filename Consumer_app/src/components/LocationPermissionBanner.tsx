import { useState } from "react";
import { MapPin, X } from "lucide-react";
import { LocationData, UseLocationReturn } from "@/hooks/use-location";
import { AddressSearchModal } from "./AddressSearchModal";
import { useLocationContext } from "@/context/LocationContext";

interface LocationPermissionBannerProps {
  location: UseLocationReturn;
  onDismiss?: () => void;
}

export function LocationPermissionBanner({
  location,
  onDismiss,
}: LocationPermissionBannerProps) {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (location.location || dismissed || !location.permissionDenied) {
    return null;
  }

  const handleGrant = async () => {
    const success = await location.requestPermission();
    if (success) {
      setDismissed(true);
      onDismiss?.();
    }
  };

  const handleSelectLocation = (
    locationData: LocationData,
    address: string
  ) => {
    location.setManualLocation(locationData);
    localStorage.setItem("userAddress", address);
    setDismissed(true);
    setShowSearchModal(false);
    onDismiss?.();
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <>
      <div className="fixed left-0 right-0 top-[env(safe-area-inset-top)] bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 shadow-lg z-30">
        <div className="max-w-md mx-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-1">
                <MapPin className="w-5 h-5 flex-shrink-0" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">
                  Location Permission is Off
                </h3>
                <p className="text-xs text-blue-100 mb-3">
                  Enabling location will ensure accurate address and hassle free
                  delivery
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={handleGrant}
                    disabled={location.loading}
                    className="bg-white text-blue-600 px-4 py-1.5 rounded text-xs font-semibold hover:bg-blue-50 disabled:opacity-50 transition"
                  >
                    {location.loading ? "Requesting..." : "GRANT"}
                  </button>
                  <button
                    onClick={() => setShowSearchModal(true)}
                    className="bg-blue-400 text-white px-4 py-1.5 rounded text-xs font-semibold hover:bg-blue-500 transition"
                  >
                    Manual
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="text-white hover:text-blue-100 transition flex-shrink-0 mt-1"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Address Search Modal */}
      {showSearchModal && (
        <AddressSearchModal
          onSelect={handleSelectLocation}
          onClose={() => setShowSearchModal(false)}
        />
      )}
    </>
  );
}

export function LocationPermissionBannerWithContext() {
  const location = useLocationContext();
  return <LocationPermissionBanner location={location} />;
}
