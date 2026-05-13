# Del_app (Delivery Partner) — Detailed Backend-to-Frontend Integration Plan

## 📊 Executive Summary

**Goal**: Connect Del_app frontend to the production backend to create a complete Consumer → Picker → **Delivery** → Delivered order lifecycle.

**Current State**:
- ✅ Backend API fully implemented (`apps/delivery_partner/`)
- ⚠️ Frontend uses local mock auth (`useAuth` + localStorage)
- ⚠️ Supabase remnants exist (unused `/supabase/` directory)
- ❌ No connection between frontend and backend

**Deliverable**: A fully functional delivery app that:
- Authenticates via centralized backend (email/phone + password)
- Fetches live delivery assignments from backend
- Updates status and location in real-time
- Uploads proof-of-delivery (photos)
- Tracks earnings from backend database

**Timeline**: 2-3 days (1-2 days planning, 1-2 days implementation + testing)

**Impact**: Completes the MVP demo pipeline and validates backend delivery system at scale

---

## 📋 Phase 1: Audit & Cleanup (4 hours)

### 1.1 Remove Supabase Remnants

**Location**: `Del_app/src/integrations/supabase/`

**Files to Delete**:
```
Del_app/src/integrations/supabase/
  ├── client.ts       # Supabase client (unused)
  ├── types.ts        # Supabase types (unused)
  └── ...other files
Del_app/supabase/     # Configuration folder (unused)
```

**Commands**:
```bash
rm -r Del_app/src/integrations/supabase/
rm -r Del_app/supabase/
```

**Rationale**: These were scaffolded but never used. Removing them eliminates confusion and reduces bundle size.

### 1.2 Audit Current Frontend Structure

**Key Files**:
| File | Purpose | Status |
|------|---------|--------|
| `src/pages/Index.tsx` | Dashboard & mission view | ✅ UI complete, needs backend wiring |
| `src/pages/Auth.tsx` | Email/Phone signup & login | ⚠️ Mocked, needs backend integration |
| `src/pages/Onboarding.tsx` | KYC and vehicle info | ⚠️ Needs design + backend |
| `src/hooks/useAuth.tsx` | Auth context (local) | ❌ Replace with centralized auth |
| `src/components/StatusToggle.tsx` | Online/offline button | ✅ UI complete, needs PATCH backend call |
| `src/components/EarningsHeader.tsx` | Earnings display | ✅ UI complete, needs GET backend call |
| `src/components/MissionCard.tsx` | Mission card (accept) | ✅ UI complete, needs POST backend call |
| `src/components/ProofDrawer.tsx` | Photo upload drawer | ✅ UI complete, needs FormData POST |
| `src/components/RouteList.tsx` | Stop sequence | ✅ UI complete, needs backend data |
| `src/lib/freshon-data.ts` | Mock data (remove) | ❌ Delete after backend wiring |

### 1.3 Understand Backend API Surface

**Available Endpoints**:
```
Authentication (shared):
POST   /api/auth/login/                         — Email/password login
POST   /api/auth/logout/                        — Logout
GET    /api/auth/me/                            — Current user profile

Delivery Partner (apps/delivery_partner):
GET    /api/delivery-partner/assignments/       — Active deliveries
POST   /api/delivery-partner/assignments/{id}/accept/
POST   /api/delivery-partner/assignments/{id}/pickup/
POST   /api/delivery-partner/assignments/{id}/transit/
POST   /api/delivery-partner/assignments/{id}/deliver/
PATCH  /api/delivery-partner/status/            — Online/offline + GPS
POST   /api/delivery-partner/proof/             — Photo upload (multipart)
GET    /api/delivery-partner/earnings/          — Today's earnings
```

**Key Models**:
- `DeliveryPartnerProfile` — Vehicle type, is_online, GPS, stats
- `DeliveryAssignment` — Order + stops, lifecycle: PENDING→ACCEPTED→PICKED_UP→IN_TRANSIT→DELIVERED
- `DeliveryStop` — Multi-stop delivery destination
- `ProofOfDelivery` — Photo or OTP proof

---

## 📦 Phase 2: Create Centralized Auth Services (6 hours)

### 2.1 Create `backendAuthService.ts` for Delivery

**Location**: `Del_app/src/lib/backendAuthService.ts`

**Pattern**: Mirror the Fpick_app implementation but for DELIVERY role

```typescript
// Del_app/src/lib/backendAuthService.ts

export interface DeliveryAuthUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "DELIVERY";
}

export class BackendAuthService {
  static async login(email: string, password: string): Promise<{ 
    success: boolean; 
    user?: DeliveryAuthUser; 
    error?: string; 
  }> {
    // POST /api/auth/login/
    // Sets JWT token in apiClient
    // Stores user in localStorage
  }

  static async logout(): Promise<{ success: boolean; error?: string }> {
    // POST /api/auth/logout/
    // Clears JWT token
    // Clears localStorage
  }

  static async getCurrentUser(): Promise<{ 
    success: boolean; 
    user?: DeliveryAuthUser; 
    error?: string; 
  }> {
    // GET /api/auth/me/
    // Returns current authenticated user
  }

  static getStoredUser(): DeliveryAuthUser | null {
    // Read from localStorage
  }
}
```

**Implementation Checklist**:
- [ ] Create interface for login request
- [ ] Create interface for login response
- [ ] Call `apiClient.post("/api/auth/login/")`
- [ ] Extract and set JWT token
- [ ] Store user profile in localStorage
- [ ] Implement logout with token cleanup
- [ ] Implement getCurrentUser for session restoration
- [ ] Error handling for 401/403 responses

### 2.2 Replace `useAuth.tsx` with Centralized Auth Hook

**Location**: `Del_app/src/hooks/useAuth.tsx`

**Pattern**: Use centralized `backendAuthService`, not local mock

```typescript
// Del_app/src/hooks/useAuth.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { backendAuthService, DeliveryAuthUser } from "@/lib/backendAuthService";

interface AuthCtx {
  user: DeliveryAuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Auth actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<DeliveryAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session if it exists
  useEffect(() => {
    const storedUser = backendAuthService.getStoredUser();
    setUser(storedUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await backendAuthService.login(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = async () => {
    await backendAuthService.logout();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, isAuthenticated: !!user, login, logout }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be within AuthProvider");
  return ctx;
};
```

**Changes from Current**:
- ✅ Calls real `backendAuthService` instead of mocking
- ✅ Supports email/password (not just placeholder)
- ✅ JWT token management via apiClient
- ✅ Session restoration on app load
- ✅ Error propagation to components

### 2.3 Update `Auth.tsx` Page to Use Backend

**Location**: `Del_app/src/pages/Auth.tsx`

**Changes**:
1. Replace mock `signIn()` calls with `await login(email, password)`
2. Handle backend validation errors (email taken, weak password, etc.)
3. Show loading state with spinner
4. Redirect to dashboard on success
5. Redirect to onboarding for first-time setup

**Key Points**:
- Email/Phone mode: Use email field + password
- Keep OTP for future (phone verification) — for now, email only
- Form validation with Zod (keep existing)
- Toast notifications for errors

---

## 🔌 Phase 3: Create Delivery Service Layer (6 hours)

### 3.1 Create `deliveryAssignmentService.ts`

**Location**: `Del_app/src/lib/deliveryAssignmentService.ts`

**Responsibilities**: Fetch, accept, update assignment status

```typescript
// Del_app/src/lib/deliveryAssignmentService.ts

export interface Assignment {
  id: string;
  order: {
    tracking_id: string;
    customer: string;
    pickup_address: string;
  };
  status: "PENDING" | "ACCEPTED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED";
  stops: Stop[];
  created_at: string;
  accepted_at?: string;
  in_transit_at?: string;
  delivered_at?: string;
  earnings: number;
  distance_km: number;
}

export interface Stop {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  recipient_name: string;
  phone: string;
  order_item_count: number;
  status: "pending" | "completed";
}

export class DeliveryAssignmentService {
  // GET /api/delivery-partner/assignments/
  static async getAssignments(): Promise<{ 
    success: boolean; 
    assignments?: Assignment[]; 
    error?: string; 
  }> {
    const response = await apiClient.get("/api/delivery-partner/assignments/");
    if (response.error) {
      return { success: false, error: response.error };
    }
    return { success: true, assignments: response.data };
  }

  // POST /api/delivery-partner/assignments/{id}/accept/
  static async acceptAssignment(assignmentId: string): Promise<{ 
    success: boolean; 
    assignment?: Assignment; 
    error?: string; 
  }> {
    const response = await apiClient.post(
      `/api/delivery-partner/assignments/${assignmentId}/accept/`
    );
    if (response.error) {
      return { success: false, error: response.error };
    }
    return { success: true, assignment: response.data };
  }

  // POST /api/delivery-partner/assignments/{id}/pickup/
  static async markPickedUp(assignmentId: string): Promise<{ 
    success: boolean; 
    error?: string; 
  }> {
    const response = await apiClient.post(
      `/api/delivery-partner/assignments/${assignmentId}/pickup/`
    );
    if (response.error) {
      return { success: false, error: response.error };
    }
    return { success: true };
  }

  // POST /api/delivery-partner/assignments/{id}/transit/
  static async markInTransit(assignmentId: string, latitude: number, longitude: number): Promise<{ 
    success: boolean; 
    error?: string; 
  }> {
    const response = await apiClient.post(
      `/api/delivery-partner/assignments/${assignmentId}/transit/`,
      { latitude, longitude }
    );
    if (response.error) {
      return { success: false, error: response.error };
    }
    return { success: true };
  }

  // POST /api/delivery-partner/assignments/{id}/deliver/
  static async markDelivered(
    assignmentId: string,
    data: {
      type: "otp" | "photo";
      otp_code?: string;
      stop_id?: string;
    }
  ): Promise<{ 
    success: boolean; 
    error?: string; 
  }> {
    const response = await apiClient.post(
      `/api/delivery-partner/assignments/${assignmentId}/deliver/`,
      data
    );
    if (response.error) {
      return { success: false, error: response.error };
    }
    return { success: true };
  }
}
```

### 3.2 Create `deliveryStatusService.ts`

**Location**: `Del_app/src/lib/deliveryStatusService.ts`

```typescript
// Del_app/src/lib/deliveryStatusService.ts

export interface StatusResponse {
  message: string;
  online: boolean;
}

export interface EarningsStats {
  earnings: number;
  goal: number;
  deliveries: number;
  distance: number;
  rating: number;
}

export class DeliveryStatusService {
  // PATCH /api/delivery-partner/status/
  static async updateStatus(online: boolean, latitude?: number, longitude?: number): Promise<{ 
    success: boolean; 
    data?: StatusResponse; 
    error?: string; 
  }> {
    const response = await apiClient.patch("/api/delivery-partner/status/", {
      online,
      latitude,
      longitude,
    });
    if (response.error) {
      return { success: false, error: response.error };
    }
    return { success: true, data: response.data };
  }

  // GET /api/delivery-partner/earnings/
  static async getEarnings(): Promise<{ 
    success: boolean; 
    data?: EarningsStats; 
    error?: string; 
  }> {
    const response = await apiClient.get("/api/delivery-partner/earnings/");
    if (response.error) {
      return { success: false, error: response.error };
    }
    return { success: true, data: response.data };
  }

  // POST /api/delivery-partner/proof/
  static async uploadProof(formData: FormData): Promise<{ 
    success: boolean; 
    url?: string; 
    error?: string; 
  }> {
    const response = await apiClient.post("/api/delivery-partner/proof/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.error) {
      return { success: false, error: response.error };
    }
    return { success: true, url: response.data?.url };
  }
}
```

**Implementation Checklist**:
- [ ] Create types for Assignment and Stop
- [ ] Implement all 7 methods with proper error handling
- [ ] Add logging for debugging
- [ ] Handle JWT token refresh on 401
- [ ] Test with real backend

---

## 🖥️ Phase 4: Component-by-Component Wiring (8 hours)

### 4.1 Update `Auth.tsx` — Backend Integration

**Changes**:
```typescript
// Del_app/src/pages/Auth.tsx

import { backendAuthService } from "@/lib/backendAuthService";
import { useAuth } from "@/hooks/useAuth";

const handleEmail = async (e: React.FormEvent) => {
  e.preventDefault();
  const parsed = emailSchema.safeParse({ email, password, fullName });
  if (!parsed.success) {
    toast.error(parsed.error.issues[0].message);
    return;
  }

  setBusy(true);
  
  // Call backend
  const result = await login(email, password);
  
  if (result.success) {
    toast.success("Welcome back!");
    navigate("/onboarding", { replace: true });
  } else {
    toast.error(result.error || "Login failed");
  }
  
  setBusy(false);
};
```

**Checklist**:
- [ ] Replace mock auth with real `login()` call
- [ ] Handle 401 (invalid credentials)
- [ ] Handle 400 (validation error)
- [ ] Show backend error messages to user
- [ ] Redirect to `/onboarding` on success (KYC flow)

### 4.2 Update `StatusToggle.tsx` — Online/Offline Toggle

**Current** (from Index.tsx):
```typescript
<StatusToggle online={online} onChange={setOnline} />
```

**Needed Changes**:

```typescript
// Del_app/src/components/StatusToggle.tsx

import { useCallback, useState } from "react";
import { DeliveryStatusService } from "@/lib/deliveryStatusService";
import { toast } from "sonner";

interface Props {
  online: boolean;
  onChange: (online: boolean) => void;
}

export const StatusToggle = ({ online, onChange }: Props) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = useCallback(async () => {
    setIsUpdating(true);
    
    // Call backend to update status
    const result = await DeliveryStatusService.updateStatus(!online);
    
    if (result.success) {
      onChange(!online);
      toast.success(result.data?.message || "Status updated");
    } else {
      toast.error(result.error || "Failed to update status");
    }
    
    setIsUpdating(false);
  }, [online, onChange]);

  return (
    <div className="...">
      <button 
        onClick={handleToggle}
        disabled={isUpdating}
        className={`... ${online ? "bg-green-500" : "bg-gray-400"}`}
      >
        {isUpdating ? "Updating..." : (online ? "Online" : "Offline")}
      </button>
    </div>
  );
};
```

**Checklist**:
- [ ] Import DeliveryStatusService
- [ ] Call updateStatus on toggle
- [ ] Show loading state
- [ ] Show error toast on failure
- [ ] Update local state only on success
- [ ] Include GPS coordinates if available

### 4.3 Update `EarningsHeader.tsx` — Fetch Real Earnings

**Current**: Hardcoded mock values

**New**:
```typescript
// Del_app/src/components/EarningsHeader.tsx

import { useEffect, useState } from "react";
import { DeliveryStatusService, EarningsStats } from "@/lib/deliveryStatusService";

export const EarningsHeader = () => {
  const [stats, setStats] = useState<EarningsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      const result = await DeliveryStatusService.getEarnings();
      if (result.success && result.data) {
        setStats(result.data);
      }
      setLoading(false);
    };
    
    fetchEarnings();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchEarnings, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading earnings...</div>;
  if (!stats) return <div>No data</div>;

  return (
    <div className="...">
      <h3>₹{stats.earnings}</h3>
      <p>Goal: ₹{stats.goal}</p>
      <p>{stats.deliveries} deliveries · {stats.distance}km</p>
      <p>⭐ {stats.rating}</p>
    </div>
  );
};
```

**Checklist**:
- [ ] Fetch on mount
- [ ] Add refresh interval (30s or on-demand)
- [ ] Show loading skeleton
- [ ] Show error fallback
- [ ] Update stats when new delivery completes

### 4.4 Update `MissionCard.tsx` — Accept Assignment

**Current**: Mock button

**New**:
```typescript
// Del_app/src/components/MissionCard.tsx

import { useState } from "react";
import { DeliveryAssignmentService, Assignment } from "@/lib/deliveryAssignmentService";
import { toast } from "sonner";

interface Props {
  mission: Assignment;
  onAccept: () => void;
}

export const MissionCard = ({ mission, onAccept }: Props) => {
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    
    const result = await DeliveryAssignmentService.acceptAssignment(mission.id);
    
    if (result.success) {
      toast.success("Mission accepted!");
      onAccept();
    } else {
      toast.error(result.error || "Failed to accept mission");
    }
    
    setIsAccepting(false);
  };

  return (
    <div className="mission-card">
      <div>
        <h3>{mission.order.customer}</h3>
        <p>{mission.order.pickup_address}</p>
        <p>{mission.stops.length} stops · {mission.distance_km}km</p>
        <p>₹{mission.earnings} earnings</p>
      </div>
      <button 
        onClick={handleAccept}
        disabled={isAccepting}
        className="btn-primary"
      >
        {isAccepting ? "Accepting..." : "Accept"}
      </button>
    </div>
  );
};
```

**Checklist**:
- [ ] Display real mission data
- [ ] Call acceptAssignment on button click
- [ ] Show loading state
- [ ] Handle errors gracefully
- [ ] Callback to parent on success

### 4.5 Update `Index.tsx` Dashboard — Fetch Missions

**Current**: Uses mock data

**New**:
```typescript
// Del_app/src/pages/Index.tsx

import { useEffect, useState } from "react";
import { DeliveryAssignmentService, Assignment } from "@/lib/deliveryAssignmentService";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [online, setOnline] = useState(false);

  // Fetch assignments on mount and when online status changes
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAssignments = async () => {
      setLoading(true);
      const result = await DeliveryAssignmentService.getAssignments();
      if (result.success && result.assignments) {
        setAssignments(result.assignments);
      }
      setLoading(false);
    };

    fetchAssignments();

    // Poll every 10 seconds when online
    if (online) {
      const interval = setInterval(fetchAssignments, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, online]);

  const currentMission = assignments.find(a => a.status !== "DELIVERED");

  return (
    <main className="min-h-screen">
      {screen === "dashboard" && (
        <div>
          <StatusToggle online={online} onChange={setOnline} />
          <EarningsHeader />
          {online ? (
            currentMission ? (
              <MissionCard 
                mission={currentMission}
                onAccept={() => setScreen("mission")}
              />
            ) : (
              <RadarWaiting />
            )
          ) : (
            <RadarWaiting />
          )}
        </div>
      )}
      
      {screen === "mission" && currentMission && (
        <div>
          {/* Mission details */}
          <RouteList stops={currentMission.stops} />
        </div>
      )}
    </main>
  );
};
```

**Checklist**:
- [ ] Fetch assignments on mount
- [ ] Fetch only when online
- [ ] Poll every 10-15 seconds for new missions
- [ ] Show loading state
- [ ] Display current mission if available
- [ ] Store selected mission in state

### 4.6 Update `RouteList.tsx` — Display & Complete Stops

**Current**: Mock stops

**New**:
```typescript
// Del_app/src/components/RouteList.tsx

import { useState } from "react";
import { Stop } from "@/lib/deliveryAssignmentService";
import { DeliveryAssignmentService } from "@/lib/deliveryAssignmentService";
import { toast } from "sonner";

interface Props {
  assignmentId: string;
  stops: Stop[];
  onStopUpdate: (stopId: string, status: "completed") => void;
}

export const RouteList = ({ assignmentId, stops, onStopUpdate }: Props) => {
  const [completingStopId, setCompletingStopId] = useState<string | null>(null);

  const handleCompleteStop = async (stopId: string) => {
    setCompletingStopId(stopId);
    
    // Mark delivery with OTP
    const result = await DeliveryAssignmentService.markDelivered(
      assignmentId,
      { type: "otp", otp_code: "1234", stop_id: stopId } // Get OTP from user input
    );
    
    if (result.success) {
      toast.success("Stop completed");
      onStopUpdate(stopId, "completed");
    } else {
      toast.error(result.error || "Failed to complete stop");
    }
    
    setCompletingStopId(null);
  };

  return (
    <div className="space-y-2">
      {stops.map((stop, idx) => (
        <div key={stop.id} className="stop-card">
          <div>
            <p className="font-bold">{stop.recipient_name}</p>
            <p className="text-sm">{stop.address}</p>
            <p className="text-xs">{stop.order_item_count} items</p>
          </div>
          <button
            onClick={() => handleCompleteStop(stop.id)}
            disabled={completingStopId === stop.id || stop.status === "completed"}
            className={stop.status === "completed" ? "bg-green-500" : "bg-primary"}
          >
            {completingStopId === stop.id ? "Completing..." : "Complete"}
          </button>
        </div>
      ))}
    </div>
  );
};
```

**Checklist**:
- [ ] Display stop address, recipient, item count
- [ ] Show completion button for each stop
- [ ] Call markDelivered on completion
- [ ] Show OTP input modal (future)
- [ ] Update UI after successful completion
- [ ] Show error toast on failure

### 4.7 Update `ProofDrawer.tsx` — Upload Photo Proof

**Current**: Mock drawer

**New**:
```typescript
// Del_app/src/components/ProofDrawer.tsx

import { useRef, useState } from "react";
import { Stop } from "@/lib/deliveryAssignmentService";
import { DeliveryStatusService } from "@/lib/deliveryStatusService";
import { toast } from "sonner";

interface Props {
  assignmentId: string;
  stop: Stop | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProofDrawer = ({ assignmentId, stop, onClose, onSuccess }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!stop) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      toast.error("Select a photo first");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("photo", fileInputRef.current.files[0]);
    formData.append("mission_id", assignmentId);

    const result = await DeliveryStatusService.uploadProof(formData);

    if (result.success) {
      toast.success("Proof uploaded");
      onSuccess();
      onClose();
    } else {
      toast.error(result.error || "Upload failed");
    }

    setIsUploading(false);
  };

  return (
    <div className="drawer">
      <h3>{stop.recipient_name}</h3>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        hidden
      />
      <button onClick={() => fileInputRef.current?.click()}>
        {preview ? "📸 Change photo" : "📸 Take photo"}
      </button>
      {preview && <img src={preview} alt="preview" />}
      <button 
        onClick={handleUpload}
        disabled={!preview || isUploading}
        className="btn-primary"
      >
        {isUploading ? "Uploading..." : "Upload proof"}
      </button>
    </div>
  );
};
```

**Checklist**:
- [ ] File input for camera/gallery
- [ ] Preview before upload
- [ ] Call uploadProof with FormData
- [ ] Show loading state
- [ ] Close on success
- [ ] Show error toast on failure

---

## 🧪 Phase 5: Testing & Validation (6 hours)

### 5.1 Manual Testing Checklist

| Feature | Steps | Expected | Status |
|---------|-------|----------|--------|
| **Auth** | 1. Load app 2. Go to `/auth` 3. Enter valid email + password 4. Click login | Session restored, redirect to `/onboarding` | ⏳ |
| **Dashboard Load** | 1. Login 2. View dashboard | Assignments list displayed, earnings shown | ⏳ |
| **Toggle Online** | 1. Click online toggle 2. Check backend | Status updated, assignments polled | ⏳ |
| **Accept Mission** | 1. Click accept on mission 2. Check backend | Mission status → ACCEPTED, screen → mission detail | ⏳ |
| **Complete Stop** | 1. Click complete on stop 2. Enter OTP | Stop marked complete, can see next stop | ⏳ |
| **Upload Photo** | 1. Click photo upload 2. Select image 3. Click upload | Photo stored in backend, proof recorded | ⏳ |
| **View Earnings** | 1. Look at earnings header | Real data from backend, updates | ⏳ |
| **Session Restore** | 1. Login 2. Reload page | User stays logged in | ⏳ |
| **Logout** | 1. Click logout button | Redirected to login, session cleared | ⏳ |

### 5.2 Backend Integration Tests

**Create** `Del_app/src/__tests__/integration.test.ts`:

```typescript
// Test scenarios:
1. Can login with valid credentials
2. Can fetch assignments list
3. Can accept an assignment
4. Can mark pickup
5. Can mark in transit with GPS
6. Can mark delivered with OTP
7. Can upload proof photo
8. Can update status (online/offline)
9. Can fetch earnings
10. JWT token refreshes on 401
```

### 5.3 E2E Flow Test

**Scenario**: Complete a delivery from start to finish

```
1. Fresh install
2. Visit /auth
3. Login with email/password (backend validates)
4. Redirected to /onboarding (KYC, vehicle info)
5. Complete KYC → Redirected to /dashboard
6. Click "Go Online"
7. Wait for mission assignment (GeoAssignmentTask in backend)
8. Mission appears in feed
9. Click "Accept"
10. Screen changes to mission detail
11. Click "Pickup"
12. Status → PICKED_UP
13. Click "In Transit" + GPS
14. Status → IN_TRANSIT
15. For each stop:
    - Click "Complete"
    - Enter OTP (or upload photo)
    - Backend records proof
16. All stops done → Mark DELIVERED
17. Earnings updated in real-time
18. View earnings report
19. Logout
```

---

## 📁 Phase 6: File Structure After Integration

```
Del_app/
├── src/
│   ├── lib/
│   │   ├── apiClient.ts              ← HTTP client with JWT
│   │   ├── backendAuthService.ts     ← NEW: Backend auth
│   │   ├── deliveryAssignmentService.ts ← NEW: Assignments
│   │   ├── deliveryStatusService.ts  ← NEW: Status & earnings
│   │   └── freshon-data.ts           ← DELETE (mock only)
│   ├── hooks/
│   │   ├── useAuth.tsx               ← REPLACE with backend
│   │   └── use-mobile.tsx
│   ├── components/
│   │   ├── StatusToggle.tsx           ← WIRE to backend
│   │   ├── EarningsHeader.tsx         ← WIRE to backend
│   │   ├── MissionCard.tsx            ← WIRE to backend
│   │   ├── RouteList.tsx              ← WIRE to backend
│   │   ├── ProofDrawer.tsx            ← WIRE to backend
│   │   └── ... other UI components
│   ├── pages/
│   │   ├── Auth.tsx                   ← WIRE to backend
│   │   ├── Index.tsx                  ← WIRE to backend
│   │   ├── Onboarding.tsx             ← NEW (KYC flow)
│   │   └── NotFound.tsx
│   ├── App.tsx
│   └── main.tsx
├── supabase/                          ← DELETE
├── src/integrations/supabase/         ← DELETE
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🔄 Data Flow Diagram

```
┌──────────────────┐
│   User Login     │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────────┐
│  POST /api/auth/login/         │
│  (email, password)             │
└────────┬────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│  JWT Token Set in apiClient    │
│  User stored in localStorage   │
└────────┬────────────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Redirect to Dashboard   │
└────────┬─────────────────┘
         │
    ┌────┴────────────────────────┐
    │                             │
    ▼                             ▼
┌─────────────────────┐   ┌─────────────────────┐
│ GET /api/delivery-  │   │ PATCH /api/delivery-│
│ partner/assignments/│   │ partner/status/     │
└──────────┬──────────┘   └──────────┬──────────┘
    │                             │
    ▼                             ▼
┌──────────────────┐   ┌──────────────────┐
│ Show Missions    │   │ Update Online    │
└─────────┬────────┘   │ Toggle UI        │
          │            └──────────────────┘
          │
          ▼
   ┌─────────────────────────────────┐
   │ POST /api/delivery-partner/     │
   │ assignments/{id}/accept/        │
   └──────────┬──────────────────────┘
              │
              ▼
        ┌──────────────────────┐
        │ Show Mission Detail   │
        │ & Route Stops        │
        └──────────┬───────────┘
              │
    ┌─────────┴─────────┬──────────────┐
    │                   │              │
    ▼                   ▼              ▼
┌─────────────┐  ┌────────────┐  ┌─────────────┐
│ /pickup/    │  │ /transit/  │  │ /deliver/   │
└─────────────┘  └────────────┘  └─────────────┘
```

---

## 🎯 Success Criteria

- [ ] Del_app users can login with email/password
- [ ] Dashboard shows real assignments from backend
- [ ] Online/offline toggle updates backend status
- [ ] Users can accept and complete deliveries
- [ ] Proof of delivery (photo) uploads to backend
- [ ] Earnings dashboard reflects real data
- [ ] Session persists across app restarts
- [ ] JWT tokens refresh automatically
- [ ] All API errors handled gracefully
- [ ] E2E flow works: login → accept → pickup → transit → deliver

---

## ⏱️ Timeline

| Phase | Tasks | Duration | Start | End |
|-------|-------|----------|-------|-----|
| **1. Cleanup** | Remove Supabase, audit files | 4h | Day 1 | Day 1 |
| **2. Auth** | Create backendAuthService, useAuth | 6h | Day 1 | Day 2 |
| **3. Services** | Create delivery services | 6h | Day 2 | Day 2 |
| **4. Components** | Wire 7 components to backend | 8h | Day 2-3 | Day 3 |
| **5. Testing** | Manual + E2E testing | 6h | Day 3 | Day 3 |
| **Buffer** | Bug fixes, polish | 4h | Day 3-4 | Day 4 |
| **Total** | — | **34h** | — | 4 days |

---

## 🚨 Known Issues & Considerations

### 1. **WebSocket for Real-Time Assignments**
Currently polling every 10s. In future:
- Implement WebSocket connection to `ws://backend/ws/delivery/assignments/`
- Receive instant notifications when mission assigned
- Reduce latency and server load

### 2. **GPS Accuracy**
- Use device's Geolocation API to capture coordinates
- Send with `/transit/` and `/status/` updates
- Backend validates against hub geo-fence

### 3. **Photo Upload Performance**
- Compress image before upload (reduce from 5MB to 500KB)
- Show progress bar during upload
- Handle network failures gracefully

### 4. **Offline Support**
- Currently no offline functionality
- Future: Queue actions locally, sync when online
- Use IndexedDB for assignment cache

### 5. **Multi-Stop Route Optimization**
- Backend computes optimal stop order
- Frontend displays as-is from backend
- Future: Allow reordering or navigation override

### 6. **Push Notifications**
- Setup Firebase Cloud Messaging for new assignments
- Notify user when mission available (even if app closed)
- Requires Capacitor plugin

---

## 📝 Detailed Implementation Order

### Day 1 (4 + 6 hours)

**Morning (Cleanup)**:
1. Delete `/Del_app/src/integrations/supabase/`
2. Delete `/Del_app/supabase/`
3. Remove Supabase env vars from `.env`
4. Audit `package.json` for unused Supabase deps

**Afternoon (Auth Services)**:
1. Create `backendAuthService.ts`
2. Create new `useAuth.tsx` with backend integration
3. Update `Auth.tsx` to use `login(email, password)`
4. Test login flow

### Day 2 (6 + 8 hours)

**Morning (Service Layer)**:
1. Create `deliveryAssignmentService.ts`
2. Create `deliveryStatusService.ts`
3. Add types and interfaces
4. Implement error handling

**Afternoon (Component Wiring)**:
1. Update `StatusToggle.tsx`
2. Update `EarningsHeader.tsx`
3. Update `MissionCard.tsx`
4. Update `Index.tsx` for mission fetching
5. Update `RouteList.tsx` for stop completion
6. Update `ProofDrawer.tsx` for photo upload

### Day 3 (6 hours)

**All Day (Testing & Polish)**:
1. Manual test all components
2. Test E2E flow
3. Check error handling
4. Fix bugs
5. Optimize performance
6. Document integration points

---

## 🔗 Integration Checklist

### Backend
- [x] DeliveryPartner API implemented
- [x] All endpoints working
- [x] Authentication working
- [ ] CORS properly configured for Del_app origin
- [ ] Rate limiting configured
- [ ] Logging implemented for debugging

### Frontend
- [ ] Remove Supabase remnants
- [ ] Create auth services
- [ ] Create delivery services
- [ ] Update all components
- [ ] Handle JWT refresh
- [ ] Test session restore
- [ ] Test logout
- [ ] Error notifications
- [ ] Loading states
- [ ] Empty states

### Testing
- [ ] Login flow
- [ ] Mission accept
- [ ] Stop completion
- [ ] Photo upload
- [ ] Earnings display
- [ ] Status toggle
- [ ] Session persistence
- [ ] Error handling
- [ ] Network timeout handling
- [ ] E2E flow

---

## 🎬 Getting Started

**Command to bookmark this plan**:
```bash
# Quick reference: read the plan
cat DEL_APP_INTEGRATION_PLAN.md | head -50

# Track progress: grep for status
grep -E "\[.\]" DEL_APP_INTEGRATION_PLAN.md
```

**Next Steps**:
1. ✅ Read this entire plan (15 min)
2. ⏳ Start Phase 1: Cleanup Supabase (4h)
3. ⏳ Start Phase 2: Create auth services (6h)
4. ⏳ Start Phase 3: Create delivery services (6h)
5. ⏳ Start Phase 4: Wire components (8h)
6. ⏳ Start Phase 5: Test (6h)

---

**Plan Created**: May 7, 2026
**Status**: Ready for implementation
**Last Updated**: May 7, 2026
