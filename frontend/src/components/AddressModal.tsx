import { useState, useEffect } from "react";
import { X, MapPin, AlertCircle, CheckCircle2, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/utils/api";
import { searchAddressesDebounced } from "@/services/geocoding";

interface LocationSuggestion {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface AddressModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (address: any) => void;
  loading?: boolean;
}

const ADDRESS_TYPES = [
  { value: "HOME", label: "Home" },
  { value: "WORK", label: "Work" },
  { value: "OTHER", label: "Other" },
];

export const AddressModal = ({ open, onClose, onSave, loading }: AddressModalProps) => {
  const [step, setStep] = useState<"search" | "details" | "confirm">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [validation, setValidation] = useState<{
    valid: boolean;
    message: string;
    serviceArea?: string;
  } | null>(null);
  const [validating, setValidating] = useState(false);

  // Address details form
  const [addressType, setAddressType] = useState("HOME");
  const [addressTitle, setAddressTitle] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [landmark, setLandmark] = useState("");

  // Search handler with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setSearching(true);
    searchAddressesDebounced(searchQuery, (results) => {
      setSuggestions(results);
      setSearching(false);
    });
  }, [searchQuery]);

  // Validate location with backend
  const validateLocation = async (location: LocationSuggestion) => {
    setValidating(true);
    try {
      const response = await api.post("/api/delivery/validate-location/", {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      });
      setValidation(response.data);
      return response.data.valid;
    } catch (error) {
      console.error("Validation failed:", error);
      setValidation({
        valid: false,
        message: "Could not validate location. Please try again.",
      });
      return false;
    } finally {
      setValidating(false);
    }
  };

  const handleSelectLocation = async (location: LocationSuggestion) => {
    setSelectedLocation(location);
    setAddressLine(location.address);
    const isValid = await validateLocation(location);
    
    if (isValid) {
      setStep("details");
    }
  };

  const handleSaveAddress = async () => {
    if (!selectedLocation || !addressTitle) {
      alert("Please fill in all required fields");
      return;
    }

    const newAddress = {
      address_type: addressType,
      title: addressTitle,
      address_line: addressLine,
      landmark,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      is_default: false,
    };

    try {
      const response = await api.post("/api/delivery/addresses/", newAddress);
      onSave(response.data);
      resetForm();
      onClose();
    } catch (error: any) {
      console.error("Failed to save address:", error);
      alert(error.response?.data?.detail || "Failed to save address");
    }
  };

  const resetForm = () => {
    setStep("search");
    setSearchQuery("");
    setSuggestions([]);
    setSelectedLocation(null);
    setValidation(null);
    setAddressType("HOME");
    setAddressTitle("");
    setAddressLine("");
    setLandmark("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50">
      <div className="w-full animate-in slide-in-from-bottom rounded-t-2xl bg-background max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background p-4">
          <h2 className="font-display text-lg font-bold">Add new address</h2>
          <button
            onClick={onClose}
            className="rounded-full hover:bg-surface p-2 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Step 1: Search Location */}
          {step === "search" && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search address or landmark..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full rounded-lg bg-surface px-4 text-sm font-medium outline-none ring-mint/40 focus:ring-2"
                />
                {searching && (
                  <Loader className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Suggestions List */}
              {suggestions.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSelectLocation(suggestion)}
                      disabled={validating}
                      className="w-full flex items-start gap-3 rounded-lg border border-border p-3 text-left hover:border-mint hover:bg-mint-soft transition disabled:opacity-50"
                    >
                      <MapPin className="h-5 w-5 text-forest flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold line-clamp-2">{suggestion.address}</p>
                        <p className="text-xs text-muted-foreground">
                          {suggestion.latitude.toFixed(4)}, {suggestion.longitude.toFixed(4)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!searching && searchQuery && suggestions.length === 0 && (
                <div className="rounded-lg border border-border bg-surface/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">No addresses found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try searching with different keywords</p>
                </div>
              )}

              {!searchQuery && (
                <div className="rounded-lg border border-border bg-mint-soft p-4">
                  <p className="text-sm font-semibold text-forest">💡 Tip</p>
                  <p className="text-xs text-forest/80 mt-1">Search by area name, landmark, or building name for best results</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Address Details */}
          {step === "details" && selectedLocation && (
            <div className="space-y-4">
              {/* Validation Status */}
              {validation && (
                <div
                  className={cn(
                    "rounded-lg border p-3 flex items-start gap-3",
                    validation.valid
                      ? "border-mint bg-mint-soft"
                      : "border-red-300 bg-red-50"
                  )}
                >
                  {validation.valid ? (
                    <CheckCircle2 className="h-5 w-5 text-mint flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">
                      {validation.valid ? "Delivery Available" : "Service Not Available"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{validation.message}</p>
                  </div>
                </div>
              )}

              {/* Address Type */}
              <div>
                <label className="block text-sm font-semibold mb-2">Address type</label>
                <div className="grid grid-cols-3 gap-2">
                  {ADDRESS_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setAddressType(type.value)}
                      className={cn(
                        "rounded-lg border p-3 text-sm font-semibold transition",
                        addressType === type.value
                          ? "border-forest bg-forest text-forest-foreground"
                          : "border-border bg-surface"
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Address Title */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Label this address <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., My Home, Office"
                  value={addressTitle}
                  onChange={(e) => setAddressTitle(e.target.value)}
                  className="h-10 w-full rounded-lg bg-surface px-3 text-sm font-medium outline-none ring-mint/40 focus:ring-2"
                />
              </div>

              {/* Address Line */}
              <div>
                <label className="block text-sm font-semibold mb-2">Full address</label>
                <textarea
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="min-h-20 w-full rounded-lg bg-surface px-3 py-2 text-sm font-medium outline-none ring-mint/40 focus:ring-2"
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-sm font-semibold mb-2">Landmark (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Near Park, Opposite Mall"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="h-10 w-full rounded-lg bg-surface px-3 text-sm font-medium outline-none ring-mint/40 focus:ring-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 border-t border-border bg-background p-4 flex gap-3">
          {step === "details" && (
            <>
              <button
                onClick={() => setStep("search")}
                className="flex-1 h-12 rounded-full border border-border bg-surface font-semibold hover:bg-gray-100 transition"
              >
                Back
              </button>
              <button
                onClick={handleSaveAddress}
                disabled={loading || !addressTitle}
                className="flex-1 h-12 rounded-full bg-forest text-forest-foreground font-semibold hover:bg-forest/90 disabled:opacity-60 transition"
              >
                {loading ? "Saving..." : "Save address"}
              </button>
            </>
          )}

          {step === "search" && (
            <button
              onClick={onClose}
              className="w-full h-12 rounded-full border border-border bg-surface font-semibold hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
