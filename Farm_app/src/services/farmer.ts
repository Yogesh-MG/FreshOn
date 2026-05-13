import apiClient, { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "./api";
import {
  AuthResponse,
  Batch,
  CreateBatchPayload,
  DashboardData,
  FarmerProfile,
  Payout,
  FarmerOrder,
  PaginatedResponse,
  CatalogProduct,
  RegisterRequest,
  RegisterResponse,
  VerifyOTPRequest,
  BankDetails,
  FarmerNotification,
} from "@/types/api";

const persistAuth = (data: AuthResponse) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  localStorage.setItem("farmer_id", String(data.user.id));
};

export const farmerService = {
  register: async (data: RegisterRequest) => {
    return apiClient.post<RegisterResponse>("/farmer/register/", data, { skipAuth: true });
  },

  verifyOTP: async (data: VerifyOTPRequest) => {
    const response = await apiClient.post<AuthResponse>("/farmer/register/", data, { skipAuth: true });
    persistAuth(response);
    return response;
  },

  getProfile: async () => {
    return apiClient.get<FarmerProfile>("/farmer/profile/");
  },

  updateProfile: async (data: Partial<FarmerProfile>) => {
    return apiClient.patch<FarmerProfile>("/farmer/profile/", data);
  },

  getDashboard: async () => {
    return apiClient.get<DashboardData>("/farmer/dashboard/");
  },

  getBatches: async () => {
    return apiClient.get<Batch[]>("/farmer/batches/");
  },

  getCatalogProducts: async () => {
    const response = await apiClient.get<PaginatedResponse<CatalogProduct> | CatalogProduct[]>("/inventory/products/");
    return Array.isArray(response) ? response : response.results;
  },

  createBatch: async (data: CreateBatchPayload) => {
    return apiClient.post<Batch>("/farmer/batches/", data);
  },

  updateBatch: async (id: number | string, data: Partial<CreateBatchPayload>) => {
    return apiClient.patch<Batch>(`/farmer/batches/${id}/`, data);
  },

  getPayouts: async () => {
    return apiClient.get<Payout[]>("/farmer/payouts/");
  },

  getOrders: async () => {
    try {
      return await apiClient.get<FarmerOrder[]>("/farmer/orders/");
    } catch {
      const response = await apiClient.get<PaginatedResponse<FarmerOrder> | FarmerOrder[]>("/orders/orders/");
      return Array.isArray(response) ? response : response.results;
    }
  },

  uploadMedia: async (file: File, type: "farm_video" | "product_video" | "profile_photo" | "photo" | "video") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    return apiClient.post<{ id: number; file?: string; url?: string }>("/farmer/media/", formData);
  },

  getBankDetails: async () => {
    return apiClient.get<BankDetails>("/farmer/bank/");
  },

  updateBankDetails: async (data: Partial<BankDetails>) => {
    return apiClient.post<BankDetails>("/farmer/bank/", data);
  },

  getNotifications: async () => {
    return apiClient.get<FarmerNotification[]>("/farmer/notifications/");
  },

  markNotificationRead: async (id?: string) => {
    return apiClient.post<{ status: string }>("/farmer/notifications/", { id });
  },
};
