# Quick Start Guide - Backend Integration

## 1. Setup (5 minutes)

### Create `.env` file
```bash
cd Fpick_app
cat > .env << 'EOF'
VITE_API_URL=http://localhost:8000
VITE_ENABLE_OFFLINE_MODE=true
VITE_LOG_API_CALLS=true
EOF
```

### Install & Start
```bash
# Terminal 1: Start backend
cd backend
python manage.py runserver 0.0.0.0:8000

# Terminal 2: Start Fpick app
cd Fpick_app
bun install
bun run dev

# Open http://localhost:5173
```

## 2. Test Checklist

### ✅ Location Screen
- [ ] Geolocation enabled
- [ ] Shows distance to hub
- [ ] "INSIDE" appears when close (< 150m)

### ✅ Login Screen
- [ ] Enter picker ID (demo: `7841`)
- [ ] Create 4-digit PIN
- [ ] Confirm PIN
- [ ] Backend verification shows success
- [ ] Shift start logged

### ✅ Dashboard
- [ ] Orders loaded from `/api/picker/queue/`
- [ ] Shows order count
- [ ] Order list displays correctly
- [ ] Mock orders if backend unavailable

### ✅ Picking
- [ ] Accept order succeeds
- [ ] Camera opens for scanning
- [ ] Barcode scans and validates
- [ ] Item marked as packed
- [ ] Handover completes

## 3. File Locations

### New Service Files (5)
```
src/lib/
├── apiClient.ts              (HTTP client + auth)
├── backendAuthService.ts     (Login + PIN)
├── pickerOrderService.ts     (Orders + scanning)
├── shiftService.ts           (Shift logging)
└── config.ts                 (Configuration)
```

### Updated Component Files (5)
```
src/components/
├── PinLogin.tsx              (Backend auth + shift)
├── GeoGate.tsx               (Geo verification)
├── Dashboard.tsx             (Order queue)
├── PickingScreen.tsx         (Scan verification)
└── Index.tsx                 (Router + convert)
```

### Documentation (4)
```
Fpick_app/
├── BACKEND_INTEGRATION.md    (Service API reference)
├── DEPLOYMENT.md             (Deploy + test guide)
├── BACKEND_CONNECTION_COMPLETE.md (This status)
└── .env.example              (Config template)
```

## 4. Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | http://localhost:8000 | Backend API URL |
| `VITE_ENABLE_OFFLINE_MODE` | true | Use localStorage fallback |
| `VITE_USE_MOCK_ORDERS` | false | Dev without backend |
| `VITE_LOG_API_CALLS` | true | API call logging |
| `VITE_HUB_LOCATION` | 40.7128,-74.0060 | Hub coordinates |
| `VITE_HUB_RADIUS` | 150 | Geofence radius (m) |
| `VITE_DEBUG_MODE` | false | Show debug info |

## 5. API Endpoints Integrated

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/auth/login/ | Email/password login |
| POST | /api/picker/login-pin/ | PIN login |
| POST | /api/picker/setup-pin/ | PIN setup |
| POST | /api/picker/geo-verify/ | Location check |
| GET | /api/picker/queue/ | Get orders |
| POST | /api/picker/queue/{id}/accept/ | Accept order |
| POST | /api/picker/queue/{id}/scan/ | Verify barcode |
| POST | /api/picker/queue/{id}/pack/ | Mark packed |
| POST | /api/picker/queue/{id}/handover/ | Hand to delivery |
| POST | /api/picker/shift-start/ | Start shift |
| POST | /api/picker/shift-end/ | End shift |

## 6. Troubleshooting

**Orders not loading:**
```
1. Check VITE_API_URL is correct
2. Verify backend running: curl http://localhost:8000/api/picker/queue/
3. Check user has role='PICKER' in database
4. View browser console for [API] errors
```

**Login fails:**
```
1. Verify user exists in Django admin
2. Check PickerProfile is created for user
3. Test backend endpoint: curl -X POST http://localhost:8000/api/picker/login-pin/ \
   -H "Content-Type: application/json" \
   -d '{"employee_id":"7841","pin":"1234"}'
4. Clear localStorage: localStorage.clear()
```

**Barcode scanning fails:**
```
1. Ensure item exists in order
2. Check SKU matches batch_code in database
3. Verify endpoint exists: /api/picker/queue/{id}/scan/
4. Check backend response in DevTools Network tab
```

## 7. Next Steps

1. **Setup:** Create `.env` and start backend ← **DO THIS FIRST**
2. **Test Login:** Verify PIN setup/login works with backend
3. **Test Orders:** Confirm queue loads from API
4. **Test Scanning:** Verify barcode validation works
5. **Test Mobile:** Build APK and test on device (`npx tauri android build`)
6. **Production:** Deploy to production API URL

## 8. Files to Read

- **BACKEND_INTEGRATION.md** - Full service documentation + examples
- **DEPLOYMENT.md** - Complete deployment & testing guide
- **backend/apps/picker/views.py** - Backend endpoint implementations

---

**Status:** ✅ Backend integration complete - ready to test!
