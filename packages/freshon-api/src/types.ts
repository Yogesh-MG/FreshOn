// packages/freshon-api/src/types.ts
// Canonical type definitions for the entire FreshOn ecosystem.
// Derived from the Django backend models in apps/accounts, apps/inventory,
// apps/orders, apps/delivery, apps/payment, and apps/wallet.

// ─── User & Auth ──────────────────────────────────────────────────────

export type UserRole =
  | "ADMIN"
  | "CUSTOMER"
  | "FARMER"
  | "DELIVERY"
  | "PICKER"
  | "POS_OPERATOR";

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  partnership?: PartnershipInfo;
}

export interface PartnershipInfo {
  tier: PartnershipTier;
  tier_display: string;
  invested_amount: number;
  start_date: string;
  total_savings: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: { id: number; username: string; email: string; role: UserRole };
  access: string;
  refresh: string;
}

export interface RegisterRequest {
  username: string;
  email?: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: { id: number; username: string; email: string };
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefreshResponse {
  message: string;
  access: string;
  refresh: string;
}

// ─── Inventory & Catalog ──────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  emoji: string;
  subcategory_count: number;
}

export interface CategoryDetail extends Category {
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
}

export interface InventoryBatch {
  id: string;
  product_id: string;
  product_name: string;
  price: string;
  mrp: string | null;
  stock_level: number;
  harvest_date: string;
  harvest_date_display: string;
  is_organic: boolean;
  is_farm_fresh: boolean;
  base_image: string | null;
  batch_image: string | null;
  category_name: string;
  category_slug: string;
  farmer_id: number;
  farmer_name: string;
  variant?: { unit: string };
}

export interface FarmerProfile {
  id: number;
  user_id: number;
  name: string;
  location: string;
  years_of_experience: number;
  rating: number;
  speciality: string;
  bio: string;
  image: string | null;
}

// ─── Orders ───────────────────────────────────────────────────────────

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod =
  | "WALLET"
  | "WALLET_CARD"
  | "WALLET_UPI"
  | "UPI"
  | "CARD"
  | "COD";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED";

export type DeliverySlotType = "EXPRESS" | "SAME_DAY" | "NEXT_DAY";

export interface PlaceOrderRequest {
  address_title: string;
  address_line: string;
  delivery_slot: DeliverySlotType;
  payment_method: PaymentMethod;
  items: Array<{ batch: string; quantity: number }>;
}

export interface PlaceOrderResponse {
  tracking_id: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
}

export interface Order {
  tracking_id: string;
  user: number;
  address_title: string;
  address_line: string;
  delivery_slot: DeliverySlotType;
  delivery_fee: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  wallet_amount_used: string;
  remaining_amount: string;
  is_paid: boolean;
  subtotal: string;
  total: string;
  status: OrderStatus;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  batch: string | null;
  product_name: string;
  price: string;
  quantity: number;
  unit: string;
}

// ─── Delivery ─────────────────────────────────────────────────────────

export type AddressType = "HOME" | "WORK" | "OTHER";

export interface DeliverySlot {
  id: string;
  title: string;
  description: string;
  slot_type: DeliverySlotType;
  delivery_fee: string;
  available: boolean;
}

export interface DeliveryAddress {
  id: number;
  user: number;
  address_type: AddressType;
  title: string;
  address_line: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
}

export interface SaveAddressRequest {
  address_type: AddressType;
  title: string;
  address_line: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
}

export interface LocationValidationRequest {
  latitude: number;
  longitude: number;
  address: string;
}

export interface LocationValidationResponse {
  valid: boolean;
  message: string;
  service_area?: string;
  distance_km?: number;
}

// ─── Payment ──────────────────────────────────────────────────────────

export interface RazorpayInitRequest {
  items: Array<{ batch: string; quantity: number }>;
}

export interface RazorpayInitResponse {
  razorpay_order_id: string;
  key_id: string;
  amount: number;
  currency: string;
}

export interface RazorpayVerifyRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// ─── Wallet & PRIDE ───────────────────────────────────────────────────

export type WalletTier = "STANDARD" | "PRIDE_1" | "PRIDE_2" | "PRIDE_3";

export type WalletTransactionReason =
  | "TOPUP"
  | "ORDER_PAYMENT"
  | "ORDER_REFUND"
  | "MONTHLY_CREDIT"
  | "LOYALTY_BONUS"
  | "REFERRAL_BONUS";

export type PartnershipTier = "TIER_1" | "TIER_2" | "TIER_3";

export interface Wallet {
  id: number;
  balance: string;
  tier: WalletTier;
  created_at: string;
  updated_at: string;
}

export interface WalletDetail extends Wallet {
  transactions: WalletTransaction[];
  partnership: Partnership | null;
}

export interface WalletTransaction {
  id: number;
  amount: string;
  reason: WalletTransactionReason;
  balance_before: string;
  balance_after: string;
  related_order: string | null;
  created_at: string;
}

export interface WalletTopup {
  id: number;
  amount: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  status: "INITIATED" | "PENDING" | "SUCCESS" | "FAILED";
  created_at: string;
}

export interface TopupInitRequest {
  amount: number;
}

export interface TopupInitResponse {
  topup_id: number;
  razorpay_order_id: string;
  amount: number;
  key_id: string;
}

export interface TopupVerifyRequest {
  topup_id: number;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface Partnership {
  id: number;
  user: number;
  tier: PartnershipTier;
  invested_amount: string;
  monthly_credit_percentage: string;
  annual_loyalty_percentage: string;
  refund_requested: boolean;
  start_date: string;
}

export interface Referral {
  id: number;
  referrer: number;
  referee: number;
  referral_code: string;
  bonus_amount: string;
  status: "PENDING" | "COMPLETED" | "CREDITED" | "FAILED";
  first_order: string | null;
  bonus_credited_date: string | null;
}

export interface ReferralCodeResponse {
  referral_code: string;
  share_link: string;
}

// ─── Customer Profile ─────────────────────────────────────────────────

export interface CustomerPreferences {
  organic_only: boolean;
  vegetarian: boolean;
  avoid_plastic: boolean;
  allergens: string;
  notes: string;
}

export interface CustomerSettings {
  order_updates: boolean;
  offers: boolean;
  weekly_summary: boolean;
  private_profile: boolean;
}

export interface CustomerProfileData {
  address: DeliveryAddress | null;
  preferences: CustomerPreferences;
  settings: CustomerSettings;
}

export interface UpdateProfileRequest {
  address?: Partial<SaveAddressRequest>;
  preferences?: Partial<CustomerPreferences>;
  settings?: Partial<CustomerSettings>;
}

// ─── Picker (Fpick_app) ──────────────────────────────────────────────

export type PickItemStatus = "pending" | "scanning" | "packed" | "issue" | "substituted";
export type PickerOrderStatus = "queued" | "in_progress" | "qa" | "ready";
export type PickerOrderPriority = "urgent" | "high" | "normal";

export interface PickerSubstitution {
  name: string;
  sku: string;
  reason: string;
}

export interface PickItem {
  id: string;
  name: string;
  sku: string;
  batch: string;
  quantity: number;
  unit: string;
  location: string;
  emoji: string;
  status: PickItemStatus;
  substitutions: PickerSubstitution[];
}

export interface PickerOrder {
  id: string;
  customer: string;
  deadline_minutes: number;
  item_count: number;
  priority: PickerOrderPriority;
  items: PickItem[];
  status: PickerOrderStatus;
}

export interface PickerGeoVerifyRequest {
  latitude: number;
  longitude: number;
}

export interface PickerGeoVerifyResponse {
  verified: boolean;
  message: string;
  hub_name?: string;
}

export interface PickerScanRequest {
  item_id: string;
  barcode: string;
}

// ─── Delivery Partner (Del_app) ───────────────────────────────────────

export type DeliveryServiceType = "swift" | "next-day" | "standard";
export type MissionStopType = "pickup" | "dropoff";

export interface MissionStopItem {
  name: string;
  qty: number;
  weight: string;
  fragile?: boolean;
}

export interface MissionStop {
  id: string;
  type: MissionStopType;
  label: string;
  address: string;
  customer?: string;
  eta: string;
  items?: MissionStopItem[];
  notes?: string;
}

export interface DeliveryMission {
  id: string;
  service: DeliveryServiceType;
  earnings: number;
  distance_km: number;
  weight_kg: number;
  stops: MissionStop[];
  fee: { weight: number; distance: number; premium: number };
}

export interface DeliveryPartnerStats {
  earnings: number;
  goal: number;
  deliveries: number;
  distance: number;
  rating: number;
}

export interface ProofOfDeliveryRequest {
  mission_id: string;
  stop_id: string;
  type: "otp" | "photo";
  otp_code?: string;
  photo_data?: string; // base64
}

export interface DeliveryPartnerStatusRequest {
  online: boolean;
  latitude: number;
  longitude: number;
}

// ─── Farmer (Farm_app) ────────────────────────────────────────────────

export interface FarmerRegistrationRequest {
  phone: string;
  otp?: string;
  name?: string;
}

export interface FarmerProfileUpdate {
  name?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  total_acreage?: number;
  speciality?: string;
  bio?: string;
}

export interface FarmerMediaUpload {
  type: "farm_video" | "product_video" | "profile_photo";
  file: File | Blob;
}

export interface FarmerBatch {
  id: string;
  product_id: string;
  product_name: string;
  price: string;
  mrp: string | null;
  stock_level: number;
  harvest_date: string;
  is_organic: boolean;
  status: "Live" | "Pending Review" | "Out of Stock";
}

export interface FarmerAddBatchRequest {
  product_id: string;
  price: number;
  mrp?: number;
  stock_level: number;
  harvest_date: string;
  is_organic: boolean;
}

export interface FarmerDashboardMetrics {
  total_earnings: number;
  current_month_earnings: number;
  total_products: number;
  live_products: number;
  avg_rating: number;
  total_orders: number;
  weekly_sales: number;
  monthly_sales: number;
}

export interface FarmerPayout {
  id: string;
  amount: number;
  status: "pending" | "processing" | "completed";
  created_at: string;
  completed_at: string | null;
}

// ─── POS (Fpos) ───────────────────────────────────────────────────────

export type PosPaymentMethod = "Cash" | "UPI" | "Card" | "Sodexo" | "Wallet";
export type WastageReason = "Spoiled" | "Damaged" | "Expired";
export type LoyaltyTier = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface PosProduct {
  pid: string;
  name: string;
  price: number;
  weighed: boolean;
  category: string;
  stock: number;
  low_stock_threshold: number;
  member_eligible?: boolean;
}

export interface PosCartItem {
  pid: string;
  name: string;
  unit_price: number;
  weighed: boolean;
  quantity: number;
  member_eligible?: boolean;
}

export interface PosTender {
  method: PosPaymentMethod;
  amount: number;
}

export interface PosCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tier: LoyaltyTier;
  points: number;
  pride?: boolean;
  wallet_balance?: number;
}

export interface PosOrderRequest {
  customer_id: string;
  items: PosCartItem[];
  tenders: PosTender[];
  subtotal: number;
  member_discount: number;
  surcharge: number;
  total: number;
}

export interface PosTransaction {
  id: string;
  customer_id: string;
  items: PosCartItem[];
  tenders: PosTender[];
  method: PosPaymentMethod | "Split";
  subtotal: number;
  member_discount: number;
  surcharge: number;
  total: number;
  timestamp: number;
  receipt_delivery?: "Print" | "WhatsApp" | "SMS";
}

export interface PosShift {
  started_at: number;
  opening_cash: number;
  cash_sales: number;
  total_sales: number;
  txn_count: number;
}

export interface PosShiftOpenRequest {
  employee_id: string;
  opening_cash: number;
}

export interface PosShiftCloseRequest {
  closing_cash: number;
  notes?: string;
}

export interface PosShiftSummary extends PosShift {
  closing_cash: number;
  variance: number;
  transactions: PosTransaction[];
}

export interface PosWastageEntry {
  pid: string;
  name: string;
  quantity: number;
  weighed: boolean;
  unit_price: number;
  reason: WastageReason;
}

export interface PosLoginRequest {
  employee_id: string;
  pin: string;
}

// ─── WebSocket Events ─────────────────────────────────────────────────

export type WSChannel = "orders" | "picker" | "delivery" | "admin";

export interface WSOrderEvent {
  type: "order_status_changed";
  tracking_id: string;
  status: OrderStatus;
  timestamp: string;
}

export interface WSPickerEvent {
  type: "new_order" | "order_cancelled";
  order_id: string;
  customer: string;
  item_count: number;
  priority: PickerOrderPriority;
}

export interface WSDeliveryEvent {
  type: "new_assignment" | "assignment_cancelled";
  mission: DeliveryMission;
}

export type WSEvent = WSOrderEvent | WSPickerEvent | WSDeliveryEvent;

// ─── Paginated Response ───────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── API Error ────────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  message: string;
  detail?: string;
  errors?: Record<string, string[]>;
}
