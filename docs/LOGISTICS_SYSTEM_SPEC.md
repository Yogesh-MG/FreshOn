# Logistics & Inventory Operations Spec 📦

## 1. Centralized Inventory Management (Founder/Admin Portal)
A bird's-eye view of the entire supply chain.

### A. Chain of Custody Tracking
Every product batch tracks the following touchpoints:
1. **Warehouse Receipt**: Logged by receiver upon arrival from farm.
2. **Quality Approval**: Logged by QA manager (Approved/Rejected/Partial).
3. **Packing**: Logged when broken down into consumer units (e.g., 25kg sack -> 50x 500g packets).
4. **Delivery Handover**: Logged when assigned to a delivery partner.

### B. Smart Reordering
- **Threshold Monitoring**: System checks real-time stock vs. `min_threshold` for each SKU.
- **Automated Workflows**: When stock is low:
    - Alert sent to Admin.
    - Draft PO (Purchase Order) generated for the specific farmer.
    - Employee assigned to "Restock & Pack" task in the warehouse app.

## 2. Picker Application (Fulfillment)
Designed for high-speed, accurate order preparation.

### A. Geo-Fencing & Auth
- **GPS Verification**: Login is only enabled when the user's coordinates are within 100m of the Hub/Warehouse.
- **Role**: Credentials restricted to Picking staff.

### B. Picking Workflow
- **Task Queue**: Orders sorted by "Dispatch Deadline".
- **Digital Checklist**: Item name, quantity, and variant.
- **Verification**: Use mobile camera to scan QR codes on product batches.
- **Real-time Sync**: Picking progress updates the Customer App (e.g., "Picker is gathering your items").

## 3. Delivery Application (Logistics)
A high-performance app for delivery partners.

### A. Assignment Logic
- **Availability Toggle**: "Online/Offline" status.
- **Proximity Assignment**: Orders assigned to the nearest available partner.

### B. Delivery Fee Engine
Formula: `Total Fee = (Weight * W_Rate) + (Distance * D_Rate) + Service_Premium`
- **Swift**: Immediate pickup/delivery (Highest premium).
- **Next Day**: Standard slot (Medium premium).
- **Normal**: Bulk/Flexi slot (Lowest premium).

### C. Route & Load Optimization
- **Vehicle Profiles**: Optimize load based on vehicle type (Cycle, Bike, Van).
- **Multi-Order Sequencing**: AI-driven route optimization to deliver 5-10 orders in a single trip with the least mileage.

### D. Proof of Delivery
- **QR/OTP**: Secure handover confirmation.
- **Photo**: Option to take a photo of the delivery at the doorstep.
