# Freshon OS - Future Enhancements 🍎

This file tracks the upcoming features and animations to enhance the user experience.

## Infrastructure & SDK 🏛️
- [x] **Centralized SDK (`@freshon/api`)**: Unified TypeScript client for all apps.
- [/] **Consumer App Migration**: 
    - [x] Refactored `Checkout`, `Product`, `Index`, `Track`, and `Profile`.
    - [ ] Complete remaining utility migrations.
- [ ] **Frontend (Website) Migration**: Move Netlify site to the centralized SDK.
- [ ] **Operational Apps Migration**: Wire `Del_app`, `Farm_app`, `Fpick_app`, and `Fpos` to the SDK.
- [ ] **Type Synchronization**: Automated generation of types from Django models.

## PRIDE Partnership (Investment System) ✅ IMPLEMENTED
- [x] **Partner Tiers**: Three investment levels (₹1.5L, ₹3L, ₹5L)
- [x] **30% Flat Discount**: Instant discount (managed at billing)
- [x] **10% Monthly Wallet Credit**: Monthly credits to wallet
- [x] **5% Annual Loyalty Bonus**: Extra 5% after 12 months
- [x] **5% Referral Bonus**: Credit per friend's first purchase
- [x] **Wallet System**: Full wallet with balance tracking
- [x] **Partnership Model**: Partnership table with tier tracking
- [x] **Referral System**: Referral codes and bonus tracking
- [x] **Refund Request**: 1-month notice withdrawal endpoint
- [ ] **Premium Tiers**: ₹5L exclusive perks (free delivery, priority processing, farm visits)
- [ ] **Membership Management**:
    - [ ] **Application Flow**: "Apply for Pride" portal with document upload.
    - [ ] **Withdrawal System**: "Withdraw from Pride" request with 1-month notice automation.
- [ ] **Conversion Integration**:
    - [ ] **Dual Pricing**: Display "Pride Price" (-30%) alongside Regular Price on all product cards.
    - [ ] **Cart Savings Nudge**: Show potential savings if user joins Pride during checkout.
    - [ ] **Pride Landing Page**: Full immersive experience based on the Founding Partner content.
    - [ ] **Savings Dashboard**: Track lifetime savings and wallet credits for active members.
    - [ ] **Investment Flow**: Direct UI for choosing tiers and initiating the NEFT/UPI transfer flow.

## User Search & Discovery
- [ ] **Search History**: Store user search queries on the backend for personalized suggestions.
- [ ] **Smart Suggestions**: Integrate Google Search API to suggest products and categories based on user history and trends.
- [ ] **Hero Promotions**: Add a 5-tab navigation bar at the top of the Hero section promoting specific Freshon highlights (e.g., "Organic Hub", "Farm to Table", "Pride Membership", "Flash Deals", "Bulk Orders").

## Product Catalog & UI Refactor
- [ ] **Direct Product Access**: Modify the category navigation to display products directly instead of an intermediate sub-category layer.
- [ ] **Farmer-Associated Notifications**: Enhance order notifications to include the specific Farmer ID and Batch Number for every product delivered.

## Farmer Ecosystem (New App)
- [ ] **Farmer Onboarding**:
    - [ ] **Welcome Flow**: "Thank you for being an organic farmer" greeting screen.
    - [ ] **Auth**: Phone number + OTP login system.
    - [ ] **Onboarding Videos**: Mandatory video message from the founder after login and after data submission.
    - [ ] **Data Collection**: Detailed farm info (acreage, GPS location, crop list).
    - [ ] **Verification Media**: Upload capability for Farm videos and Product videos.
    - [ ] **Organic Consent**: Legal digital signature/consent confirming organic practices.
- [ ] **Farmer Dashboard**:
    - [ ] **Product Performance**: View their products, sales volume, and customer feedback.
    - [ ] **Issue Tracking**: Report and track any quality or logistics issues.
    - [ ] **Revenue Management**: Real-time revenue tracking and payout status.
    - [ ] **Inventory Entry**: Interface to add new products and harvest batches.

## Centralized Inventory Management (Founder Portal)
- [ ] **End-to-End Tracking**: Full visibility from Warehouse Receipt -> Quality Approval -> Packing -> Delivery.
- [ ] **Chain of Custody**: Track who received, approved, packed, and delivered every batch.
- [ ] **Auto-Restock System**: 
    - [ ] Monitor minimum inventory thresholds per SKU.
    - [ ] Automatically generate reorder requests when thresholds are hit.
    - [ ] Assign restocking and packing tasks to specific employees automatically.

## Logistics & Operations Apps
- [ ] **Picker Application (Geo-Fenced)**:
    - [ ] **Geo-Fencing**: Restrict login and task acceptance based on GPS location (must be at the hub).
    - [ ] **Digital Picking List**: Real-time task assignment.
    - [ ] **Verification**: Camera-based QR/Barcode scanning for picking confirmation.
- [ ] **Delivery Application (Zomato-style)**:
    - [ ] **Assignment Engine**: Real-time assignment to nearest available delivery partners.
    - [ ] **Dynamic Fee Calculation**: Implement `weight * distance * service_type (Swift/Next Day/Normal)` pricing.
    - [ ] **Swift Delivery**: "Immediate Dispatch" logic for urgent orders.
    - [ ] **Load Optimization**: Vehicle-based goods carrying optimization.
    - [ ] **Route Optimization**: Multi-order route sequencing for efficient deliveries.

## AI & Forecasting
- [ ] **Supply-Demand Forecasting Agent**: Develop an AI agent to predict demand based on historical data and weather patterns to optimize farmer harvesting schedules.

## UI/UX & Animations Plan 🌿

### Phase 1: Micro-interactions & Core Motion (Week 1)
- [ ] **Haptic-style Feedback**: Add subtle scale-down on tap for all buttons and product cards (using Framer Motion `whileTap`).
- [ ] **Page Transitions**: Implement "Slide-in" transitions for mobile-native feel between Home -> Category -> Product pages.
- [ ] **Skeleton Loaders**: Replace generic spinners with shimmer-effect skeletons that match the card layouts.

### Phase 2: The "Wow" Interactions (Week 2)
- [ ] **Jump-to-Cart Animation**: 
    - Use Framer Motion's `layoutId` or absolute positioning to fly a thumbnail of the product to the Cart icon.
    - Add a "jiggle" or "pulse" effect to the cart icon when the item lands.
- [ ] **Organic Order Success**:
    - Design an SVG "blooming" animation where a sprout grows into a checkmark.
    - Use Lottie or Framer Motion for a shower of green leaves/petals across the screen upon payment success.

### Phase 3: Status & Feedback (Week 3)
- [ ] **Dynamic Tracking Map**: Add smooth marker transitions for the delivery partner's location.
- [ ] **Progressive Status Bar**: A "breathing" green glow effect for the active stage in the order tracking timeline.
- [ ] **Empty State Magic**: Add a floating "basket" animation for the empty cart page to encourage shopping.

### Phase 4: Performance & Polish
- [ ] **GPU Acceleration**: Ensure all animations use `transform` and `opacity` to maintain 60fps on low-end Android devices.
- [ ] **Staggered Lists**: Implement "Entrance animations" for product grids where cards fade in one-by-one.

## Order Logic
- [ ] **Extended Order Modification**: Allow users to add items to an existing order even after it is placed, as long as the picker hasn't accepted it yet.
- [ ] **Order Locking**: Lock the order only once the dispatching process has officially started.
- [ ] **Easy Reordering**: Streamline the process to reorder previous items before the picker accepts the current batch.

## Tracking & Updates
- [ ] **Real-time Status Sync**: Ensure the UI updates immediately as the order moves through states (Placed -> Picked -> Dispatched -> Delivered).

## Real-time Coordination Architecture
- [ ] **WebSockets (Django Channels)**: Implement a WebSocket layer to push order updates from the backend to all relevant parties (Customer/Picker/Delivery) instantly.
- [ ] **Role-based Channels**: Create specific channels so pickers only hear about new orders, and customers only hear about their specific delivery.
- [ ] **Push Notifications (Firebase)**: Integrate FCM to notify users of status changes even when the app is closed.
- [ ] **Presence Tracking**: Show if a picker or delivery person is currently "Online" or "Active."

## Picker Application (Fulfillment)
- [ ] **Order Queue**: View a real-time list of new orders sorted by priority/delivery slot.
- [ ] **Item Checklist**: Digital checklist for pickers to verify items and quantities (including weight/variant checks).
- [ ] **Out-of-Stock Handling**: Logic for pickers to mark items as unavailable and trigger customer notifications for substitutions.
- [ ] **Order Handover**: Transition the order from "Picked" to "Ready for Dispatch."

## Driver Application (Delivery)
- [ ] **Delivery Routing**: List of assigned orders with optimized route mapping.
- [ ] **GPS Integration**: Real-time location sharing with the customer once the order is "Out for Delivery."
- [ ] **Proof of Delivery**: Photo upload or OTP verification to confirm successful delivery.
- [ ] **Payment Handling**: specialized UI for confirming Cash on Delivery (COD) payments.
