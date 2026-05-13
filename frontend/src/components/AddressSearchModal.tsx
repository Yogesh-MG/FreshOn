import { useState, useCallback } from "react";
import { Search, X, Loader, AlertCircle, CheckCircle } from "lucide-react";
import {
  searchAddresses,
  LocationSuggestion,
  searchAddressesDebounced,
} from "@/services/geocoding";
import {
  validateServiceArea,
  LocationValidationResponse,
} from "@/services/locationValidation";
import { LocationData } from "@/hooks/use-location";

interface AddressSearchModalProps {
  onSelect: (location: LocationData, address: string) => void;
  onClose: () => void;
}

export function AddressSearchModal({
  onSelect,
  onClose,
}: AddressSearchModalProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<LocationSuggestion | null>(null);
  const [validation, setValidation] =
    useState<LocationValidationResponse | null>(null);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setValidation(null);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    searchAddressesDebounced(value, (results) => {
      setSuggestions(results);
      setLoading(false);
    });
  }, []);

  const handleSelectSuggestion = async (suggestion: LocationSuggestion) => {
    setSelectedSuggestion(suggestion);
    setValidating(true);

    // Validate location with backend
    const validationResult = await validateServiceArea({
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      address: suggestion.address,
    });

    setValidation(validationResult);
    setValidating(false);

    // If valid, proceed
    if (validationResult.valid) {
      const locationData: LocationData = {
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        accuracy: 0,
        timestamp: Date.now(),
      };

      onSelect(locationData, suggestion.address);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-white rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Search Location</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Enter address, area, or landmark"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Error/Success Messages */}
        {validation && (
          <div
            className={`mb-4 p-3 rounded-lg flex items-start gap-3 ${
              validation.valid
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            {validation.valid ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p
                className={`text-sm font-medium ${
                  validation.valid ? "text-green-900" : "text-red-900"
                }`}
              >
                {validation.message}
              </p>
              {validation.serviceArea && (
                <p className="text-xs text-gray-600 mt-1">
                  Service Area: {validation.serviceArea}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-5 h-5 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-gray-600">Searching...</span>
          </div>
        )}

        {/* Suggestions List */}
        {!loading && suggestions.length > 0 && !selectedSuggestion && (
          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSelectSuggestion(suggestion)}
                disabled={validating}
                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition disabled:opacity-50"
              >
                <p className="font-medium text-sm text-gray-900">
                  {suggestion.address.split(",").slice(0, 2).join(",")}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {suggestion.address}
                </p>
                {validating && (
                  <Loader className="w-4 h-4 animate-spin text-blue-600 mt-2" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && query.length >= 3 && suggestions.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-600">No locations found</p>
            <p className="text-xs text-gray-500 mt-1">
              Try searching with city name or landmark
            </p>
          </div>
        )}

        {/* Empty State */}
        {!query && (
          <div className="py-8 text-center">
            <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-600">Start typing to search</p>
            <p className="text-xs text-gray-500 mt-1">
              Example: "Koramangala, Bangalore" or "MG Road"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
