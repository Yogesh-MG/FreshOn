# Farmer App Specification 🚜

## 1. Onboarding Flow
The onboarding flow is designed to be personal, secure, and verification-heavy to ensure the "Organic" promise.

### Step 1: Welcome & Authentication
- **Greeting Screen**: High-impact visual with text: "Thank you for being an organic farmer. You are the heart of FreshOn."
- **Login**: Phone number entry followed by OTP verification.
- **Intro Video**: A mandatory 60-90 second video from the Founder (Sattya) explaining the mission and the importance of organic farming.

### Step 2: Data Collection (Farm Info)
- **Profile Details**: Name, Contact, Profile Picture.
- **Farm Details**: 
    - Total Acreage (numeric).
    - Farm Location (Google Maps picker + Manual Address).
    - GPS Coordinates (captured automatically).
- **Crops Grown**: Multi-select list of seasonal and perennial crops.
- **Organic Consent**: A digital checkbox/signature with the text: "I solemnly swear that I use only organic practices. I understand that FreshOn maintains a zero-tolerance policy for pesticides."

### Step 3: Verification Media
- **Farm Video**: Mandatory 30-second walk-through of the farm.
- **Product Video**: Close-up video of the current harvest/crop.

### Step 4: Final Greeting
- **Founder Video 2**: A "Welcome to the Family" video from the founder, outlining the next steps for product listing.

## 2. Farmer Dashboard
Once onboarded, the farmer has access to a real-time business dashboard.

### A. My Products
- **List View**: All products listed by the farmer.
- **Status**: Live, Pending Review, Out of Stock.
- **Batch Tracking**: Link to specific harvest batches.

### B. Performance Analytics
- **Sales Volume**: How many units sold in the last 7/30 days.
- **Customer Ratings**: Feedback specifically for their products.
- **Issue Log**: Any reported issues (damaged goods, quality complaints) with photos.

### C. Revenue & Payments
- **Total Earnings**: Lifetime and Current Month.
- **Payout Status**: Upcoming payments and historical transfers.
- **Wallet**: Integrated wallet for secondary transactions.

### D. Inventory Management
- **Add Product**: Form to list a new crop.
- **Update Harvest**: Quick-action button to update quantity after a harvest.

## 3. Real-time Notifications
- New order for their product.
- Pickup scheduled (Picker details).
- Payment processed.
- Quality alert (if a batch fails inspection at the warehouse).
