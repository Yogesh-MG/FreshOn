# Features Documentation 🚀

Freshon OS is packed with features designed for both the modern consumer and the local farmer.

## 0. Ecosystem Overview

FreshOn operates as a multi-app platform with centralized infrastructure:

| App | Purpose | Users |
|-----|---------|-------|
| **Consumer App** | Mobile app for customers | Shoppers, home delivery |
| **Farmer App** | Inventory management | Farmers, suppliers |
| **Picker App** | Order fulfillment | In-store pickers |
| **Delivery App** | Last-mile delivery | Delivery partners |
| **POS** | In-store checkout | Walk-in customers |

**Centralized SDK** (`@freshon/api`): All apps share the same TypeScript SDK for API communication, ensuring type consistency and reducing code duplication.

---

## 1. PRIDE Partnership (Investment Model)

*Coming Soon* - A revolutionary partnership model where customers invest in FreshOn.in and receive ongoing grocery savings.

### **Investment Tiers**
| Tier | Investment | Monthly Bill Limit | Key Benefits |
|------|------------|-------------------|--------------|
| Basic | ₹1.5L | ₹3,000/mo | 30% discount + 10% wallet + 5% annual + 5% referral |
| Popular | ₹3L | ₹6,000/mo | Same as Basic |
| Premium | ₹5L | ₹10,000/mo | All benefits + Free delivery + Priority processing + Farm visits + Founder WhatsApp + Birthday bonus |

### **Benefits Explained**
- **30% Flat Discount**: Applied instantly at billing - no promo codes
- **10% Monthly Wallet**: Credited monthly, never expires
- **5% Annual Loyalty**: Extra 5% after 12 months
- **5% Referral Bonus**: ₹900+ per friend's first purchase
- **Wallet Carry-forward**: Unused benefits roll to wallet forever

### **Partner Dashboard**
- View tier status and benefits
- Track savings (monthly/annual)
- Wallet balance and history
- Referral management
- Document access (Receipt, Term Sheet)

---

## 2. Consumer Features

### **Smart Catalog**
- **Dynamic Categories**: Instant navigation between Fruits, Vegetables, Dairy, and Grains.
- **Search & Discovery**: Real-time search with trending suggestions.
- **Organic Filter**: One-tap toggle to see only pesticide-free items.
- **Lazy Loading**: Categories load lightweight data first; subcategories loaded on demand for 80% faster TTFB.

### **Frictionless Checkout**
- **12-Minute Slots**: Integrated "Express" delivery scheduling.
- **Multiple Slots**: Same Day and Next Day delivery options with configurable fees.
- **Flexible Payments**: Support for UPI, Cards, and Cash on Delivery.
- **Real-Time Tracking**: Status timeline from farm-hub to doorstep.
- **Hybrid Location System**: GPS + Nominatim search for precise delivery addressing.
- **Service Area Validation**: Haversine-based distance check ensures delivery only to supported zones (Koramangala, Indiranagar, Whitefield).

### **Saved Addresses**
- **Multiple Addresses**: Save home, work, and other addresses
- **GPS Coordinates**: Store lat/long for precise delivery mapping
- **Default Selection**: Set primary address for faster checkout

### **Personalized Preferences**
- **Dietary Preferences**: Organic-only, vegetarian, plastic-free packaging options
- **Smart Notifications**: Order updates, promotional offers, weekly digest
- **Privacy Controls**: Private profile toggle for public visibility
- **Unified Profile**: Single endpoint manages address, preferences, and settings

### **Farmer Traceability**
- **Verified Profiles**: View farmer years of experience, rating, and farm location.
- **Harvest Timestamps**: Know exactly when your food was picked (e.g., "Today, 5:30 AM").

---

## 2. Platform Management

### **Admin Dashboard**
- **Inventory Control**: Manage global products and categories.
- **Auditing**: Review every order and its associated inventory batch.
- **Farmer Onboarding**: Verify and manage farmer credentials.

---

## 3. Engineering "Invisible" Features

### **Secure Payments**
- **Razorpay Integration**: Official payment gateway integration
- **Backend Calculation**: Order totals calculated server-side to prevent tampering
- **Signature Verification**: Client-side signature validation using Razorpay SDK
- **Transaction Logging**: Complete payment history with status tracking

### **Digital Wallet**
- **Wallet Balance**: Track available balance for purchases
- **Top-up via Razorpay**: Add money to wallet with card/UPI
- **Transaction History**: Full audit trail (top-ups, payments, refunds, credits)
- **Auto-deduct**: Use wallet balance at checkout

### **PRIDE Partnership (Live)**
- **Investment Tiers**: ₹1.5L (Tier 1), ₹3L (Tier 2), ₹5L (Tier 3)
- **30% Flat Discount**: Instant discount at billing counter
- **10% Monthly Wallet Credit**: Monthly credits (never expires)
- **5% Annual Loyalty Bonus**: Extra 5% after 12 months
- **5% Referral Bonus**: Bonus per friend's first purchase
- **100% Refundable**: Withdraw anytime with 1-month notice
- **Premium Perks**: Free delivery, priority processing, farm visits (₹5L tier)

### **Referral System**
- **Unique Referral Codes**: Shareable codes for new users
- **Bonus Tracking**: Track referrals and earned bonuses
- **Share Link**: Easy shareable join link

### **Security**
- **XSS Protection**: HttpOnly Cookies for JWT storage.
- **CSRF Protection**: Native Django CSRF tokens for form submissions.

### **Performance**
- **Image Optimization**: Dynamic sizing for product and farmer photos.
- **Database Indexing**: Optimized lookups for category slugs and tracking IDs.
- **Dockerized Micro-services**: Independent scaling for frontend and backend.
- **Smart Caching**: React Query configured with 5-minute stale time and 30-minute garbage collection to reduce unnecessary API calls.
- **Loading Skeletons**: Graceful loading states with skeleton UI for categories and products.

### **Animations & UX**
- **Page Transitions**: Smooth transitions between pages using Framer Motion
- **AnimatePresence**: Animated route changes for a premium feel

---

## 4. Future Roadmap (In-Development)

### **Farmer Ecosystem**
A dedicated application for our organic farming partners to manage their life-cycle with FreshOn.
- **Verification-First Onboarding**: Multi-stage video and data verification.
- **Performance Dashboard**: Sales tracking and quality feedback.
- *See [FARMER_APP_SPEC.md](./FARMER_APP_SPEC.md) for details.*

### **Intelligent Logistics & Inventory**
A centralized hub for warehouse and delivery operations.
- **End-to-End Traceability**: Batch tracking from farm to doorstep.
- **Picker App**: Geo-fenced picking with QR verification.
- **Delivery App**: Zomato-style partner assignment and route optimization.
- *See [LOGISTICS_SYSTEM_SPEC.md](./LOGISTICS_SYSTEM_SPEC.md) for details.*

### **Smart Discovery & Personalization**
- **Search History**: Personalized suggestions based on user behavior.
- **Google Search Integration**: External API integration for smarter catalog discovery.
- **Hero Tabs**: High-conversion landing tabs for key FreshOn services.
- *See [SEARCH_PERSONALIZATION_SPEC.md](./SEARCH_PERSONALIZATION_SPEC.md) for details.*

### **AI Supply-Demand Agent**
- Forecasting agent to predict consumer demand and coordinate harvest schedules with farmers to minimize wastage.
