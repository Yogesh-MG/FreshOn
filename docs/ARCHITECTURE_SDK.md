# FreshOn Centralized SDK Architecture

## Overview
To prevent logic duplication and type inconsistencies across the 6+ apps in the FreshOn ecosystem, we use a centralized TypeScript SDK located at `packages/freshon-api`.

## Key Principles
1. **Single Source of Truth**: All API endpoint definitions, request/response types, and Axios configurations live in `@freshon/api`.
2. **Type Safety**: Frontend apps must use the exported interfaces from the SDK to ensure they match the Django backend.
3. **Normalized Communication**: The SDK handles authentication (JWT/Cookies), base URLs, and common error handling.

## Usage in Apps

### 1. Initialization
The client must be initialized in the app's entry point (`main.tsx`):
```tsx
import { initClient } from "@freshon/api";
import { baseUrl } from "./utils/apiconfig";

initClient({ baseURL: baseUrl });
```

### 2. Module Imports
Do not make direct `axios` or `api.get()` calls for shared resources. Use the specific modules:
```tsx
import { inventory, orders, profile } from "@freshon/api";

// Example: Fetching categories
const data = await inventory.listCategories();
const categories = data.results; // Note: Returns paginated response
```

## Module Map
- `auth`: Login, Logout, Registration, Token Refresh.
- `inventory`: Categories, Batches, Farmers, Grouping Utils.
- `orders`: Placing orders, Tracking, Order History.
- `delivery`: Slots, Address management, Location validation.
- `payment`: Razorpay initialization and verification.
- `wallet`: Balance, Transactions, PRIDE membership.
- `picker`: Geo-fence verification, order queue, accept/scan/pack/handover.
- `deliveryPartner`: Online/offline status, assignments, pickup/transit/deliver, proof upload, earnings.
- `farmer`: OTP registration, profile CRUD, media upload, dashboard metrics, batch management, payouts.
- `pos`: PIN login, shift open/close, product catalog, customer lookup, walk-in orders, wastage logging.
- `ws`: WebSocket manager (planned) for real-time order/picker/delivery events.

## Backend API Prefix Map
| SDK Module | Django App | URL Prefix |
|-----------|-----------|------------|
| `auth` | `apps.accounts` | `/api/auth/` |
| `inventory` | `apps.inventory` | `/api/inventory/` |
| `orders` | `apps.orders` | `/api/orders/` |
| `delivery` | `apps.delivery` | `/api/delivery/` |
| `payment` | `apps.payment` | `/api/payment/` |
| `wallet` | `apps.wallet` | `/api/wallet/` |
| `picker` | `apps.picker` | `/api/picker/` |
| `deliveryPartner` | `apps.delivery_partner` | `/api/delivery-partner/` |
| `farmer` | `apps.farmer` | `/api/farmer/` |
| `pos` | `apps.pos` | `/api/pos/` |

## Maintenance
When backend endpoints change in Django, update the corresponding module in `packages/freshon-api/src/modules/` and increment the version if necessary.
