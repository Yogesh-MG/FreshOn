import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { farmer, inventory, getAccessToken } from "@freshon/api";
import { Batch, CreateBatchPayload, FarmerProfile, VerifyOTPRequest, BankDetails } from "@/types/api";

const hasAccessToken = () => Boolean(getAccessToken());

export const farmerKeys = {
  profile: ["farmer", "profile"] as const,
  dashboard: ["farmer", "dashboard"] as const,
  batches: ["farmer", "batches"] as const,
  payouts: ["farmer", "payouts"] as const,
  orders: ["farmer", "orders"] as const,
  catalogProducts: ["inventory", "products"] as const,
  bank: ["farmer", "bank"] as const,
  notifications: ["farmer", "notifications"] as const,
};

export const useRegisterFarmer = () =>
  useMutation({
    mutationFn: (phone: string) => farmer.registerFarmer({ phone }),
  });

export const useVerifyOTP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyOTPRequest) => farmer.registerFarmer(data),
    onSuccess: (data) => {
      queryClient.setQueryData(farmerKeys.profile, data.user);
      queryClient.invalidateQueries({ queryKey: ["farmer"] });
    },
  });
};

export const useProfile = () =>
  useQuery({
    queryKey: farmerKeys.profile,
    queryFn: farmer.getProfile,
    enabled: hasAccessToken(),
    staleTime: 5 * 60 * 1000,
  });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => farmer.updateProfile(data),
    onSuccess: (profile) => {
      queryClient.setQueryData(farmerKeys.profile, profile);
    },
  });
};

export const useDashboard = () =>
  useQuery({
    queryKey: farmerKeys.dashboard,
    queryFn: farmer.getDashboard,
    enabled: hasAccessToken(),
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

export const useBatches = () =>
  useQuery({
    queryKey: farmerKeys.batches,
    queryFn: farmer.listBatches,
    enabled: hasAccessToken(),
    staleTime: 2 * 60 * 1000,
  });

export const useBankDetails = () =>
  useQuery({
    queryKey: farmerKeys.bank,
    queryFn: farmer.getBankDetails,
    enabled: hasAccessToken(),
  });

export const useUpdateBankDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => farmer.updateBankDetails(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.bank });
    },
  });
};

export const useNotifications = () =>
  useQuery({
    queryKey: farmerKeys.notifications,
    queryFn: farmer.getNotifications,
    enabled: hasAccessToken(),
    refetchInterval: 60 * 1000,
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id?: string) => farmer.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.notifications });
      queryClient.invalidateQueries({ queryKey: farmerKeys.dashboard });
    },
  });
};

export const useCreateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => farmer.addBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.batches });
      queryClient.invalidateQueries({ queryKey: farmerKeys.dashboard });
    },
  });
};

export const useCatalogProducts = () =>
  useQuery({
    queryKey: farmerKeys.catalogProducts,
    queryFn: async () => {
      const res = await inventory.listProducts();
      return res.results;
    },
    enabled: hasAccessToken(),
    staleTime: 10 * 60 * 1000,
  });

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) =>
      farmer.updateBatch(String(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.batches });
      queryClient.invalidateQueries({ queryKey: farmerKeys.dashboard });
    },
  });
};

export const usePayouts = () =>
  useQuery({
    queryKey: farmerKeys.payouts,
    queryFn: farmer.getPayouts,
    enabled: hasAccessToken(),
    staleTime: 5 * 60 * 1000,
  });

export const useOrders = () =>
  useQuery({
    queryKey: farmerKeys.orders,
    queryFn: farmer.getOrders,
    enabled: hasAccessToken(),
    staleTime: 60 * 1000,
    refetchInterval: 30 * 1000,
  });

export const useUploadMedia = () =>
  useMutation({
    mutationFn: ({ file, type }: { file: File; type: any }) =>
      farmer.uploadMedia(type, file),
  });

export const batchToCreatePayload = (batch: Batch): CreateBatchPayload => ({
  product_id: Number(batch.product_id || 0),
  stock_level: Number(batch.quantity || batch.stock || 0),
  price: Number(batch.price_per_unit || batch.price || 0),
  harvest_date: batch.harvest_date,
  is_organic: true,
});
