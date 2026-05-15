// packages/freshon-api/src/modules/orders.ts
// Order management module — place order, track order, list orders.
// Maps to Django's apps/orders/ endpoints.

import { getClient } from "../client";
import type { Order, PlaceOrderRequest, PlaceOrderResponse, PaginatedResponse } from "../types";

/**
 * Place a new order.
 * POST /api/orders/orders/
 *
 * NOTE: Prices are calculated server-side — do NOT send amounts from the frontend.
 * The backend reads batch prices at order time for security.
 */
export async function placeOrder(data: PlaceOrderRequest): Promise<PlaceOrderResponse> {
  const res = await getClient().post<PlaceOrderResponse>("/api/orders/orders/", data);
  return res.data;
}

/**
 * Get an order by its tracking ID (e.g. "FRSH-A1B2C3").
 * GET /api/orders/orders/{tracking_id}/
 */
export async function getOrder(trackingId: string): Promise<Order> {
  const res = await getClient().get<Order>(`/api/orders/orders/${trackingId}/`);
  return res.data;
}

/**
 * List all orders for the current user.
 * GET /api/orders/orders/
 */
export async function listOrders(): Promise<PaginatedResponse<Order>> {
  const res = await getClient().get<PaginatedResponse<Order>>("/api/orders/orders/");
  return res.data;
}

/**
 * Add an item to an existing order (before it's packed).
 * POST /api/orders/orders/{tracking_id}/add-item/
 */
export async function addItemToOrder(
  trackingId: string,
  data: { batch_id: number; quantity: number }
): Promise<any> {
  const res = await getClient().post<any>(
    `/api/orders/orders/${trackingId}/add-item/`,
    data
  );
  return res.data;
}

/**
 * Remove an item from an existing order (before it's packed).
 * POST /api/orders/orders/{tracking_id}/remove-item/
 */
export async function removeItemFromOrder(
  trackingId: string,
  data: { order_item_id: number }
): Promise<any> {
  const res = await getClient().post<any>(
    `/api/orders/orders/${trackingId}/remove-item/`,
    data
  );
  return res.data;
}

/**
 * Update the quantity of an item in an existing order.
 * POST /api/orders/orders/{tracking_id}/update-item/
 */
export async function updateItemQuantity(
  trackingId: string,
  data: { order_item_id: number; quantity: number }
): Promise<any> {
  const res = await getClient().post<any>(
    `/api/orders/orders/${trackingId}/update-item/`,
    data
  );
  return res.data;
}
