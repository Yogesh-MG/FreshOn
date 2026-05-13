# Address Management System

## Overview

Complete address management system for checkout flow with:
- Address search using Nominatim API (OpenStreetMap)
- Service area validation (Haversine distance calculation)
- Save multiple addresses per user
- Set address type (Home, Work, Other)
- Add landmarks/notes for delivery

## Components

### AddressModal (`src/components/AddressModal.tsx`)

**Props:**
```typescript
interface AddressModalProps {
  open: boolean;              // Control modal visibility
  onClose: () => void;        // Handle modal close
  onSave: (address: any) => void;  // Save address callback
  loading?: boolean;          // Show loading state during save
}
```

**Features:**
- 3-step flow: Search → Details → Confirm
- Real-time address search with debounce
- Location validation against service areas
- Address type selection (Home, Work, Other)
- Landmark field for delivery instructions
- Validation feedback (green/red)

**Address Object Structure:**
```typescript
{
  address_type: "HOME" | "WORK" | "OTHER",
  title: string,              // Label (e.g., "My Home")
  address_line: string,       // Full address
  landmark: string,           // Optional landmark
  latitude: number,
  longitude: number,
  is_default: boolean         // Set as default address
}
```

## Integration in Checkout

### Step 1: Import AddressModal
```typescript
import AddressModal from "@/components/AddressModal";
```

### Step 2: Add State
```typescript
const [showAddressModal, setShowAddressModal] = useState(false);
```

### Step 3: Add Mutation
```typescript
const saveAddressMutation = useMutation({
  mutationFn: async (address: any) => {
    const response = await api.post("/api/delivery/addresses/", address);
    return response.data;
  },
  onSuccess: (newAddress) => {
    queryClient.invalidateQueries({ queryKey: ["saved-addresses"] });
    setSelectedAddress(newAddress);
    setShowAddressModal(false);
  },
});
```

### Step 4: Render Modal
```typescript
<AddressModal
  open={showAddressModal}
  onClose={() => setShowAddressModal(false)}
  onSave={(address) => saveAddressMutation.mutate(address)}
  loading={saveAddressMutation.isPending}
/>
```

## Backend Integration

### Endpoint: POST `/api/delivery/addresses/`

**Request:**
```json
{
  "address_type": "HOME",
  "title": "My Home",
  "address_line": "402, Lotus Apartments, Koramangala, Bengaluru",
  "landmark": "Near Park",
  "latitude": 12.9352,
  "longitude": 77.6245,
  "is_default": false
}
```

**Response:**
```json
{
  "id": 1,
  "address_type": "HOME",
  "title": "My Home",
  "address_line": "402, Lotus Apartments, Koramangala, Bengaluru",
  "latitude": 12.9352,
  "longitude": 77.6245,
  "is_default": false
}
```

## User Flow

### Adding a New Address

1. **Click "+ Add new address"** button on checkout address step
   ↓
2. **Modal Opens - Search Step**
   - User types address/landmark
   - Nominatim autocomplete suggests locations
   - User selects location
   ↓
3. **Validation**
   - Backend validates if location is within service area
   - Shows green checkmark if valid
   - Shows red alert if outside service area
   ↓
4. **Address Details Step**
   - Select address type (Home/Work/Other)
   - Enter label (e.g., "My Office")
   - Review/edit full address
   - Add landmark (optional)
   ↓
5. **Save**
   - POST to backend
   - Address added to user's list
   - Automatically selected for checkout
   ↓
6. **Return to Checkout**
   - Modal closes
   - New address shown in checkout
   - User continues with delivery slot selection

## Services Integration

### Geocoding Service (`src/services/geocoding.ts`)

Used by AddressModal for address search:
```typescript
// Debounced search with callback
searchAddressesDebounced(query: string, callback: (results) => void)

// Returns: LocationSuggestion[]
interface LocationSuggestion {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
}
```

### Location Validation (`src/services/locationValidation.ts`)

Used by AddressModal to check service area:
```typescript
async function validateLocation(latitude: number, longitude: number, address: string)

// Returns validation result from backend
{
  valid: boolean,
  message: string,
  serviceArea?: string
}
```

## Features & Validations

### ✅ Address Search
- Real-time suggestions as user types
- Limited to India (Nominatim configured)
- Max 8 suggestions per search
- 300ms debounce

### ✅ Location Validation
- Haversine formula distance calculation
- Service area boundaries (configurable in Django admin)
- Shows which service area covers the location
- Prevents checkout if outside service areas

### ✅ Address Management
- Multiple addresses per user
- Address type categories (Home, Work, Other)
- Landmarks for delivery instructions
- Set default address
- Edit existing addresses (via API)
- Delete addresses (via API)

### ✅ UX Polish
- Loading states during search/validation
- Success/error messaging
- Back button to change location
- Modal animation (slide-in from bottom)
- Keyboard support (can type naturally)
- Touch-friendly on mobile

## Database Schema

### DeliveryAddress Model
```python
class DeliveryAddress(models.Model):
    user = ForeignKey(User)
    address_type = CharField(choices=[HOME, WORK, OTHER])
    title = CharField(max_length=50)
    address_line = TextField()
    latitude = DecimalField(max_digits=9, decimal_places=6)
    longitude = DecimalField(max_digits=9, decimal_places=6)
    is_default = BooleanField(default=False)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

## Testing Checklist

- [ ] Search addresses in different areas
- [ ] Validate address inside service area (shows green)
- [ ] Try address outside service area (shows red)
- [ ] Save address with all fields
- [ ] Save address with minimal fields (landmark optional)
- [ ] Verify new address appears in address list
- [ ] Select newly saved address in checkout
- [ ] Edit saved address
- [ ] Delete saved address
- [ ] Add landmark and verify it appears

## Performance Optimizations

1. **Debounced Search**: 300ms delay prevents excessive API calls
2. **Query Caching**: React Query caches address list
3. **Lazy Loading**: Modal only loads when opened
4. **Optimistic Updates**: Address list invalidated after save
5. **Network**: Nominatim is free and fast (typically <100ms)

## Future Enhancements

- [ ] Google Maps integration for visual address selection
- [ ] Address autocomplete with postal codes
- [ ] Favorite addresses with quick select
- [ ] Address history from previous orders
- [ ] Drag to adjust location on map
- [ ] Share address via link
- [ ] Bulk import addresses
- [ ] Business hours based on location
