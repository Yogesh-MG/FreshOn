# API Documentation 接口文档 🚀

The Freshon OS API is a RESTful service built with Django Rest Framework. All requests should use `Content-Type: application/json`.

> **SDK Note**: Frontend apps should use the centralized `@freshon/api` SDK instead of making direct API calls. This ensures type safety and consistency across the FreshOn ecosystem.

## Authentication (Secure Cookies)

We use **HttpOnly JWT Cookies**. You do NOT need to manually manage tokens in LocalStorage.

- **Login**: `POST /api/auth/login/`
- **Refresh**: `POST /api/auth/token/refresh/` (Auto-handled by interceptors)
- **Logout**: `POST /api/auth/logout/`
- **Me**: `GET /api/auth/me/` (Returns current user profile)
- **Note**: API endpoints are `@csrf_exempt` to support cross-origin requests from the Tauri app and mobile devices. Security is enforced via JWT HttpOnly cookies and CORS origin validation.

---

## 1. Inventory & Catalog

### **List Categories**
- **Route**: `GET /api/inventory/categories/`
- **Response**: List of category objects (name, emoji, slug).

### **List Product Batches (The Shop)**
- **Route**: `GET /api/inventory/batches/`
- **Query Params**:
    - `product__category__slug`: Filter by category.
    - `is_organic`: `true`/`false`.
    - `is_farm_fresh`: `true`/`false`.
    - `search`: Search by product name or farmer.
- **Purpose**: Main endpoint for the customer shop view.

### **Farmer Profiles**
- **Route**: `GET /api/inventory/farmers/`
- **Detail**: `GET /api/inventory/farmers/{id}/`
- **Purpose**: Fetches the "Verified Farmer" profiles shown on cards.

### **Categories (Lazy-Loaded)**
- **List**: `GET /api/inventory/categories/`
  - Returns lightweight list with `subcategory_count` (no nested data)
- **Detail**: `GET /api/inventory/categories/{slug}/`
  - Returns full category with nested `subcategories` array
- **Subcategories**: `GET /api/inventory/categories/{slug}/subcategories/`
  - Returns only subcategories for a category

---

## 2. User Profile Management

### **Get Profile Data**
- **Route**: `GET /api/auth/profile-data/`
- **Method**: `GET`
- **Purpose**: Fetches address, preferences, and settings in one call

### **Update Profile Data**
- **Route**: `PATCH /api/auth/profile-data/`
- **Method**: `PATCH`
- **Request Body**:
```json
{
  "address": {
    "name": "Home",
    "phone": "9876543210",
    "line1": "123 Main Street",
    "area": "Koramangala",
    "landmark": "Near Park"
  },
  "preferences": {
    "organicOnly": true,
    "vegetarian": true,
    "avoidPlastic": true,
    "allergens": "none"
  },
  "settings": {
    "orderUpdates": true,
    "offers": false,
    "weeklySummary": true
  }
}
```
- **Response**: Updated profile data with success message

---

## 3. Order Management

### **Place Order**
- **Route**: `POST /api/orders/orders/`
- **Method**: `POST`
- **Note**: Prices are calculated securely on the backend - do not send prices from frontend
- **Delivery Slot Options**: `EXPRESS`, `SAME_DAY`, `NEXT_DAY`
- **Request Body**:
```json
{
  "address_title": "Home",
  "address_line": "123 Street Name...",
  "delivery_slot": "EXPRESS",
  "payment_method": "UPI",
  "items": [
    { "batch": "uuid", "quantity": 2 }
  ]
}
```
- **Response**: `201 Created` with `tracking_id`, `subtotal`, `delivery_fee`, `total` (calculated on backend)

### **Track Order**
- **Route**: `GET /api/orders/orders/{tracking_id}/`
- **Status Codes**: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`.

---

## 4. Delivery Management

### **List Delivery Slots**
- **Route**: `GET /api/delivery/slots/`
- **Purpose**: Get available delivery time slots (EXPRESS, SAME_DAY, NEXT_DAY)

### **List Addresses**
- **Route**: `GET /api/delivery/addresses/`
- **Method**: `GET`
- **Purpose**: Get user's saved delivery addresses

### **Save Address**
- **Route**: `POST /api/delivery/addresses/`
- **Method**: `POST`
- **Request Body**:
```json
{
  "address_type": "HOME",
  "title": "Home",
  "address_line": "123 Main Street, Koramangala",
  "latitude": 12.9352,
  "longitude": 77.6245,
  "is_default": true
}
```

### **Update Address**
- **Route**: `PATCH /api/delivery/addresses/{id}/`
- **Method**: `PATCH`

### **Delete Address**
- **Route**: `DELETE /api/delivery/addresses/{id}/`
- **Method**: `DELETE`

### **Validate Location**
- **Route**: `POST /api/delivery/validate-location/`
- **Purpose**: Check if location is within a service area

---

## 5. Payment Processing

### **Initialize Razorpay Order**
- **Route**: `POST /api/payment/razorpay-init/`
- **Method**: `POST`
- **Note**: Total is calculated on backend from items - do not send amount from frontend
- **Request Body**:
```json
{
  "items": [
    { "batch": "uuid", "quantity": 2 }
  ]
}
```
- **Response**: Returns Razorpay order ID, key, and amount (calculated on backend)

### **Verify Payment**
- **Route**: `POST /api/payment/razorpay-verify/`
- **Method**: `POST`
- **Request Body**:
```json
{
  "razorpay_payment_id": "pay_xxx",
  "razorpay_order_id": "order_xxx",
  "razorpay_signature": "signature"
}
```

---

## 6. Wallet & Partnership

### **Get Wallet Balance**
- **Route**: `GET /api/wallet/balance/`
- **Method**: `GET`
- **Response**: `{ "id", "balance", "tier", "created_at", "updated_at" }`

### **Get Wallet Details**
- **Route**: `GET /api/wallet/detail/`
- **Method**: `GET`
- **Response**: Wallet with recent transactions and partnership info

### **Get Transaction History**
- **Route**: `GET /api/wallet/history/`
- **Method**: `GET`
- **Query Params**: `reason`, `limit`, `offset`
- **Response**: Paginated transaction list

### **Initiate Top-up**
- **Route**: `POST /api/wallet/initiate_topup/`
- **Method**: `POST`
- **Request Body**: `{ "amount": 1000 }`
- **Response**: `{ "topup_id", "razorpay_order_id", "amount", "key_id" }`

### **Verify Top-up**
- **Route**: `POST /api/wallet/verify_topup/`
- **Method**: `POST`
- **Request Body**:
```json
{
  "topup_id": 1,
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature"
}
```

### **Get Top-up History**
- **Route**: `GET /api/wallet/topup_history/`
- **Method**: `GET`

### **My Partnership**
- **Route**: `GET /api/partnerships/my_partnership/`
- **Method**: `GET`
- **Response**: PRIDE partnership details (tier, invested amount, dates)

### **Request Refund**
- **Route**: `POST /api/partnerships/request_refund/`
- **Method**: `POST`
- **Purpose**: Withdraw from partnership (100% refundable with 1-month notice)

### **My Referrals**
- **Route**: `GET /api/referrals/my_referrals/`
- **Method**: `GET`
- **Response**: Referral list with total bonus earned

### **Get Referral Code**
- **Route**: `GET /api/referrals/referral_code/`
- **Method**: `GET`
- **Response**: `{ "referral_code": "REF123", "share_link": "https://freshon.in/join?ref=REF123" }`

---

## 7. Location Validation

### **Validate Service Area**
- **Route**: `POST /api/location/validate/`
- **Method**: `POST`
- **Request Body**:
```json
{
  "latitude": 12.9352,
  "longitude": 77.6245,
  "address": "Koramangala, Bangalore"
}
```
- **Response (Valid)**:
```json
{
  "valid": true,
  "message": "Location is within Koramangala service area",
  "service_area": "Koramangala",
  "distance_km": 0.5
}
```
- **Response (Invalid)**:
```json
{
  "valid": false,
  "message": "Location is outside our delivery area. Please select a location within: Koramangala, Indiranagar, Whitefield"
}
```
- **Purpose**: Haversine-based distance check against defined service zones

---

## 5. WebSocket Endpoints

- **Route**: `ws://{host}/ws/notifications/` (In development)
- **Purpose**: Real-time order status updates for the tracking page.
