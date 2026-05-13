# Location & Delivery System 📍🚚

Freshon OS features a sophisticated, dual-layered location system designed to ensure precision in urban deliveries while maintaining a zero-cost infrastructure using open-source tools.

## 1. Architecture Overview

The system combines OS-level GPS capabilities with a hybrid geocoding engine to provide a seamless user experience.

- **GPS Layer**: Utilizes the Tauri Geolocation plugin to request high-accuracy coordinates directly from the user's device (Android/iOS).
- **Search Layer**: Uses the **Nominatim API** (OpenStreetMap) for free, real-time address autocomplete and reverse geocoding.
- **Validation Layer**: A backend service that verifies if coordinates fall within specific circular delivery zones (Service Areas).

## 2. Key Components

### **Frontend**
- **`useLocation` Hook**: Manages global location state and persistence in `localStorage`.
- **`AddressSearchModal`**: A premium UI component for manual address searching with debounced API calls to Nominatim.
- **`LocationPermissionBanner`**: A smart banner that handles permission denial by offering manual input fallbacks.

### **Backend**
- **Location Validation**: A custom Django endpoint that calculates distances using the Haversine formula to ensure the user is within a serviceable radius of a hub.

## 3. Setup Guides

For detailed engineering and implementation steps, refer to the following guides:

1. [**Base Location Setup**](./SETUP_LOCATION_BASE.md) - Android permissions, Tauri plugins, and the core `useLocation` hook.
2. [**Hybrid Geocoding Setup**](./SETUP_LOCATION_HYBRID.md) - Nominatim API integration, autocomplete UI, and backend service area validation.

## 4. Why Nominatim? 🎯

Unlike Google Maps, which incurs significant costs per search request, our integration with **Nominatim** (OpenStreetMap) is:
- **100% Free**: No API keys or credit cards required.
- **Privacy Focused**: No tracking of user search history by big-tech advertising engines.
- **Open Source**: Built on community-driven map data.

---

*This system ensures that Freshon can scale to new cities by simply adding a new `center_lat/lon` and `radius` to the backend configuration.*
