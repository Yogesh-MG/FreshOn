# PRIDE Partnership - Design & Integration Schema 🍎

This document outlines the technical and UI/UX design for the PRIDE Partnership conversion system.

## 1. Core Logic & Data Schema

### A. Tiers & Benefits
| Tier | Investment | Monthly Limit | Instant Discount | Monthly Credit | Annual Bonus | Exclusives |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | ₹1.5 Lakh | ₹3,000 | 30% | 10% | 5% | - |
| **Tier 2** | ₹3.0 Lakh | ₹6,000 | 30% | 10% | 5% | - |
| **Tier 3** | ₹5.0 Lakh | ₹10,000 | 30% | 10% | 5% | Free Delivery, Priority, Farm Visits |

### B. Pricing Logic
On every product listing (Web & App), the following logic applies:
- `regularPrice`: Fetch from API (default).
- `pridePrice`: `regularPrice * 0.70` (30% discount).
- `savings`: `regularPrice - pridePrice`.

### C. Backend Model Synchronization
The `Partnership` model in `wallet` app already tracks the basics.
- **Monthly Credits**: A cron job runs on the 1st of every month to credit 10% of the `invested_amount` (capped by tier limit usage) to the user's wallet.
- **Annual Bonus**: Check `start_date` and credit 5% of `invested_amount` after 12 months.

## 2. UI/UX Design System

### A. The "Pride" Brand Palette
- **Primary**: `hsl(45, 100%, 50%)` (Golden Harvest)
- **Secondary**: `hsl(142, 72%, 29%)` (Forest Green)
- **Background**: `hsl(45, 100%, 96%)` (Soft Cream)

### B. Global Integration Points

#### 1. Product Cards (Search, Home, Categories)
- Show the **Pride Price** as the main price for members.
- Show both prices for non-members with a "Convert to Pride" badge.
- Tooltip explaining: "Price after 30% Partner Discount."

#### 2. Cart & Summary
- `Subtotal` (Regular)
- `Pride Partner Discount` (-30%)
- `Payable` (Final)
- *Non-member nudge*: "Join Pride to save ₹X on this order."

#### 3. Checkout Page
- Pride Members see a "Pride Verified" badge.
- Automatic waiver of delivery fee for Tier 3.

## 3. High-Conversion Landing Page (`/pride`)

### Sections:
1. **Hero**: 11 Years Trusted, 50% Total Savings, Starts from ₹1.5L.
2. **The "Why"**: Banks vs. Customers (Sattya's Philosophy).
3. **Savings Calculator**: Interative tool to calculate ROI on investment.
4. **Member Testimonials**: Jayanagar, HSR, Indiranagar success stories.
5. **Security Section**: 100% Refundable, Signed Documents, Legal Protection.
6. **Selection Grid**: The 3 tiers with CTA "Reserve My Slot".

## 4. Implementation Roadmap

### Phase 1: Product Display Sync
- Modify `ProductCard.tsx` (Web/App) to include dual pricing.
- Add `PridePrice` component with shimmer effect to grab attention.

### Phase 2: Cart Nudge
- Implement a floating sticky bar in the cart: "You're 1 step away from 30% off."

### Phase 3: The PRIDE Page
- Build the immersive long-form landing page with Framer Motion animations.
- Integrate the "Selection" flow which leads to the investment confirmation.

### Phase 4: Administrative Dashboard
- Backend view for Sattya to approve partnerships and upload signed PDF documents.
