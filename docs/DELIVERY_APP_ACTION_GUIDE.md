# Delivery App Implementation — Quick Action Guide

**Total Effort**: ~30 hours across 5 phases  
**Start Date**: May 11, 2026  
**Est. Completion**: May 15-16, 2026

---

## 🎯 Phase Breakdown

### Phase 1: Cleanup (4 hours) — DELETE FILES
```
✓ /Del_app/src/integrations/supabase/          (entire folder)
✓ /Del_app/supabase/                           (entire folder)
✓ Remove VITE_SUPABASE_* env vars
⚠ DELETE /Del_app/src/lib/freshon-data.ts      (after Phase 4)
```

### Phase 2: Auth Services (6 hours) — CREATE 3 FILES + REPLACE 1

| File | Type | Action | Size | Time |
|------|------|--------|------|------|
| `Del_app/src/lib/apiClient.ts` | NEW | Create HTTP wrapper with JWT | 350 lines | 1.5h |
| `Del_app/src/lib/backendAuthService.ts` | NEW | Backend auth service | 250 lines | 1.5h |
| `Del_app/src/hooks/useAuth.tsx` | REPLACE | New auth context | 300 lines | 1.5h |
| `Del_app/src/pages/Auth.tsx` | UPDATE | Wire backend login | +30 lines | 1.5h |

### Phase 3: API Services (6 hours) — CREATE 2 FILES + UPDATE 1

| File | Type | Action | Size | Time |
|------|------|--------|------|------|
| `Del_app/src/lib/deliveryAssignmentService.ts` | NEW | Assignments API | 200 lines | 1.5h |
| `Del_app/src/lib/deliveryStatusService.ts` | NEW | Status & earnings API | 150 lines | 1.5h |
| `Del_app/src/lib/types.ts` | UPDATE | Add/verify interfaces | +50 lines | 1.5h |

### Phase 4: Components (8 hours) — UPDATE 7 FILES

| File | Changes | Impact | Time |
|------|---------|--------|------|
| `Del_app/src/pages/Index.tsx` | Wire services, remove mock | High | 2h |
| `Del_app/src/components/freshon/StatusToggle.tsx` | Add `updateStatus()` call | Medium | 1h |
| `Del_app/src/components/freshon/EarningsHeader.tsx` | Add polling + real data | High | 1.5h |
| `Del_app/src/components/freshon/MissionCard.tsx` | Wire `acceptAssignment()` | High | 1h |
| `Del_app/src/components/freshon/RouteList.tsx` | Wire `markDelivered()` | High | 1.5h |
| `Del_app/src/components/freshon/ProofDrawer.tsx` | Wire photo/OTP upload | High | 1h |

### Phase 5: Testing (6 hours) — VALIDATE ALL

| Task | Duration | Deliverable |
|------|----------|-------------|
| Manual E2E flow test | 2h | Test report |
| Error handling verification | 1.5h | Fix list |
| Performance validation | 1h | Metrics |
| Bug fixes & refinement | 1.5h | Clean repo |

---

## 📋 File-by-File Implementation Order

### PHASE 2A: APIClient (1.5h)

**File**: `Del_app/src/lib/apiClient.ts` (NEW)

```typescript
// Key responsibilities:
// - Axios wrapper
// - JWT token management
// - Request/response interceptors
// - 401 redirect to /auth
// - Error handling

// Methods:
// - setToken(token)
// - getToken()
// - clearToken()
// - get/post/patch/put/delete()
// - postForm() for multipart
```

**Dependencies**: `npm install axios`

---

### PHASE 2B: BackendAuthService (1.5h)

**File**: `Del_app/src/lib/backendAuthService.ts` (NEW)

```typescript
// Key responsibilities:
// - Backend login with email + password
// - Logout
// - Get current user
// - Session restoration from localStorage

// Methods:
// - login(email, password) → { success, user, access_token, error }
// - logout() → { success, error }
// - getCurrentUser() → { success, user, error }
// - getStoredUser() → DeliveryAuthUser | null
// - hasValidToken() → boolean

// Integration points:
// - POST /api/auth/login/
// - POST /api/auth/logout/
// - GET /api/auth/me/
```

---

### PHASE 2C: Replace useAuth Hook (1.5h)

**File**: `Del_app/src/hooks/useAuth.tsx` (REPLACE)

```typescript
// Key responsibilities:
// - AuthContext with user, loading, isAuthenticated
// - AuthProvider wrapper
// - Restore session on mount
// - Provide login() and logout() to components

// Context shape:
// {
//   user: DeliveryAuthUser | null
//   loading: boolean
//   isAuthenticated: boolean
//   login(email, password) → Promise
//   logout() → Promise
// }

// Hook export:
// export const useAuth = () → AuthContextType
```

**Breaking changes**: 
- Old mock methods removed: `sendOtp()`, `verifyOtp()`
- New methods: `login()`, `logout()`

---

### PHASE 2D: Update Auth.tsx Page (1.5h)

**File**: `Del_app/src/pages/Auth.tsx` (UPDATE)

```typescript
// Changes:
// - Replace sendOtp/verifyOtp with login/logout
// - Form: email + password (not phone + OTP)
// - Call useAuth().login(email, password)
// - Handle error messages
// - Show loading state while logging in
// - Navigate to "/" on success
// - Navigate to "/onboarding" if !is_profile_complete
```

---

### PHASE 3A: DeliveryAssignmentService (1.5h)

**File**: `Del_app/src/lib/deliveryAssignmentService.ts` (NEW)

```typescript
// Static methods:
// - getAssignments() → Assignment[]
// - acceptAssignment(id) → Assignment
// - markPickedUp(id) → { message }
// - markInTransit(id, lat, lng) → { message }
// - markDelivered(id, { type, otp_code, stop_id }) → { message }

// API Endpoints:
// GET /api/delivery-partner/assignments/
// POST /api/delivery-partner/assignments/{id}/accept/
// POST /api/delivery-partner/assignments/{id}/pickup/
// POST /api/delivery-partner/assignments/{id}/transit/
// POST /api/delivery-partner/assignments/{id}/deliver/
```

---

### PHASE 3B: DeliveryStatusService (1.5h)

**File**: `Del_app/src/lib/deliveryStatusService.ts` (NEW)

```typescript
// Static methods:
// - updateStatus(online, latitude?, longitude?) → { message, online }
// - getEarnings() → EarningsStats
// - uploadProof(missionId, photo) → { url }

// API Endpoints:
// PATCH /api/delivery-partner/status/
// GET /api/delivery-partner/earnings/
// POST /api/delivery-partner/proof/
```

---

### PHASE 3C: Update types.ts (1.5h)

**File**: `Del_app/src/lib/types.ts` (UPDATE)

```typescript
// Verify/add exports:
// - Assignment (matches backend DeliveryAssignment)
// - Stop (matches backend DeliveryStop)
// - EarningsStats (matches backend response)
// - DeliveryPartnerProfile (if needed)
// - ProofOfDelivery (if needed)

// Ensure all fields match backend serializers
```

---

### PHASE 4A: Update Index.tsx Dashboard (2h)

**File**: `Del_app/src/pages/Index.tsx` (UPDATE)

```typescript
// Changes:
// 1. Remove freshon-data.ts imports
// 2. useEffect: Fetch assignments on mount
// 3. useEffect: Poll earnings every 30s
// 4. handleStatusToggle → call updateStatus()
// 5. handleAccept → call acceptAssignment()
// 6. handleComplete → call markDelivered()
// 7. handleRefresh → call getAssignments()
// 8. Wire services to components via props

// Props to pass down:
// - <StatusToggle online={online} onToggle={handleStatusToggle} />
// - <EarningsHeader stats={earnings} />
// - <MissionCard onAccept={handleAccept} />
// - <RouteList onComplete={handleComplete} />
```

---

### PHASE 4B: Update StatusToggle (1h)

**File**: `Del_app/src/components/freshon/StatusToggle.tsx` (UPDATE)

```typescript
// Props:
// - online: boolean
// - onToggle: (newOnline: boolean) => Promise<void>
// - loading?: boolean

// Changes:
// - Add disabled state during transition
// - Call onToggle on click
// - Show loading indicator
// - Handle errors (try-catch)
```

---

### PHASE 4C: Update EarningsHeader (1.5h)

**File**: `Del_app/src/components/freshon/EarningsHeader.tsx` (UPDATE)

```typescript
// Props:
// - stats: EarningsStats
// - loading?: boolean

// Removed:
// - Mock data generation

// Display:
// - stats.earnings
// - stats.goal
// - stats.deliveries
// - stats.distance
// - stats.rating
// - Progress bar: (earnings / goal) * 100
```

---

### PHASE 4D: Update MissionCard (1h)

**File**: `Del_app/src/components/freshon/MissionCard.tsx` (UPDATE)

```typescript
// Props:
// - assignment: Assignment
// - onAccept: (id: string) => Promise<void>
// - loading?: boolean

// Changes:
// - Display from assignment object (not mock)
// - Call onAccept on button click
// - Show loading state during accept
// - Handle errors
```

---

### PHASE 4E: Update RouteList (1.5h)

**File**: `Del_app/src/components/freshon/RouteList.tsx` (UPDATE)

```typescript
// Props:
// - stops: Stop[]
// - onMarkComplete: (stopId, proofType, otpCode?) => Promise
// - loading?: boolean

// Changes:
// - Display stops from assignment.stops
// - Show completion dialog on stop click
// - Collect OTP or photo
// - Call onMarkComplete with proof
// - Mark stop as completed
// - Disable button if all stops done
```

---

### PHASE 4F: Update ProofDrawer (1h)

**File**: `Del_app/src/components/freshon/ProofDrawer.tsx` (UPDATE)

```typescript
// Props:
// - open: boolean
// - stopId: string
// - onConfirm: (type, otpCode?, photoFile?) => Promise
// - onCancel: () => void

// Changes:
// - Two modes: OTP vs Photo
// - OTP: 6-digit input validation
// - Photo: File input + preview
// - Call onConfirm with proof data
// - Handle upload progress
```

---

## 🧪 Testing Phases

### Mini-Test After Each Phase

**After Phase 2 (Auth)**:
```
✓ Can login with valid email/password
✓ Error on invalid credentials
✓ Token stored in localStorage
✓ Page refresh preserves session
✓ Logout clears token
```

**After Phase 3 (Services)**:
```
✓ getAssignments() returns array
✓ acceptAssignment() updates status
✓ updateStatus() works
✓ getEarnings() returns stats
✓ uploadProof() handles files
```

**After Phase 4 (Components)**:
```
✓ Dashboard loads assignments
✓ Status toggle works
✓ Earnings update every 30s
✓ Accept mission works
✓ Complete stop works
✓ All flows end-to-end
```

**After Phase 5 (Final)**:
```
✓ No console errors
✓ No API failures
✓ Responsive on mobile
✓ Performance < 3s TTI
✓ Error messages clear
```

---

## 🚀 Quick Start Commands

### Install Dependencies
```bash
cd Del_app
npm install axios
```

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Tests (if any)
```bash
npm run test
```

---

## 📊 Status Tracking

Track progress in this table:

| Phase | Task | Status | Owner | Done |
|-------|------|--------|-------|------|
| 1 | Delete supabase | ⏳ TODO | — | |
| 2 | Create apiClient | ⏳ TODO | — | |
| 2 | Create backendAuthService | ⏳ TODO | — | |
| 2 | Replace useAuth | ⏳ TODO | — | |
| 2 | Update Auth.tsx | ⏳ TODO | — | |
| 3 | Create deliveryAssignmentService | ⏳ TODO | — | |
| 3 | Create deliveryStatusService | ⏳ TODO | — | |
| 3 | Update types.ts | ⏳ TODO | — | |
| 4 | Update Index.tsx | ⏳ TODO | — | |
| 4 | Update StatusToggle | ⏳ TODO | — | |
| 4 | Update EarningsHeader | ⏳ TODO | — | |
| 4 | Update MissionCard | ⏳ TODO | — | |
| 4 | Update RouteList | ⏳ TODO | — | |
| 4 | Update ProofDrawer | ⏳ TODO | — | |
| 5 | Manual testing | ⏳ TODO | — | |
| 5 | Bug fixes | ⏳ TODO | — | |

---

## 🎓 Key Learnings & References

### Backend Endpoints Used
- `POST /api/auth/login/` — Centralized auth
- `GET /api/delivery-partner/assignments/` — Fetch available deliveries
- `POST /api/delivery-partner/assignments/{id}/accept/` — Accept mission
- `POST /api/delivery-partner/assignments/{id}/deliver/` — Record proof
- `PATCH /api/delivery-partner/status/` — Toggle online status
- `GET /api/delivery-partner/earnings/` — Fetch earnings

### Technologies
- **Frontend**: React 18 + TypeScript + Vite
- **HTTP**: Axios (new dependency)
- **State**: React hooks (Context API)
- **Styling**: Tailwind CSS
- **Routing**: React Router v6

### File Locations (Reference)
- Backend: `backend/apps/delivery_partner/`
- Frontend: `Del_app/src/`
- API docs: `docs/API_DOCS.md`
- Schema: `docs/DATABASE_SCHEMA.md`

---

**Next Step**: Start Phase 1 (cleanup) — estimated 4 hours  
**Report**: See `DELIVERY_APP_IMPLEMENTATION_REPORT.md` for full details
