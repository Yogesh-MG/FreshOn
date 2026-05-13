# Location Setup Guide - Freshon Tauri App

## What We've Implemented

### 1. **Android Permissions** (`tauri.conf.json`)
Add this at the **top-level** of your `tauri.conf.json`:
```json
"android": {
  "minSdkVersion": 21,
  "targetSdkVersion": 33,
  "permissions": [
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.ACCESS_COARSE_LOCATION"
  ]
}
```

### 2. **Tauri Geolocation Plugin** (`Cargo.toml`)
- Added `tauri-plugin-geolocation` for cross-platform location access
- Automatically handles OS-level permissions

### 3. **Frontend Setup**

#### **useLocation Hook** (`src/hooks/use-location.ts`)
- Auto-requests location on app startup
- Handles permission denial gracefully
- Stores location in localStorage for persistence
- Methods:
  - `requestPermission()` - Request location from user
  - `setManualLocation()` - Store manually entered location

#### **LocationPermissionBanner Component** (`src/components/LocationPermissionBanner.tsx`)
Shows when location permission is denied:
- **GRANT button** - Requests geolocation permission
- **Manual input** - User can enter location manually
- **X button** - Dismiss and continue (location not required)

#### **LocationContext** (`src/context/LocationContext.tsx`)
Global state management for location data

#### **Location Utilities** (`src/utils/location.ts`)
Helper functions:
- `getStoredLocation()` - Get location from storage
- `getStoredAddress()` - Get manually entered address
- `getLocationForCheckout()` - Get all location data for order
- `clearLocationData()` - Clear stored data

### 4. **Integration**

#### **App.tsx**
- Wrapped with `LocationProvider`
- Shows `LocationPermissionBanner` at top

#### **Checkout.tsx** 
- Retrieves location/address when placing order
- Sends `latitude`, `longitude`, and `address` to backend

---

## Flow

```
App Starts
  ↓
useLocation Hook (auto-request)
  ↓
Permission Denied? → Show Banner
  ↓
User Options:
  ├─ GRANT → Get GPS location
  ├─ Manual → Enter address
  └─ X → Skip (can provide later)
  ↓
Location/Address stored in localStorage
  ↓
User proceeds to checkout
  ↓
At checkout: Location automatically included in order
```

---

## Data Flow to Backend

### Order Payload Example:
```json
{
  "address_title": "Home",
  "address_line": "Manual address or default",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "delivery_slot": "EXPRESS",
  "payment_method": "UPI",
  "items": [...],
  "subtotal": 500,
  "delivery_fee": 0,
  "total": 500
}
```

---

## Next Steps

1. **Backend API** - Accept `latitude`, `longitude` in order endpoint
2. **Permission Dialog** - Tauri handles this automatically on Android 6+
3. **Testing** - Build for Android and test location permission flow
4. **Fallback** - If no location, address_line is used

---

## Edge Cases Handled

✅ User denies permission → Can enter manually or skip  
✅ Timeout → Shows error banner  
✅ Browser doesn't support geolocation → Falls back to manual  
✅ User closes app → Location persists in localStorage  
✅ Multiple visits → Reuses stored location until cleared  

---

## Commands to Build

```bash
# Install dependencies
npm install

# Build for Android
tauri build --target aarch64-linux-android

# Dev mode
npm run dev
```

---

## Storage Keys

- `userLocation` - JSON string with latitude, longitude, accuracy, timestamp
- `userAddress` - Manual address entered by user

