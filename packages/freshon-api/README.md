# @freshon/api

Centralized TypeScript SDK for all FreshOn apps — Consumer, Delivery, Farmer, Picker, POS, and Website.

## Quick Start

```bash
# From any app directory (e.g. Consumer_app/)
npm install ../../packages/freshon-api
```

```typescript
// In your app's main.tsx or App.tsx — call once at startup
import { initClient } from "@freshon/api";

initClient({
  baseURL: import.meta.env.VITE_API_MAIN_URL,
  authRedirectPath: "/welcome", // where to redirect on auth failure
});
```

```typescript
// Then use any module anywhere in your app
import { auth, inventory, orders } from "@freshon/api";

// Login
const { user, access, refresh } = await auth.login({
  username: "yogesh",
  password: "secret",
});

// Fetch categories
const categories = await inventory.listCategories();

// Place an order
const order = await orders.placeOrder({
  address_title: "Home",
  address_line: "123 Main St, Koramangala",
  delivery_slot: "EXPRESS",
  payment_method: "UPI",
  items: [{ batch: "uuid-here", quantity: 2 }],
});
```

## Available Modules

| Module | Used By | Status |
|--------|---------|--------|
| `auth` | All apps | ✅ Backend exists |
| `inventory` | Consumer, Frontend, POS | ✅ Backend exists |
| `orders` | Consumer, Frontend | ✅ Backend exists |
| `delivery` | Consumer, Frontend | ✅ Backend exists |
| `wallet` | Consumer, Frontend | ✅ Backend exists |
| `payment` | Consumer, Frontend | ✅ Backend exists |
| `profile` | Consumer, Frontend | ✅ Backend exists |
| `picker` | Fpick_app | 🔧 Backend planned |
| `deliveryPartner` | Del_app | 🔧 Backend planned |
| `farmer` | Farm_app | 🔧 Backend planned |
| `pos` | Fpos | 🔧 Backend planned |
| `ws` | All apps | 🔧 Backend planned |

## Architecture

```
@freshon/api
├── src/
│   ├── client.ts           # Axios instance + JWT auth + silent refresh
│   ├── types.ts            # All TypeScript types (single source of truth)
│   ├── index.ts            # Barrel export
│   └── modules/
│       ├── auth.ts         # Login, register, logout, me
│       ├── inventory.ts    # Categories, batches, farmers
│       ├── orders.ts       # Place order, track order
│       ├── delivery.ts     # Slots, addresses, location validation
│       ├── wallet.ts       # Balance, topup, PRIDE, referrals
│       ├── payment.ts      # Razorpay init + verify
│       ├── profile.ts      # Customer profile (address, prefs, settings)
│       ├── picker.ts       # Picker queue, geo-verify, scan, pack
│       ├── delivery-partner.ts  # Assignments, status, proof of delivery
│       ├── farmer.ts       # Registration, batches, dashboard, payouts
│       ├── pos.ts          # POS login, shift, orders, wastage
│       └── ws.ts           # WebSocket manager with auto-reconnect
└── dist/                   # Compiled JS + declarations
```

## WebSocket Usage

```typescript
import { ws } from "@freshon/api";

// Connect and subscribe
ws.connect("orders");
const unsub = ws.subscribe("orders", (event) => {
  if (event.type === "order_status_changed") {
    console.log(`Order ${event.tracking_id} → ${event.status}`);
  }
});

// Monitor connection status
ws.onStatus("orders", (status) => {
  console.log("WS status:", status); // "connecting" | "connected" | "disconnected" | "error"
});

// Cleanup
unsub();
ws.disconnect("orders");

// On logout — disconnect all channels
ws.disconnectAll();
```

## Development

```bash
npm run dev    # Watch mode — recompiles on change
npm run build  # One-time build
npm run lint   # Type-check without emitting
```
