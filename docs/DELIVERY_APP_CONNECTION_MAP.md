# Delivery App Backend Integration — Visual Connection Map

---

## 🔌 Component → Service → API Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DELIVERY APP FRONTEND                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                     Dashboard (Index.tsx)                       │    │
│  └────────┬───────────────────────────────────────────────────────┘    │
│           │                                                              │
│  ┌────────▼──────────────────────────────────────────────────────┐     │
│  │         useEffect → Fetch Assignments & Earnings              │     │
│  └────────┬──────────────────────────────────────────────────────┘     │
│           │                                                              │
│  ┌────────┴─────────────────────────────────────────────────────┐      │
│  │                   State Management                            │      │
│  ├────────────────────────────────────────────────────────────┤      │
│  │ • assignments: Assignment[]                                │      │
│  │ • earnings: EarningsStats                                  │      │
│  │ • online: boolean                                          │      │
│  │ • currentScreen: "dashboard" | "mission"                   │      │
│  └─┬──────────────────────────────────────────────────────────┘      │
│    │                                                              │
│    ├─────────────────────────────┬─────────────────────────────┤
│    │                             │                             │
│    ▼                             ▼                             ▼
│ ┌──────────┐        ┌─────────────────┐        ┌─────────────────┐
│ │StatusToggle       │EarningsHeader    │        │MissionCard      │
│ │                   │                 │        │                 │
│ │onToggle()─────────►updateStatus()◄──┼────────►acceptAssignment()
│ │                   │                 │        │onAccept()       │
│ └──────────┘        └─────────────────┘        └─────────────────┘
│                            │                             │
│                            │ (Poll every 30s)          │ (on click)
│                            ▼                             ▼
│                     ┌──────────────┐        ┌─────────────────────┐
│                     │RouteList     │        │MissionDetail Screen │
│                     │              │        │                     │
│                     │onComplete()──┼───────►RouteList             │
│                     │              │        │ProofDrawer          │
│                     └──────────────┘        └─────────────────────┘
└─────────────────────────────────────────────────────────────────────────┘

                              ▼

┌──────────────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER (lib/*.ts)                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────┐    ┌──────────────────┐   ┌──────────────────┐    │
│  │BackendAuthService│    │DeliveryAssignment │   │DeliveryStatus    │    │
│  │                  │    │Service             │   │Service           │    │
│  ├──────────────────┤    ├──────────────────┤   ├──────────────────┤    │
│  │login()           │    │getAssignments()  │   │updateStatus()    │    │
│  │logout()          │    │acceptAssignment()│   │getEarnings()     │    │
│  │getCurrentUser()  │    │markPickedUp()    │   │uploadProof()     │    │
│  │getStoredUser()   │    │markInTransit()   │   │                  │    │
│  │hasValidToken()   │    │markDelivered()   │   │                  │    │
│  └──────────────────┘    └──────────────────┘   └──────────────────┘    │
│         │                        │                       │                │
│         ▼ (via apiClient)        ▼                       ▼                │
└──────────────────────────────────────────────────────────────────────────┘

                              ▼

┌──────────────────────────────────────────────────────────────────────────┐
│                      API CLIENT (lib/apiClient.ts)                       │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  • Axios wrapper                                                         │
│  • JWT token injection (Authorization: Bearer {token})                   │
│  • Request interceptors (add token to headers)                           │
│  • Response interceptors (handle 401, redirect to /auth)                 │
│  • Methods: get, post, patch, put, delete, postForm                      │
│  • Token management: setToken, getToken, clearToken                      │
│                                                                           │
└────────────────────────────────┬─────────────────────────────────────────┘

                        HTTP LAYER (axios)

┌────────────────────────────────┬─────────────────────────────────────────┐
│        BACKEND API (Django REST Framework)                               │
├────────────────────────────────┬─────────────────────────────────────────┤
│                                │                                         │
│  Authentication (Shared)       │  Delivery Partner (apps/delivery_partner)
│  ──────────────────────        │  ─────────────────────────────────────
│  POST   /api/auth/login/       │  GET    /assignments/
│  POST   /api/auth/logout/      │  POST   /assignments/{id}/accept/
│  GET    /api/auth/me/          │  POST   /assignments/{id}/pickup/
│                                │  POST   /assignments/{id}/transit/
│                                │  POST   /assignments/{id}/deliver/
│                                │  PATCH  /status/
│                                │  GET    /earnings/
│                                │  POST   /proof/
│                                │
└─────────────────────────────────────────────────────────────────────────┘

                      ▼ (Database Queries)

┌────────────────────────────────────────────────────────────────────────────┐
│                          PostgreSQL Database                               │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  users                 delivery_partner_profile    delivery_assignment    │
│  ├─ id                 ├─ user_id (FK)            ├─ id                   │
│  ├─ email              ├─ vehicle_type            ├─ order_id (FK)        │
│  ├─ role: DELIVERY     ├─ is_online               ├─ partner_id (FK)      │
│  ├─ username           ├─ latitude/longitude      ├─ status               │
│  ├─ first_name         ├─ total_deliveries       ├─ earnings             │
│  └─ last_name          └─ total_earnings         ├─ distance_km          │
│                                                   └─ created_at           │
│                                                                            │
│  delivery_stop              proof_of_delivery                              │
│  ├─ id                      ├─ id                                          │
│  ├─ assignment_id (FK)      ├─ assignment_id (FK)                         │
│  ├─ type: pickup|dropoff    ├─ stop_id (FK)                               │
│  ├─ label                   ├─ type: otp|photo                            │
│  ├─ address                 ├─ otp_code                                   │
│  ├─ customer_name           ├─ otp_verified                               │
│  └─ is_completed            └─ photo (S3 URL)                             │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 📡 Request/Response Examples

### 1. Login Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend: Auth.tsx                                          │
│ User clicks "Login"                                         │
└─────────────────┬───────────────────────────────────────────┘
                  │ handleLogin()
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ Service: BackendAuthService.login(email, password)          │
└─────────────────┬───────────────────────────────────────────┘
                  │ apiClient.post()
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ API Client                                                  │
│ POST /api/auth/login/                                       │
│ Request Body:                                               │
│ { "email": "driver@example.com",                            │
│   "password": "secure123" }                                 │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP Request
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: views.py                                           │
│ accounts/views.py → LoginView                               │
│ • Authenticate user                                         │
│ • Generate JWT token                                        │
│ • Return user profile                                       │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP Response
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ Response 200 OK                                             │
│ {                                                           │
│   "access_token": "eyJ0eXAiOiJKV1QiLC...",               │
│   "user": {                                                 │
│     "id": "uuid",                                           │
│     "username": "driver_1",                                 │
│     "email": "driver@example.com",                          │
│     "role": "DELIVERY",                                     │
│     "is_profile_complete": true                             │
│   }                                                         │
│ }                                                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ├─► apiClient.setToken(access_token)
                  ├─► localStorage.setItem('freshon_user', user)
                  ├─► setUser(user)
                  └─► navigate('/') → Dashboard
```

### 2. Fetch Assignments Flow

```
Dashboard loads
       │
       ├─► useEffect(() => { ... }, [])
       │
       ▼
GET /api/delivery-partner/assignments/
       │
       ├─► Headers: Authorization: Bearer {token}
       │
       ▼
Backend: delivery_partner/views.py
DeliveryAssignmentsView.get()
       │
       ├─► Query: DeliveryAssignment.objects.filter(
       │   partner=user, 
       │   status__in=['PENDING', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT']
       │ )
       │
       ├─► Serialize with DeliveryAssignmentSerializer
       │
       ▼
Response 200
[
  {
    "id": "uuid-1",
    "service": "swift",
    "earnings": 45.00,
    "distance_km": 2.5,
    "weight_kg": 8,
    "status": "PENDING",
    "stops": [
      {
        "id": "uuid-stop-1",
        "type": "pickup",
        "label": "FreshOn Hub - Koramangala",
        "address": "456 MG Road, Bangalore",
        "customer": "Hub",
        "eta": "10:30 AM",
        "items": [
          {"name": "Tomatoes", "qty": 2, "weight": "1kg", "fragile": false}
        ]
      },
      {
        "id": "uuid-stop-2",
        "type": "dropoff",
        "label": "Apartment 302, Nexus Tower",
        "address": "123 Church Street, Bangalore",
        "customer": "Rajesh Kumar",
        "eta": "11:15 AM",
        "items": [...]
      }
    ]
  }
]
       │
       ▼
Frontend: DeliveryAssignmentService.getAssignments()
       │
       ├─► setAssignments(data)
       │
       ▼
UI: Render MissionCard for each assignment
```

### 3. Accept Assignment Flow

```
User clicks "Accept" on MissionCard
       │
       ▼
handleAccept(assignmentId)
       │
       ├─► DeliveryAssignmentService.acceptAssignment(id)
       │
       ▼
POST /api/delivery-partner/assignments/{id}/accept/
       │
       ├─► Headers: Authorization: Bearer {token}
       │
       ▼
Backend: delivery_partner/views.py
DeliveryAcceptView.post()
       │
       ├─► Get assignment by ID
       ├─► Check status == 'PENDING'
       ├─► Set partner = request.user
       ├─► Set status = 'ACCEPTED'
       ├─► Set accepted_at = now()
       ├─► Save to DB
       │
       ▼
Response 200
{
  "id": "uuid-1",
  "service": "swift",
  "earnings": 45.00,
  "status": "ACCEPTED",  ◄─── CHANGED!
  "accepted_at": "2026-05-11T10:30:00Z",
  "stops": [...]
}
       │
       ▼
Frontend: setAssignments()
       │
       ├─► Update assignment status in state
       ├─► Show toast: "Mission accepted!"
       ├─► setScreen('mission')
       │
       ▼
UI: Show RouteList with stops
```

### 4. Mark Delivered Flow

```
User at delivery stop
       │
       ├─► ProofDrawer opens
       │
       ▼
User enters OTP or uploads photo
       │
       ├─► handleComplete(stopId, type='otp', otp_code='123456')
       │
       ▼
POST /api/delivery-partner/assignments/{id}/deliver/
       │
       ├─► Headers: Authorization: Bearer {token}
       ├─► Body: {
       │   "type": "otp",
       │   "otp_code": "123456",
       │   "stop_id": "uuid-stop-2"
       │ }
       │
       ▼
Backend: delivery_partner/views.py
DeliveryDeliverView.post()
       │
       ├─► Get assignment
       ├─► Get stop
       ├─► Create ProofOfDelivery record
       ├─► Mark stop.is_completed = True
       ├─► Check if ALL stops completed
       │   ├─ YES: Set assignment.status = 'DELIVERED'
       │   │        Update order.status = 'DELIVERED'
       │   │        Increment partner.total_deliveries
       │   │        Add to partner.total_earnings
       │   │
       │   └─ NO: Keep status as IN_TRANSIT
       │
       ├─► Save to DB
       │
       ▼
Response 200
{
  "message": "Delivery proof recorded!"
}
       │
       ▼
Frontend:
       │
       ├─► setCompletedStops(..., stopId)
       ├─► Show toast: "Stop completed!"
       ├─► ProofDrawer closes
       │
       ▼
Check: All stops completed?
       │
       ├─ YES: Poll getEarnings() → updated earnings shown
       │        Show completion screen
       │
       └─ NO: Show next stop
```

---

## 🔄 State Synchronization Pattern

```
Local State (Frontend)     ◄───────┐
     │                              │
     │ (on user action)             │
     │                              │
     ▼                              │
Send to Backend ─────────►  Backend ◄─── Update DB
     │                       │
     │                       └──────► Generate Response
     │
     └◄─────────── Receive Response ──┘
           │
           ▼
     Update Local State
           │
           ▼
     Re-render UI
```

---

## 🔐 Authentication State Flow

```
App Mount
   │
   ▼
AuthProvider Init
   │
   ├─► Check localStorage['freshon_user']
   │   │
   │   ├─ FOUND: Use it (restored session)
   │   │
   │   └─ NOT FOUND: Try GET /api/auth/me/
   │                 │
   │                 ├─ 200 OK: Use response
   │                 │
   │                 └─ 401 Unauthorized: Clear token, go to /auth
   │
   ▼
setUser(user)
   │
   ▼
useAuth() available to all components
   │
   ├─► user ──────────► Render dashboard
   │
   ├─► !user ─────────► Render auth page
   │
   └─► loading ───────► Show skeleton


On Login:
   │
   ├─► POST /api/auth/login/
   │
   ├─► Get access_token + user
   │
   ├─► apiClient.setToken(token)
   │   └─► Token added to ALL future requests
   │
   ├─► localStorage.setItem('freshon_user', user)
   │   └─► Session persists across refresh
   │
   ├─► setUser(user)
   │   └─► AuthContext updated
   │
   ▼
Components re-render with user


On Logout:
   │
   ├─► POST /api/auth/logout/
   │
   ├─► apiClient.clearToken()
   │   └─► Future requests won't have auth header
   │
   ├─► localStorage.removeItem('freshon_user')
   │   └─► Session cleared
   │
   ├─► setUser(null)
   │   └─► AuthContext updated
   │
   ▼
Redirect to /auth
```

---

## 🎯 Data Flow Summary

| Screen | Fetch | Trigger | Frequency | Update |
|--------|-------|---------|-----------|--------|
| Dashboard | GET assignments | Mount | Once | On accept |
| Dashboard | GET earnings | Mount | Every 30s | Polling |
| MissionDetail | GET stops | Route change | Once | On complete |
| All | JWT refresh | On 401 | Auto | On error |

---

## ✅ Implementation Verification Checklist

- [ ] apiClient intercepts all requests with JWT
- [ ] apiClient handles 401 → redirect to /auth
- [ ] BackendAuthService calls correct endpoints
- [ ] DeliveryAssignmentService methods match backend
- [ ] DeliveryStatusService methods match backend
- [ ] Components receive props correctly
- [ ] Event handlers call services
- [ ] Services handle errors → toast notifications
- [ ] Loading states disabled during requests
- [ ] localStorage persists session
- [ ] Earnings poll every 30 seconds
- [ ] Stop completion transitions screen
- [ ] All stops done → back to dashboard
- [ ] Logout clears everything

---

**Last Updated**: May 11, 2026  
**Status**: Ready for Implementation ✅
