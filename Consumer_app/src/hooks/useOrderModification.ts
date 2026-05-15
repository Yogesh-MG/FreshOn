import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orders as ordersModule } from "@freshon/api";
import { toast } from "@/hooks/use-toast";

interface AddItemParams {
  orderId: string;
  batchId: number;
  quantity: number;
}

interface RemoveItemParams {
  orderId: string;
  orderItemId: number;
}

export const useOrderModification = () => {
  const queryClient = useQueryClient();

  const addItemMutation = useMutation({
    mutationFn: async (params: AddItemParams) => {
      return await ordersModule.addItemToOrder(params.orderId, {
        batch_id: params.batchId,
        quantity: params.quantity,
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate order query to refresh
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });

      toast({
        title: "Product Added",
        description: `${data.product_name} added to order (₹${data.total})`,
        variant: "default",
      });

      // If wallet was debited
      if (data.wallet_transaction?.amount) {
        toast({
          title: "Wallet Updated",
          description: `₹${data.wallet_transaction.amount} deducted from wallet`,
          variant: "default",
        });
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail || "Failed to add product to order";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (params: RemoveItemParams) => {
      return await ordersModule.removeItemFromOrder(params.orderId, {
        order_item_id: params.orderItemId,
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate order query to refresh
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });

      toast({
        title: "Product Removed",
        description: `${data.removed_item.product_name} removed from order`,
        variant: "default",
      });

      // If wallet was refunded
      if (data.wallet_refund?.amount) {
        toast({
          title: "Refund Processed",
          description: `₹${data.wallet_refund.amount} refunded to wallet`,
          variant: "default",
        });
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        "Failed to remove product from order";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async (params: UpdateItemParams) => {
      return await ordersModule.updateItemQuantity(params.orderId, {
        order_item_id: params.orderItemId,
        quantity: params.quantity,
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });

      toast({
        title: "Quantity Updated",
        description: `Order item updated`,
        variant: "default",
      });

      if (data.wallet_adjustment?.amount) {
        const isRefund = data.wallet_adjustment.type === "REFUND";
        toast({
          title: isRefund ? "Refund Processed" : "Wallet Updated",
          description: `₹${data.wallet_adjustment.amount} ${isRefund ? "refunded to" : "deducted from"} wallet`,
          variant: "default",
        });
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || "Failed to update item quantity";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  return {
    addItem: (orderId: string, batchId: number, quantity: number) =>
      addItemMutation.mutate({ orderId, batchId, quantity }),
    removeItem: (orderId: string, orderItemId: number) =>
      removeItemMutation.mutate({ orderId, orderItemId }),
    updateItem: (orderId: string, orderItemId: number, quantity: number) =>
      updateItemMutation.mutate({ orderId, orderItemId, quantity }),
    isLoading: addItemMutation.isPending || removeItemMutation.isPending || updateItemMutation.isPending,
    isAddingItem: addItemMutation.isPending,
    isRemovingItem: removeItemMutation.isPending,
    isUpdatingItem: updateItemMutation.isPending,
  };
};

interface UpdateItemParams {
  orderId: string;
  orderItemId: number;
  quantity: number;
}
