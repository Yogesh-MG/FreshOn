# Del_app Architecture & System Design

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEL_APP (Frontend)                          │
│  React + TypeScript + Vite + Tauri (Future)                     │
└───────────────────────┬─────────────────────────────────────────┘
                        │
            ┌───────────┼───────────┐
            │           │           │
            ▼           ▼           ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   apiClient  │ │   useAuth    │ │   Services   │
    │ (JWT + HTTP) │ │  (Context)   │ │  Layer       │
    └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
           │                 │                │
           └─────────────────┼────────────────┘
                             │
                    ┌────────▼────────┐
                    │  JWT Headers    │
                    │  Authorization  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌─────────────┐     ┌──────────────┐   ┌──────────────┐
   │  Django     │     │  Delivery    │   │  Auth        │
   │  Backend    │────▶│  Partner     │◀──│  (JWT)       │
   │             │     │  API         │   │              │
   └─────────────┘     └──────────────┘   └──────────────┘
        │                    │
        ▼                    ▼
   ┌──────────────────────────────────┐
   │   PostgreSQL Database            │
   │ ├─ auth_user                    │
   │ ├─ delivery_partner_profile     │
   │ ├─ delivery_assignment          │
   │ ├─ delivery_stop                │
   │ └─ proof_of_delivery            │
   └──────────────────────────────────┘
```

## 🔀 State Management Flow

```
Del_app State Tree:
─────────────────

┌─ AuthContext
│  ├─ user: DeliveryAuthUser | null
│  ├─ loading: boolean
│  ├─ isAuthenticated: boolean
│  └─ methods: login(), logout()
│
├─ Dashboard State (Index.tsx)
│  ├─ screen: "dashboard" | "mission"
│  ├─ online: boolean
│  ├─ assignments: Assignment[]
│  ├─ loading: boolean
│  └─ currentMission: Assignment | null
│
├─ Mission Detail State
│  ├─ selectedStop: Stop | null
│  ├─ completedStops: Set<string>
│  └─ isUploading: boolean
│
└─ Local Storage
   ├─ freshon_api_token (JWT)
   ├─ freshon_user (User data)
   └─ freshon_partner_user (legacy, to delete)
```

## 🔄 Component Interaction Diagram

```
App.tsx
│
├─ AuthProvider
│  │
│  ├─ Auth.tsx (route: /auth)
│  │  └─ backendAuthService.login()
│  │     └─ useAuth.signIn()
│  │
│  ├─ Index.tsx (route: /)
│  │  │
│  │  ├─ StatusToggle
│  │  │  └─ deliveryStatusService.updateStatus()
│  │  │
│  │  ├─ EarningsHeader
│  │  │  └─ deliveryStatusService.getEarnings()
│  │  │
│  │  ├─ MissionCard (if online)
│  │  │  └─ deliveryAssignmentService.acceptAssignment()
│  │  │
│  │  └─ [Mission Detail Screen]
│  │     │
│  │     ├─ RouteList
│  │     │  └─ deliveryAssignmentService.mark*()
│  │     │
│  │     └─ ProofDrawer
│  │        └─ deliveryStatusService.uploadProof()
│  │
│  └─ Onboarding.tsx (route: /onboarding)
│     └─ KYC form (future)
│
└─ 404 Not Found
```

## 📡 API Call Sequence Diagram

### Happy Path: Accept → Deliver

```
Del_app                          Django Backend
   │                                   │
   ├──GET /api/delivery-partner/      │
   │   assignments/────────────────────▶
   │                                   │ Query DB
   │◀────── [{Assignment}] ────────────┤
   │
   │ [User clicks Accept]
   │
   ├──POST /api/delivery-partner/     │
   │ assignments/{id}/accept/──────────▶
   │                                   │ Update Assignment.status
   │◀────── {Assignment} ──────────────┤
   │
   │ [User at hub location]
   │
   ├──POST /api/delivery-partner/     │
   │ assignments/{id}/pickup/ ─────────▶
   │                                   │ Update status = PICKED_UP
   │◀────── {message} ─────────────────┤
   │
   │ [User navigating to stop]
   │
   ├──POST /api/delivery-partner/     │
   │ assignments/{id}/transit/─────────▶ latitude, longitude
   │                                   │ Update status = IN_TRANSIT
   │◀────── {message} ─────────────────┤ Update GPS location
   │
   │ [Repeat for each stop...]
   │
   ├──POST /api/delivery-partner/     │
   │ assignments/{id}/deliver/─────────▶ otp_code, stop_id
   │                                   │ Create ProofOfDelivery
   │◀────── {message} ─────────────────┤ Update stop status
   │
   │ [All stops done]
   │
   ├──GET /api/delivery-partner/      │
   │    earnings/──────────────────────▶
   │                                   │ Calculate today's earnings
   │◀────── {earnings, ...} ───────────┤
   │
```

### Error Path: 401 Unauthorized

```
Del_app                          Django Backend
   │                                   │
   ├──GET /api/delivery-partner/      │
   │   assignments/────────────────────▶
   │   (stale JWT token)               │
   │                                   │ Validate token
   │◀────── 401 Unauthorized ──────────┤
   │
   │ [apiClient catches 401]
   │
   ├──Try refresh token OR redirect
   │   to login
   │
   │ [If refresh works]
   │
   ├──GET /api/delivery-partner/      │
   │   assignments/────────────────────▶ (new token)
   │                                   │
   │◀────── [{Assignment}] ────────────┤
```

## 🗂️ Folder Structure

### Before Integration

```
Del_app/
├── src/
│   ├── integrations/
│   │   └── supabase/            ❌ DELETE
│   ├── hooks/
│   │   └── useAuth.tsx          ⚠️ REPLACE
│   ├── lib/
│   │   └── freshon-data.ts      ⚠️ DELETE (mock)
│   ├── components/
│   │   └── StatusToggle.tsx     ⚠️ UPDATE
│   └── pages/
│       └── Auth.tsx             ⚠️ UPDATE
└── supabase/                    ❌ DELETE
```

### After Integration

```
Del_app/
├── src/
│   ├── lib/
│   │   ├── apiClient.ts              ✅ EXISTS
│   │   ├── backendAuthService.ts     ✨ NEW
│   │   ├── deliveryAssignmentService.ts ✨ NEW
│   │   ├── deliveryStatusService.ts  ✨ NEW
│   │   └── types.ts                  ✨ NEW
│   ├── hooks/
│   │   ├── useAuth.tsx               ✅ UPDATED
│   │   └── use-mobile.tsx
│   ├── components/
│   │   ├── StatusToggle.tsx          ✅ WIRED
│   │   ├── EarningsHeader.tsx        ✅ WIRED
│   │   ├── MissionCard.tsx           ✅ WIRED
│   │   ├── RouteList.tsx             ✅ WIRED
│   │   ├── ProofDrawer.tsx           ✅ WIRED
│   │   └── ... others
│   ├── pages/
│   │   ├── Auth.tsx                  ✅ WIRED
│   │   ├── Index.tsx                 ✅ WIRED
│   │   ├── Onboarding.tsx            ⏳ TODO
│   │   └── NotFound.tsx
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🔐 Authentication & Token Management

```
┌─────────────────────────────────────────┐
│        Authentication Lifecycle         │
└─────────────────────────────────────────┘

[Fresh Install]
    │
    ├─ App loads
    ├─ AuthProvider checks localStorage
    ├─ No stored user → Show Auth page
    │
    └─ User enters email + password
       │
       ▼
    [Login Flow]
       │
       ├─ backendAuthService.login(email, password)
       │  └─ POST /api/auth/login/
       │
       ├─ Server validates + returns JWT
       │  └─ {access_token, refresh_token, user}
       │
       ├─ apiClient.setToken(access_token)
       │  └─ Stored in memory + localStorage
       │
       ├─ User stored in localStorage
       │  └─ freshon_user
       │
       ├─ useAuth.signIn(user)
       │  └─ Updates context state
       │
       ▼
    [Dashboard Ready]
       │
       └─ All API calls now include:
          Authorization: Bearer {access_token}

[Subsequent Visits]
    │
    ├─ App loads
    ├─ AuthProvider checks localStorage
    ├─ Found stored user + token
    ├─ Skip to dashboard
    │
    └─ All API calls use cached token

[Token Refresh]
    │
    ├─ API returns 401 (token expired)
    │
    ├─ apiClient catches 401
    │
    ├─ Attempt refresh using refresh_token
    │  └─ POST /api/auth/refresh/
    │
    ├─ Get new access_token
    │  └─ apiClient.setToken(new_token)
    │
    └─ Retry original request

[Logout]
    │
    ├─ User clicks logout
    │
    ├─ backendAuthService.logout()
    │  └─ POST /api/auth/logout/ (optional)
    │
    ├─ Clear localStorage
    │
    ├─ Clear apiClient token
    │
    ├─ useAuth.logout()
    │  └─ Update context
    │
    └─ Redirect to login page
```

## 📊 Data Model Relationships

```
User (accounts_user)
  │
  ├─ 1:1 ──▶ DeliveryPartnerProfile
  │            ├─ vehicle_type
  │            ├─ vehicle_number
  │            ├─ is_online
  │            ├─ current_latitude
  │            ├─ current_longitude
  │            ├─ total_deliveries
  │            └─ total_earnings
  │
  └─ 1:N ──▶ DeliveryAssignment
               ├─ order (1:1 to Order)
               ├─ status (PENDING → ACCEPTED → PICKED_UP → IN_TRANSIT → DELIVERED)
               ├─ accepted_at
               ├─ in_transit_at
               ├─ delivered_at
               ├─ earnings
               ├─ distance_km
               │
               └─ 1:N ──▶ DeliveryStop
                            ├─ address
                            ├─ latitude
                            ├─ longitude
                            ├─ recipient_name
                            ├─ phone
                            └─ 1:N ──▶ ProofOfDelivery
                                        ├─ type (otp | photo)
                                        ├─ otp_code
                                        ├─ photo (image file)
                                        └─ created_at
```

## 🔌 API Integration Checklist

### Authentication
- [ ] POST /api/auth/login/ — Takes email, password
- [ ] POST /api/auth/logout/ — Clears session
- [ ] GET /api/auth/me/ — Returns current user
- [ ] POST /api/auth/refresh/ — Refresh JWT token

### Delivery Partner Status
- [ ] PATCH /api/delivery-partner/status/ — Set online, GPS
- [ ] GET /api/delivery-partner/earnings/ — Today's earnings

### Assignments
- [ ] GET /api/delivery-partner/assignments/ — All active
- [ ] POST /api/delivery-partner/assignments/{id}/accept/
- [ ] POST /api/delivery-partner/assignments/{id}/pickup/
- [ ] POST /api/delivery-partner/assignments/{id}/transit/
- [ ] POST /api/delivery-partner/assignments/{id}/deliver/

### Proof & Media
- [ ] POST /api/delivery-partner/proof/ — Upload photo

## ⚡ Performance Optimization Strategy

```
Initial Load:
  │
  ├─ Load JWT from localStorage (instant)
  ├─ Show cached dashboard (if exists)
  ├─ Fetch fresh data in background
  └─ Update UI when data arrives

Polling Strategy:
  │
  ├─ Assignments: Every 10s when online
  ├─ Earnings: Every 30s (user doesn't care often)
  ├─ Status: Updated on change only
  └─ Future: WebSocket for real-time

Image Optimization:
  │
  ├─ Compress before upload (500KB max)
  ├─ Show progress bar
  ├─ Store URL in backend
  └─ Display in offline mode

Caching Strategy:
  │
  ├─ localStorage: JWT + user metadata
  ├─ IndexedDB: Assignments list (future)
  ├─ Memory: Current mission details
  └─ Invalidate on logout
```

## 🎯 Testing Strategy

```
Unit Tests:
  ├─ backendAuthService.login()
  ├─ deliveryAssignmentService.acceptAssignment()
  ├─ deliveryStatusService.updateStatus()
  └─ Component rendering

Integration Tests:
  ├─ Login → Dashboard flow
  ├─ Accept mission → Mission detail
  ├─ Complete stops → Earnings update
  └─ Upload proof → Success

E2E Tests:
  ├─ Full fresh user flow
  ├─ Session persistence
  ├─ Network error handling
  └─ Logout & re-login
```

## 📈 Metrics to Track

```
Performance:
  ├─ Time to first paint
  ├─ API response times
  ├─ Photo upload speed
  └─ JWT refresh latency

User Experience:
  ├─ Login success rate
  ├─ Mission acceptance rate
  ├─ Proof upload success rate
  └─ Error recovery time

Business:
  ├─ Deliveries per partner
  ├─ Average delivery time
  ├─ Photo proof verification rate
  └─ Earnings accuracy
```

---

**Created**: May 7, 2026
**For**: Del_app Backend Integration
**Status**: Architecture Ready for Implementation
