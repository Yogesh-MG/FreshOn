# Backend Integration Guide

## Overview
The Fpick app has been fully integrated with the Freshon backend API. All authentication, order management, and picking operations now connect to the Django backend.

## Services Created

### 1. **apiClient.ts** - HTTP Client
Base HTTP client with:
- Request/response handling
- Bearer token authentication
- Automatic error handling
- Support for GET, POST, PATCH, DELETE methods

**Usage:**
```typescript
import { apiClient } from '@/lib/apiClient';

// Configure API URL
apiClient.setBaseUrl('http://localhost:8000');

// Make requests
const response = await apiClient.get('/api/picker/queue/');
const response = await apiClient.post('/api/auth/login/', { email, password });
```

### 2. **backendAuthService.ts** - Authentication
Handles login, logout, PIN setup/verification, and token management.

**Key Methods:**
- `login(credentials)` - Login with email/password
- `loginWithPin(employeeId, pin)` - Login with PIN
- `setupPin(employeeId, pin)` - Setup PIN on first login
- `verifyPetpoojaAttendance(employeeId)` - Check Petpooja status
- `logout()` - Logout and clear tokens
- `getCurrentUser()` - Get current user profile

**Usage:**
```typescript
import { backendAuthService } from '@/lib/backendAuthService';

const result = await backendAuthService.login({
  email: 'picker@freshon.in',
  password: 'password123'
});

if (result.success) {
  console.log('User:', result.user);
}
```

### 3. **pickerOrderService.ts** - Order Management
Handles all picking operations with the backend.

**Key Methods:**
- `geoVerify(latitude, longitude)` - Verify picker location
- `getQueue()` - Get all orders available to pick
- `acceptOrder(orderId)` - Accept an order
- `scanItem(orderId, itemId, barcode)` - Verify a scanned barcode
- `packOrder(orderId)` - Mark order as fully packed
- `handoverOrder(orderId)` - Hand over to delivery
- `getOrder(orderId)` - Get order details
- `markItemIssue(orderId, itemId, reason, substitutionSku)` - Mark issue/substitution

**Usage:**
```typescript
import { pickerOrderService } from '@/lib/pickerOrderService';

// Get queue
const result = await pickerOrderService.getQueue();
if (result.success) {
  console.log('Orders:', result.orders);
}

// Verify barcode scan
const scanRes = await pickerOrderService.scanItem(orderId, itemId, 'SKU-12345');
if (scanRes.verified) {
  console.log('Item verified!');
}
```

### 4. **shiftService.ts** - Attendance Logging
Logs shift start/end, breaks, and location check-ins.

**Key Methods:**
- `logShiftStart(deviceId)` - Log when shift starts
- `logShiftEnd(deviceId)` - Log when shift ends
- `logBreakStart()` - Log break start
- `logBreakEnd()` - Log break end
- `logLocationCheckIn(lat, lng, accuracy)` - Periodic location logging
- `getCurrentShift()` - Get current shift details
- `getShiftHistory(days)` - Get past shifts

**Usage:**
```typescript
import { shiftService } from '@/lib/shiftService';

// Start shift
const result = await shiftService.logShiftStart('mobile-device');
if (result.success) {
  console.log('Shift started:', result.shift);
}
```

## Component Updates

### **PinLogin.tsx**
- Now uses `backendAuthService.loginWithPin()` for PIN verification
- Falls back to local storage if backend is unavailable
- Logs shift start on successful login via `shiftService.logShiftStart()`

### **GeoGate.tsx**
- Uses `pickerOrderService.geoVerify()` to verify location with backend
- Real GPS location verification against hub coordinates
- Respects backend-configured geofence radius

### **Dashboard.tsx**
- Fetches orders from backend via `pickerOrderService.getQueue()`
- Real-time order list from database
- Falls back to mock data if backend unavailable

### **PickingScreen.tsx**
- Calls `pickerOrderService.scanItem()` to verify barcodes
- Updates order state on backend via `pickerOrderService.packOrder()`
- Reports issues with `pickerOrderService.markItemIssue()`

### **Index.tsx** (Main Router)
- Automatically loads orders from backend when logging in
- Converts backend PickerTask objects to UI Order format
- Handles authentication state checks on app mount

## Environment Configuration

Create a `.env` file in `Fpick_app/` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# Or for production:
# VITE_API_URL=https://api.freshon.in

# Feature flags
VITE_ENABLE_OFFLINE_MODE=true
VITE_LOG_API_CALLS=true
```

The API URL can also be changed at runtime:
```typescript
import { apiClient } from '@/lib/apiClient';
apiClient.setBaseUrl('https://api.freshon.in');
```

## API Endpoints Used

### Authentication
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `GET /api/auth/me/` - Get current user
- `POST /api/picker/login-pin/` - PIN-based login
- `POST /api/picker/setup-pin/` - Setup PIN
- `POST /api/picker/verify-attendance/` - Verify attendance

### Picking Operations
- `POST /api/picker/geo-verify/` - Verify location at hub
- `GET /api/picker/queue/` - Get order queue
- `POST /api/picker/queue/{id}/accept/` - Accept order
- `POST /api/picker/queue/{id}/scan/` - Verify scanned barcode
- `POST /api/picker/queue/{id}/pack/` - Mark as packed
- `POST /api/picker/queue/{id}/handover/` - Hand to delivery
- `GET /api/picker/queue/{id}/` - Get order details

### Shift Management
- `POST /api/picker/shift-start/` - Log shift start
- `POST /api/picker/shift-end/` - Log shift end
- `POST /api/picker/break-start/` - Log break start
- `POST /api/picker/break-end/` - Log break end
- `POST /api/picker/location-checkin/` - Log location
- `GET /api/picker/current-shift/` - Get current shift
- `GET /api/picker/shift-history/` - Get past shifts

## Authentication Flow

1. **First Login:**
   ```
   GeoGate (location verification)
   ↓
   PinLogin (Employee ID entry)
   ↓
   PIN Setup & Confirmation
   ↓
   Petpooja Verification
   ↓
   Shift Start Logging
   ↓
   Dashboard (orders loaded)
   ```

2. **Subsequent Logins:**
   ```
   GeoGate (location verification)
   ↓
   PinLogin (PIN entry only)
   ↓
   Backend PIN Verification + Shift Start
   ↓
   Dashboard
   ```

## Offline Support

The app includes fallback mechanisms:

- **Local Storage:** PIN and auth state stored locally for offline access
- **localStorage API:** Persists token and user data
- **Mock Data:** Dashboard falls back to mock orders if API fails
- **Hybrid Auth:** Can use local PIN verification if backend unavailable

## Error Handling

All services return consistent response format:

```typescript
{
  success: boolean;
  data?: T;        // Actual data if successful
  error?: string;  // Error message if failed
}
```

**Example:**
```typescript
const result = await pickerOrderService.getQueue();

if (result.success) {
  // Use result.data
  const orders = result.orders;
} else {
  // Handle error
  console.error('Error:', result.error);
}
```

## Testing the Integration

1. **Start Backend:**
   ```bash
   cd backend
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Configure API URL:**
   - Set `VITE_API_URL` in `.env` file
   - Or call `apiClient.setBaseUrl()` in code

3. **Run Fpick App:**
   ```bash
   cd Fpick_app
   npm run dev
   ```

4. **Test Login Flow:**
   - Create test picker user in Django admin
   - Use credentials to login
   - Verify order queue loads from backend

## Next Steps

1. **Set Backend URL:** Configure `VITE_API_URL` environment variable
2. **Test Authentication:** Verify login works with backend
3. **Test Order Queue:** Confirm orders load from `GET /api/picker/queue/`
4. **Test Scanning:** Verify barcode scanning calls backend
5. **Test Shift Logging:** Confirm shift start/end logs to backend
6. **Deploy:** Push to production with correct API URL

## Troubleshooting

### API Connection Fails
- Check `VITE_API_URL` is correct
- Verify backend is running
- Check CORS headers in backend
- Ensure token is being sent with `Authorization` header

### Orders Not Loading
- Check `/api/picker/queue/` endpoint exists
- Verify user has picker role in backend
- Check browser console for API errors
- Fall back to mock data (automatic)

### Scan Verification Fails
- Check item SKU matches backend batch_code
- Verify item exists in order
- Check `/api/picker/queue/{id}/scan/` response
- Ensure barcode format is correct

### Shift Logging Fails
- Check user has shift permissions
- Verify device_id is being sent
- Check backend shift models exist
- Review Django admin for shift records
