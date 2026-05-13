# Checkout & Payment Implementation Guide

## Frontend Setup

### Razorpay Script Integration
The Checkout.tsx already loads Razorpay dynamically. Ensure:
1. You have Razorpay account (https://razorpay.com)
2. Backend has RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables
3. Razorpay script is loaded from: `https://checkout.razorpay.com/v1/checkout.js`

### Environment Variables (Frontend)
```
# .env or .env.local
VITE_API_URL=http://localhost:8000
```

### Environment Variables (Backend - .env)
```
# Backend/.env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Migrations
```bash
python manage.py makemigrations delivery
python manage.py makemigrations payment
python manage.py migrate
```

### 3. Create Delivery Slots (Django Admin)
1. Go to http://localhost:8000/admin
2. Navigate to Delivery > Delivery slots
3. Add slots:
   - ID: `express`, Title: `Express`, Description: `Within 12 minutes`, Fee: `₹25`
   - ID: `today-evening`, Title: `Today, 6–8 PM`, Description: `Pick a 2-hour window`, Fee: `FREE`
   - ID: `tomorrow-morning`, Title: `Tomorrow, 7–9 AM`, Description: `Morning delivery`, Fee: `FREE`

### 4. Create Service Areas (Django Admin)
Navigate to Delivery > Service areas and add:

**Koramangala (Default)**
- Name: Koramangala
- Center Latitude: 12.9352
- Center Longitude: 77.6245
- Radius: 2.5 km

**Indiranagar**
- Name: Indiranagar
- Center Latitude: 13.0016
- Center Longitude: 77.6412
- Radius: 2.5 km

**Whitefield**
- Name: Whitefield
- Center Latitude: 12.9698
- Center Longitude: 77.7499
- Radius: 3.0 km

## API Endpoints

### Delivery Slots
```
GET /api/delivery/slots/
Response:
[
  {
    "id": "express",
    "title": "Express",
    "description": "Within 12 minutes",
    "slot_type": "EXPRESS",
    "fee": "25.00",
    "available": true,
    "start_time": null,
    "end_time": null
  },
  ...
]
```

### Delivery Addresses
```
GET /api/delivery/addresses/  # List user's addresses
POST /api/delivery/addresses/  # Add new address
PATCH /api/delivery/addresses/{address_id}/  # Update address
DELETE /api/delivery/addresses/{address_id}/  # Delete address

Request Body (POST/PATCH):
{
  "address_type": "HOME",  # HOME, WORK, OTHER
  "title": "Home",
  "address_line": "402, Lotus Apartments, Koramangala, Bengaluru",
  "latitude": 12.9352,
  "longitude": 77.6245,
  "is_default": false
}
```

### Validate Location
```
POST /api/delivery/validate-location/
Request:
{
  "latitude": 12.9352,
  "longitude": 77.6245,
  "address": "402, Lotus Apartments, Koramangala, Bengaluru"
}

Response:
{
  "valid": true,
  "message": "Delivery available in Koramangala",
  "service_area": "Koramangala"
}
```

### Initialize Razorpay Payment
```
POST /api/payment/razorpay-init/
Authentication: Required (JWT Bearer token)

Request:
{
  "amount": 25900,  # In paise (259 INR)
  "currency": "INR"
}

Response:
{
  "orderId": "order_abc123...",
  "key": "rzp_live_...",
  "amount": 25900,
  "currency": "INR"
}
```

### Verify Razorpay Payment
```
POST /api/payment/razorpay-verify/
Authentication: Required (JWT Bearer token)

Request:
{
  "razorpay_payment_id": "pay_abc123...",
  "razorpay_order_id": "order_abc123...",
  "razorpay_signature": "signature_hex_string"
}

Response:
{
  "success": true,
  "message": "Payment verified successfully",
  "payment_id": "pay_abc123...",
  "order_id": "order_abc123..."
}
```

## Checkout Flow

### Step 0: Address Selection
1. Frontend loads current location from localStorage (set by LocationPermissionBanner)
2. Frontend fetches `/api/delivery/addresses/` to show saved addresses
3. User selects address or adds new one
4. Selected address stored in component state

### Step 1: Delivery Slot
1. Frontend fetches `/api/delivery/slots/`
2. Displays available slots with fees
3. User selects slot
4. Delivery fee updated based on slot

### Step 2: Payment Method
1. Shows UPI, Card, Cash on Delivery options
2. User selects method

### Step 3: Review & Pay
1. Frontend displays:
   - Order items with pricing
   - Delivery address (editable)
   - Delivery slot (editable)
   - Payment method (editable)
   - Total amount
2. On "Place Order":
   - POST `/api/payment/razorpay-init/` to get Razorpay order ID
   - Open Razorpay checkout modal
   - User completes payment
   - Frontend gets payment response
   - POST `/api/payment/razorpay-verify/` to verify
   - POST `/api/orders/orders/` to create order in system
   - Redirect to `/track/{tracking_id}`

## Database Schema

### DeliverySlot
- id (CharField, Primary Key)
- title (CharField)
- description (CharField)
- slot_type (CharField: EXPRESS, SAME_DAY, NEXT_DAY)
- delivery_fee (DecimalField)
- available (BooleanField)
- start_time (TimeField, nullable)
- end_time (TimeField, nullable)
- created_at, updated_at

### DeliveryAddress
- id (AutoField)
- user (ForeignKey to User)
- address_type (CharField: HOME, WORK, OTHER)
- title (CharField)
- address_line (TextField)
- latitude, longitude (DecimalField)
- is_default (BooleanField)
- created_at, updated_at

### ServiceArea
- id (AutoField)
- name (CharField)
- center_latitude, center_longitude (DecimalField)
- radius_km (DecimalField)
- is_active (BooleanField)
- created_at, updated_at

### PaymentTransaction
- id (AutoField)
- order (OneToOneField to Order)
- razorpay_order_id (CharField, unique)
- razorpay_payment_id (CharField)
- razorpay_signature (CharField)
- amount (DecimalField)
- currency (CharField)
- status (CharField: INITIATED, COMPLETED, FAILED, REFUNDED)
- created_at, updated_at

## Testing

### Manual Testing Flow
1. **Address**: Select current location or add new address
2. **Validate Location**: POST to `/api/delivery/validate-location/` with coordinates
3. **Delivery Slot**: Fetch and select slot with fee
4. **Payment**: Use Razorpay Test Credentials
   - Card: 4111 1111 1111 1111, any future date, any CVV
5. **Verify**: Check order created in `/api/orders/orders/`

### Razorpay Test Credentials
Get from: https://dashboard.razorpay.com/app/keys

Test Cards:
- Visa: 4111 1111 1111 1111
- MasterCard: 5555 5555 5555 4444
- Rupay: 6522 2250 7280 6023

Any future expiry date and any CVV will work in test mode.

## Next Steps

1. **Backend Team**: Customize ServiceArea with actual Freshon zones
2. **Backend Team**: Add dispatch status check to prevent editing after dispatch
3. **Backend Team**: Implement order status tracking (PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED)
4. **Frontend Team**: Add address editing modal for "Add new address"
5. **Frontend Team**: Add loading states and error handling UI
6. **QA**: Test full checkout flow with multiple addresses and delivery slots
7. **DevOps**: Set up Razorpay production credentials after testing
