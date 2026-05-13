# Hybrid Location System - Complete Setup

## Architecture

```
Frontend: User enters address
    ↓
Nominatim API (FREE - OpenStreetMap)
    ↓ Shows autocomplete suggestions (no API key needed)
    ↓
User selects address
    ↓
Frontend: Sends lat/long to backend for validation
    ↓
Backend: Validates if location within service area
    ↓
Response: "Valid" or "Outside delivery area"
    ↓
Proceed or ask user to select different location
```

---

## Frontend Setup ✅

### 1. **Geocoding Service** (`src/services/geocoding.ts`)
- Uses **Nominatim** (OpenStreetMap) - completely FREE
- No API key required
- Functions:
  - `searchAddresses()` - Autocomplete search (debounced)
  - `reverseGeocode()` - Get address from coordinates

### 2. **Location Validation Service** (`src/services/locationValidation.ts`)
- Calls backend to validate service area
- Gracefully handles if endpoint doesn't exist yet

### 3. **Address Search Modal** (`src/components/AddressSearchModal.tsx`)
- Beautiful autocomplete modal
- Real-time search results
- Validates location with backend
- Shows error if outside service area

### 4. **Updated LocationPermissionBanner** 
- "Manual" button opens AddressSearchModal
- Integrates with new modal

---

## Backend Setup 📝

### 1. **Add the Endpoint** 

Copy code from `LOCATION_VALIDATION_ENDPOINT.py` to your Django app:

**Option A: Create new delivery app**
```bash
python manage.py startapp delivery
```

**Option B: Add to existing app** (e.g., `orders/`)

### 2. **Create `views.py` endpoint**

```python
# In backend/apps/delivery/views.py (or your app)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import math

# Copy the validate_location function and SERVICE_AREAS from LOCATION_VALIDATION_ENDPOINT.py
```

### 3. **Add URL Route**

```python
# In backend/apps/delivery/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("validate-location/", views.validate_location, name="validate_location"),
]

# In backend/freshon_os/urls.py
from django.urls import path, include

urlpatterns = [
    # ... existing urls
    path("api/delivery/", include("apps.delivery.urls")),
]
```

### 4. **Customize Service Areas**

Update `SERVICE_AREAS` in the endpoint with YOUR actual locations:

```python
SERVICE_AREAS = [
    {
        "name": "Bangalore - Koramangala",
        "center_lat": 12.9352,
        "center_lon": 77.6245,
        "radius_km": 2.5,
    },
    {
        "name": "Bangalore - Indiranagar",
        "center_lat": 13.0016,
        "center_lon": 77.6412,
        "radius_km": 2.5,
    },
]
```

---

## Data Flow at Checkout

### User searches for "Koramangala"

```
Frontend → Nominatim API (free, no key)
Response: [
  {
    id: 123,
    address: "Koramangala, Bangalore, India",
    latitude: 12.9352,
    longitude: 77.6245
  },
  ...more results
]
```

### User selects address

```
Frontend → Backend /api/delivery/validate-location/
Payload: {
  latitude: 12.9352,
  longitude: 77.6245,
  address: "Koramangala, Bangalore, India"
}
```

### Backend validates & responds

```
Response (if valid):
{
  "valid": true,
  "message": "Location is within Koramangala service area",
  "service_area": "Koramangala",
  "distance_km": 0.5
}

Response (if invalid):
{
  "valid": false,
  "message": "Location is outside our delivery area. Please select a location within: Koramangala, Indiranagar, Whitefield",
  "service_area": null
}
```

### User proceeds to checkout

Location data stored and sent with order:
```json
{
  "address": "Koramangala, Bangalore",
  "latitude": 12.9352,
  "longitude": 77.6245,
  "delivery_slot": "EXPRESS",
  "payment_method": "UPI",
  ...
}
```

---

## Why This Approach? 🎯

✅ **Nominatim** - Free, no API key, open-source  
✅ **Service area validation** - Backend controls delivery zones  
✅ **Real-time autocomplete** - Better UX, faster than manual typing  
✅ **No Google Maps costs** - Saves thousands of rupees  
✅ **Fallback to manual** - Works even if Nominatim is slow  

---

## Testing

### Frontend (browser dev)
```bash
npm run dev
# Type in the "Manual" button search box
# Should see autocomplete suggestions
```

### With Backend
```bash
# Once you set up the endpoint
curl -X POST http://localhost:8000/api/delivery/validate-location/ \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 12.9352,
    "longitude": 77.6245,
    "address": "Koramangala"
  }'
```

---

## Customization

### Change radius for service areas
```python
SERVICE_AREAS = [
    {
        "name": "Koramangala",
        "center_lat": 12.9352,
        "center_lon": 77.6245,
        "radius_km": 5.0,  # Increased from 2.5km to 5km
    },
]
```

### Restrict search to specific country
In `geocoding.ts`, change:
```typescript
countrycodes: "in", // "us" for USA, "gb" for UK, etc.
```

### Add more suggestions
```typescript
limit: "8", // Change to show more/less suggestions
```

---

## Files Created

- ✅ `src/services/geocoding.ts` - Nominatim API wrapper
- ✅ `src/services/locationValidation.ts` - Backend validation
- ✅ `src/components/AddressSearchModal.tsx` - Search UI
- ✅ `src/components/LocationPermissionBanner.tsx` - Updated banner
- 📝 `LOCATION_VALIDATION_ENDPOINT.py` - Backend template

---

## Next Steps

1. **Frontend**: Everything is ready, test with browser dev
2. **Backend**: Copy the endpoint code and add to your Django app
3. **Customize**: Update SERVICE_AREAS with your actual delivery zones
4. **Deploy**: Build and test on Android device

Questions? Let me know! 🚀
