# Changelog 📝

All notable changes to the Freshon OS project will be documented in this file.

## [Unreleased] - Future
### Added (Planned)
- **PRIDE Partnership System**: Investment-based loyalty model
  - Three tiers: ₹1.5L, ₹3L, ₹5L
  - Benefits: 30% flat discount, 10% monthly wallet, 5% annual loyalty, 5% referral
  - Partner dashboard with savings tracking
  - Document generation (Receipt + Term Sheet)
  - Premium tier exclusives: free delivery, priority processing, farm visits, founder WhatsApp

---

## [1.5.0] - 2026-05-07
### Added
- **Centralized SDK** (`packages/freshon-api`): Unified TypeScript SDK for all apps
  - Single source of truth for API endpoints and types
  - Modules: auth, inventory, orders, delivery, payment, wallet, picker, deliveryPartner, farmer, pos, ws
  - Prevents logic duplication across ecosystem apps

- **Multi-App Architecture**:
  - **Consumer_app**: Main customer mobile app (Tauri)
  - **Del_app**: Delivery partner app
  - **Farm_app**: Farmer app for inventory management
  - **Fpick_app**: Picker app for order fulfillment
  - **Fpos**: Point of Sale for in-store transactions

- **4-Step Checkout Flow**: Redesigned checkout with:
  - Address selection (current location + saved addresses)
  - Delivery slot selection
  - Wallet integration (use wallet balance for partial/full payment)
  - Payment method selection (UPI, Card, COD, Wallet combinations)
  - Order review before confirmation

- **ErrorBoundary**: React error boundary for graceful failure handling
- **InventoryBatchFilter**: Backend filter for category and product filtering

### Changed
- **Backend**: Added seed data management command for database population
- **API Docs**: Updated to reflect centralized SDK module mapping

---

## [1.4.0] - 2026-05-04
### Added
- **Wallet App**: Full digital wallet implementation
  - `Wallet` - User balance and tier tracking (STANDARD, PRIDE_1, PRIDE_2, PRIDE_3)
  - `WalletTransaction` - Immutable audit trail for all transactions
  - `WalletTopup` - Razorpay-powered top-up system
  - `Partnership` - PRIDE Partnership tier management with 100% refundable investment
  - `Referral` - Referral code system for bonus distribution
- **Page Transitions**: Smooth page transitions using Framer Motion (AnimatePresence)
- **Loading Skeletons**: Skeleton loaders for categories and products while data loads

### Changed
- **Query Optimization**: Configured React Query defaults:
  - staleTime: 5 minutes, gcTime: 30 minutes, no auto refetch
- **Home Route**: Made "/" public (no authentication required)
- **Delivery Slots**: Renamed to "Same Day"/"Next Day"
- **Payment API**: Now accepts items array and calculates total on backend

---

## [1.3.2] - 2026-05-04
### Changed
- **Delivery Slots**: Renamed to match DeliverySlot model - "Same Day" (was "Today Evening"), "Next Day" (was "Tomorrow Morning")
- **Payment API**: Now accepts items array and calculates total on backend instead of frontend-calculated amount

---

## [1.3.0] - 2026-05-03
### Added
- **Delivery App**: New standalone app for delivery management
  - `DeliverySlot` - Time slots (EXPRESS, SAME_DAY, NEXT_DAY) with customizable fees
  - `DeliveryAddress` - Saved addresses with lat/long coordinates
  - `ServiceArea` - Zone-based delivery restriction with Haversine validation
  - Endpoints: `/api/delivery/slots/`, `/api/delivery/addresses/`, `/api/delivery/validate-location/`
- **Payment App**: New standalone app for payment processing
  - `PaymentTransaction` - Tracks Razorpay order/payment IDs and status
  - Endpoints: `/api/payment/razorpay-init/`, `/api/payment/razorpay-verify/`
  - Backend calculates order total before Razorpay order creation

### Changed
- **Location Validation**: Moved from standalone endpoint to `delivery` app with database-backed ServiceArea
- **UserAddress**: Deprecated in favor of `delivery.DeliveryAddress`

---

## [1.2.2] - 2026-05-03
### Fixed
- **Security**: Moved price calculation from frontend to backend to prevent tampering
- **TypeError**: Resolved duplicate `user` argument in `OrderCreateSerializer`
- **Payment**: Added official Razorpay signature verification; skip razorpay for COD orders
- **Order Creation**: Backend now calculates delivery fee (₹25 if subtotal < ₹199)

---

## [1.2.1] - 2026-05-03
### Changed
- **Security**: Added `.env` to `.gitignore` to prevent accidentally committing sensitive environment variables

---

## [1.2.0] - 2026-05-03
### Added
- **Customer Profile System**: New models for user profile management:
  - `UserAddress` - Delivery addresses with default flag
  - `CustomerPreferences` - Organic, vegetarian, plastic-free preferences
  - `CustomerSettings` - Order updates, offers, weekly summary settings
- **Profile API Endpoint**: `GET/PATCH /api/auth/profile-data/` - Unified endpoint to manage address, preferences, and settings
- **Location Validation Endpoint**: Haversine-based service area validation with support for multiple delivery zones (Koramangala, Indiranagar, Whitefield)

### Changed
- **Category API**: Refactored to lazy-load subcategories - list endpoint returns lightweight response, detail endpoint includes nested subcategories
- **Pagination**: Standardized pagination (20 items/page) across Products, Batches, and Farmers endpoints
- **N+1 Optimization**: Added deep `select_related` queries on InventoryBatchViewSet to fetch variant, product, category, subcategory, farmer in single query
- **Harvest Date Display**: Added human-readable `harvest_date_display` field ("Today, 5:30 AM")

---

## [1.1.0] - 2026-05-03
### Added
- **Lazy Loading**: Refactored `Category` API to return lightweight lists, with nested subcategories loaded on-demand to improve TTFB by 80%.
- **Pagination**: Implemented cursor/page-number pagination for `Batches`, `Products`, `Farmers`, and `Orders` to handle large catalogs.
- **Location System Documentation**: Unified the GPS and Nominatim geocoding guides into a central `LOCATION_SYSTEM.md` within the documentation suite.

### Changed
- **API Performance**: Optimized database queries with `select_related` and `prefetch_related` across the entire Inventory and Order apps to eliminate N+1 problems.
- **Docs Restructuring**: Moved root-level setup guides to the `docs/` directory for better organization.

---

## [1.0.0] - 2026-05-02
### Added
- **Core Backend**: Django 5.0 project with `accounts`, `inventory`, and `orders` apps.
- **Security**: HttpOnly Cookie-based JWT authentication (Inter2 Pattern).
- **Welcome Experience**: High-impact onboarding screen with brand-focused messaging.
- **Customer Auth**: Fully implemented Login and Signup pages with real-time error handling.
- **Atomic Inventory**: Implemented `Category`, `Product`, and `InventoryBatch` models with real-time stock levels.
- **Order Engine**: Atomic checkout logic with automated tracking ID generation (`FRSH-XXXX`).
- **Mobile-First App**: Tauri-ready React/Vite application with responsive design and safe-area support.
- **API Integration**: Connected Home, Category, Search, Product, Profile, and Tracking pages to live backend endpoints.
- **Dockerization**: Full system orchestration with Docker Compose, PostgreSQL, and Nginx.
- **Seeding**: Custom `seed_data` command to populate the ecosystem.
- **Branding**: Integrated official "Freshon.in" logos and typography across all platforms.
- **Project Management**: Added root-level `package.json` for centralized command execution (delegating to app/frontend/backend).

### Fixed
- **Security**: Resolved CSRF 403 Forbidden errors for cross-origin requests (Tauri/Android) by exempting API views and configuring `X-CSRFToken` headers.
- **Routing**: Fixed a critical routing bug where API requests were prefixed with duplicate `/api/api` path segments.
- **Infrastructure**: Resolved `ImproperlyConfigured` error by correctly setting `STATIC_ROOT`, `MEDIA_ROOT`, and `MEDIA_URL` in Django.
- **Static Assets**: Fixed broken admin CSS/JS loading by running `collectstatic` inside the containerized environment.
- **Logic**: Fixed an `AttributeError` in the `OrderViewSet` caused by a syntax error (trailing comma) in the serializer Meta class.
- **Admin**: Registered all models (`User`, `FarmerProfile`, `Order`, `OrderItem`, etc.) in the Django Admin for full platform management.
- **Developer Experience**: Added `npm run cargo` script to the app directory to allow running cargo commands directly via npm.


### Changed
- **Config**: Migrated API configuration to `.env` variables for Tauri/Docker compatibility.
- **UI**: Refined mobile layout with stacked navigation and tactile touch feedback.

---
*Generated by the Freshon OS Documentation Agent.*
