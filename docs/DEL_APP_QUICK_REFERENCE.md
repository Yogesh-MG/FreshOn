# Del_app Integration — Quick Reference

## 📊 Dependency Graph
```
Auth Page (Auth.tsx)
    ↓
backendAuthService.login()
    ↓ (sets JWT)
apiClient (headers)
    ↓
Dashboard (Index.tsx)
    ├→ deliveryAssignmentService.getAssignments()
    ├→ StatusToggle → deliveryStatusService.updateStatus()
    ├→ EarningsHeader → deliveryStatusService.getEarnings()
    └→ MissionCard → deliveryAssignmentService.acceptAssignment()
         ↓
    Mission Detail (Index.tsx - mission screen)
    ├→ RouteList
    │   ├→ deliveryAssignmentService.markPickedUp()
    │   ├→ deliveryAssignmentService.markInTransit()
    │   └→ deliveryAssignmentService.markDelivered()
    └→ ProofDrawer
        └→ deliveryStatusService.uploadProof()
```

## 🔑 Key Services to Create

| Service | Location | Methods | Purpose |
|---------|----------|---------|---------|
| **backendAuthService** | `lib/backendAuthService.ts` | login, logout, getCurrentUser, getStoredUser | Backend authentication |
| **deliveryAssignmentService** | `lib/deliveryAssignmentService.ts` | getAssignments, acceptAssignment, markPickedUp, markInTransit, markDelivered | Manage deliveries |
| **deliveryStatusService** | `lib/deliveryStatusService.ts` | updateStatus, getEarnings, uploadProof | Status & earnings |

## 📱 Components to Update

| Component | File | Changes |
|-----------|------|---------|
| **StatusToggle** | `components/StatusToggle.tsx` | Call `updateStatus()` on toggle |
| **EarningsHeader** | `components/EarningsHeader.tsx` | Fetch from `getEarnings()`, poll every 30s |
| **MissionCard** | `components/MissionCard.tsx` | Call `acceptAssignment()` on accept |
| **RouteList** | `components/RouteList.tsx` | Call `mark*()` endpoints for each action |
| **ProofDrawer** | `components/ProofDrawer.tsx` | Call `uploadProof()` with FormData |
| **Auth** | `pages/Auth.tsx` | Call `login()` instead of mock |
| **Index** | `pages/Index.tsx` | Fetch assignments, manage state |

## 🗑️ Files to Delete

```
Del_app/src/integrations/supabase/     (entire folder)
Del_app/supabase/                       (entire folder)
Del_app/src/lib/freshon-data.ts         (mock data, after wiring)
```

## 🪝 Hooks to Replace

| Old | New |
|-----|-----|
| `useAuth()` from local mock | `useAuth()` using `backendAuthService` |

## 🧵 Data Flow: Accept to Deliver

```
1. User sees dashboard with missions
   ↓
2. Calls GET /api/delivery-partner/assignments/
   ↓
3. Shows MissionCard with acceptance button
   ↓
4. User clicks Accept → POST /api/delivery-partner/assignments/{id}/accept/
   ↓
5. Navigation to mission detail screen (RouteList)
   ↓
6. Show stops in optimized order
   ↓
7. For each stop:
   - User at location
   - Click "Complete" → POST /api/delivery-partner/assignments/{id}/deliver/
   - Provide proof (OTP or photo) → POST /api/delivery-partner/proof/
   ↓
8. All stops complete → GET /api/delivery-partner/earnings/
   ↓
9. Show earnings updated in real-time
```

## 🔐 Authentication Flow

```
1. Fresh app load
   ↓
2. Check localStorage for stored user → useAuth
   ↓
3. If found → Skip to dashboard
   ↓
4. If not → Show Auth page
   ↓
5. Email + Password entry
   ↓
6. POST /api/auth/login/ (via backendAuthService)
   ↓
7. Receive JWT token
   ↓
8. apiClient.setToken() → adds to all future requests
   ↓
9. Stored in localStorage
   ↓
10. User data stored → useAuth state
   ↓
11. Redirect to /onboarding or /dashboard
```

## 🌐 API Contract Summary

| Endpoint | Method | Auth | Params | Returns |
|----------|--------|------|--------|---------|
| `/api/auth/login/` | POST | None | email, password | {access_token, user} |
| `/api/auth/logout/` | POST | JWT | — | {message} |
| `/api/auth/me/` | GET | JWT | — | {user} |
| `/api/delivery-partner/assignments/` | GET | JWT | — | [{Assignment}] |
| `/api/delivery-partner/assignments/{id}/accept/` | POST | JWT | — | {Assignment} |
| `/api/delivery-partner/assignments/{id}/pickup/` | POST | JWT | — | {message} |
| `/api/delivery-partner/assignments/{id}/transit/` | POST | JWT | latitude, longitude | {message} |
| `/api/delivery-partner/assignments/{id}/deliver/` | POST | JWT | type, otp_code, stop_id | {message} |
| `/api/delivery-partner/status/` | PATCH | JWT | online, latitude, longitude | {message, online} |
| `/api/delivery-partner/proof/` | POST | JWT | mission_id, photo (multipart) | {url} |
| `/api/delivery-partner/earnings/` | GET | JWT | — | {earnings, goal, deliveries, distance, rating} |

## 📋 Implementation Checklist

### Phase 1: Cleanup (4h)
- [ ] Delete `/Del_app/src/integrations/supabase/`
- [ ] Delete `/Del_app/supabase/`
- [ ] Remove Supabase env vars

### Phase 2: Auth (6h)
- [ ] Create `backendAuthService.ts`
- [ ] Create new `useAuth.tsx`
- [ ] Update `Auth.tsx`
- [ ] Test login

### Phase 3: Services (6h)
- [ ] Create `deliveryAssignmentService.ts`
- [ ] Create `deliveryStatusService.ts`
- [ ] Add types & interfaces
- [ ] Add error handling

### Phase 4: Components (8h)
- [ ] Update `StatusToggle.tsx`
- [ ] Update `EarningsHeader.tsx`
- [ ] Update `MissionCard.tsx`
- [ ] Update `Index.tsx`
- [ ] Update `RouteList.tsx`
- [ ] Update `ProofDrawer.tsx`
- [ ] Update `Auth.tsx` page

### Phase 5: Testing (6h)
- [ ] Manual test each component
- [ ] Test E2E flow
- [ ] Test error handling
- [ ] Fix bugs

## ⚡ Quick Start Template

**backendAuthService.ts**:
```typescript
import { apiClient } from "./apiClient";

export class BackendAuthService {
  static async login(email: string, password: string) {
    const res = await apiClient.post("/api/auth/login/", { email, password });
    if (res.data?.access_token) {
      apiClient.setToken(res.data.access_token);
    }
    return res.data;
  }
}
```

**deliveryAssignmentService.ts**:
```typescript
import { apiClient } from "./apiClient";

export class DeliveryAssignmentService {
  static async getAssignments() {
    return apiClient.get("/api/delivery-partner/assignments/");
  }
  
  static async acceptAssignment(id: string) {
    return apiClient.post(`/api/delivery-partner/assignments/${id}/accept/`);
  }
}
```

**Component Usage**:
```typescript
import { deliveryAssignmentService } from "@/lib/deliveryAssignmentService";

const handleAccept = async () => {
  const res = await deliveryAssignmentService.acceptAssignment(missionId);
  if (res.data) {
    // Success
  } else {
    // Error
  }
};
```

## 🎯 Success Metrics

- ✅ Login works with real backend
- ✅ Dashboard loads assignments
- ✅ Can accept, pickup, transit, deliver
- ✅ Photo upload works
- ✅ Earnings update in real-time
- ✅ Session persists across restarts
- ✅ All errors handled gracefully

## 🚀 Expected Outcome

After implementation, the delivery partner can:

1. **Login** with email/password
2. **Go online** and see available missions
3. **Accept** a delivery mission
4. **Navigate** to stops using GPS
5. **Complete** each stop with proof
6. **Track** earnings in real-time
7. **Stay logged in** across restarts

This closes the **Consumer → Picker → Delivery → Delivered** loop and demonstrates the full MVP pipeline! 🎉

---

**Status**: Ready to implement
**Next**: Follow DEL_APP_INTEGRATION_PLAN.md for detailed steps
