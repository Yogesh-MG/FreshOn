export interface ApiErrorBody {
  detail?: string;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface RegisterRequest {
  phone: string;
}

export interface RegisterResponse {
  message: string;
  debug_otp?: string;
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
  name: string;
}

export interface AuthUser {
  id: number;
  username?: string;
  name?: string;
  phone?: string;
  email?: string | null;
  role?: string;
  is_verified?: boolean;
}

export interface AuthResponse {
  message?: string;
  is_new_user?: boolean;
  profile_complete?: boolean;
  access: string;
  refresh: string;
  user: AuthUser;
}

export interface FarmerProfile {
  id: number;
  name: string;
  phone?: string;
  email?: string | null;
  location?: string;
  years_of_experience?: number;
  rating?: number;
  speciality?: string;
  bio?: string;
  image?: string;
  latitude?: number;
  longitude?: number;
  total_acreage?: number;
  farm_name?: string;
  crops?: string[];
  organic_pledge_accepted?: boolean;
  organic_pledge_signature?: string;
  organic_pledge_accepted_at?: string;
  preferred_language?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardTransaction {
  id: number | string;
  amount?: number | string;
  type?: "credit" | "debit" | string;
  description?: string;
  desc?: string;
  created_at?: string;
  date?: string;
}

export interface DashboardData {
  total_products?: number;
  total_sales?: number;
  total_reviews?: number;
  avg_rating?: number;
  total_orders?: number;
  total_earnings?: number;
  current_month_earnings?: number;
  live_products?: number;
  weekly_sales?: number;
  monthly_sales?: number;
  pending_payouts?: number;
  available_balance?: number;
  lifetime_earnings?: number;
  monthly_earnings?: number;
  recent_transactions?: DashboardTransaction[];
  unread_notifications_count?: number;
  upcoming_deliveries?: number;
  sales_7d?: Array<{ d: string; v: number }>;
  sales_30d?: Array<{ d: string; v: number }>;
}

export interface Batch {
  id: number | string;
  product_id?: number | string;
  product_name?: string;
  crop_name?: string;
  name?: string;
  category?: string;
  quantity?: number | string;
  stock?: number | string;
  unit?: string;
  price_per_unit?: number | string;
  price?: number | string;
  harvest_date?: string;
  description?: string;
  image?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBatchPayload {
  product_id?: number;
  custom_product_name?: string;
  price: number;
  mrp?: number;
  stock_level: number;
  harvest_date?: string;
  is_organic?: boolean;
}

export interface CatalogVariant {
  id: number;
  unit: string;
  is_active?: boolean;
}

export interface CatalogProduct {
  id: number;
  name: string;
  description?: string;
  base_image?: string | null;
  category?: number;
  category_name?: string;
  variants?: CatalogVariant[];
}

export interface Payout {
  id: number | string;
  amount: number | string;
  status?: "pending" | "processing" | "completed" | "failed" | string;
  date?: string;
  created_at?: string;
  completed_at?: string | null;
  method?: string;
  transaction_ref?: string;
  notes?: string;
}

export interface OrderItem {
  product_name?: string;
  quantity?: number;
  unit?: string;
  price?: number | string;
  total?: number | string;
}

export interface FarmerOrder {
  id: number | string;
  tracking_id?: string;
  customer_name?: string;
  buyer?: string;
  status?: string;
  total?: number | string;
  created_at?: string;
  items?: OrderItem[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface BankDetails {
  id?: number;
  account_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name?: string;
  upi_id?: string;
  is_verified?: boolean;
}

export interface FarmerNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}
