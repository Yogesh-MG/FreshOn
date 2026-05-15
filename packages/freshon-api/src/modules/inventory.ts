// packages/freshon-api/src/modules/inventory.ts
// Inventory & catalog module — categories, batches, farmer profiles.
// Maps to Django's apps/inventory/ endpoints.

import { getClient } from "../client";
import type {
  Category,
  CategoryDetail,
  Subcategory,
  InventoryBatch,
  FarmerProfile,
  PaginatedResponse,
  Category as CatalogProduct,
} from "../types";

// ─── Categories ───────────────────────────────────────────────────────

/**
 * List all categories (lightweight — no nested subcategories).
 * GET /api/inventory/categories/
 */
export async function listCategories(): Promise<PaginatedResponse<Category>> {
  const res = await getClient().get<PaginatedResponse<Category>>("/api/inventory/categories/");
  return res.data;
}

/**
 * Get a single category with its nested subcategories.
 * GET /api/inventory/categories/{slug}/
 */
export async function getCategory(slug: string): Promise<CategoryDetail> {
  const res = await getClient().get<CategoryDetail>(`/api/inventory/categories/${slug}/`);
  return res.data;
}

/**
 * Get only the subcategories for a category.
 * GET /api/inventory/categories/{slug}/subcategories/
 */
export async function getSubcategories(slug: string): Promise<Subcategory[]> {
  const res = await getClient().get<Subcategory[]>(
    `/api/inventory/categories/${slug}/subcategories/`
  );
  return res.data;
}

// ─── Batches (Shop) ───────────────────────────────────────────────────

export interface BatchFilters {
  /** Filter by category slug */
  category?: string;
  /** Filter organic-only batches */
  organic?: boolean;
  /** Filter farm-fresh batches */
  farmFresh?: boolean;
  /** Text search by product name or farmer */
  search?: string;
  /** Pagination */
  page?: number;
  pageSize?: number;
}

/**
 * List product batches — the main shop endpoint.
 * GET /api/inventory/batches/
 */
export async function listBatches(
  filters?: BatchFilters
): Promise<PaginatedResponse<InventoryBatch>> {
  const params: Record<string, string> = {};

  if (filters?.category) params["product__category__slug"] = filters.category;
  if (filters?.organic !== undefined) params["is_organic"] = String(filters.organic);
  if (filters?.farmFresh !== undefined) params["is_farm_fresh"] = String(filters.farmFresh);
  if (filters?.search) params["search"] = filters.search;
  if (filters?.page) params["page"] = String(filters.page);
  if (filters?.pageSize) params["page_size"] = String(filters.pageSize);

  const res = await getClient().get<PaginatedResponse<InventoryBatch>>(
    "/api/inventory/batches/",
    { params }
  );
  return res.data;
}

/**
 * Get a single batch by ID.
 * GET /api/inventory/batches/{id}/
 */
export async function getBatch(id: string): Promise<InventoryBatch> {
  const res = await getClient().get<InventoryBatch>(`/api/inventory/batches/${id}/`);
  return res.data;
}

// ─── Farmer Profiles ──────────────────────────────────────────────────

/**
 * List all verified farmer profiles.
 * GET /api/inventory/farmers/
 */
export async function listFarmers(): Promise<PaginatedResponse<FarmerProfile>> {
  const res = await getClient().get<PaginatedResponse<FarmerProfile>>("/api/inventory/farmers/");
  return res.data;
}

/**
 * Get a single farmer profile.
 * GET /api/inventory/farmers/{id}/
 */
export async function getFarmer(id: number): Promise<FarmerProfile> {
  const res = await getClient().get<FarmerProfile>(`/api/inventory/farmers/${id}/`);
  return res.data;
}

// ─── Products (Catalog) ───────────────────────────────────────────────

/**
 * List catalog products.
 * GET /api/inventory/products/
 */
export async function listProducts(): Promise<PaginatedResponse<CatalogProduct>> {
  const res = await getClient().get<PaginatedResponse<CatalogProduct>>("/api/inventory/products/");
  return res.data;
}

// ─── Utility ──────────────────────────────────────────────────────────

/**
 * Groups flat batch array into product-centric objects with variant arrays.
 * Extracted from Consumer_app's product-utils.ts for shared reuse.
 */
export function groupBatchesByProduct(batches: InventoryBatch[]) {
  const productsMap: Record<
    string,
    {
      id: string;
      name: string;
      image: string;
      organic: boolean;
      farmFresh: boolean;
      harvestDate: string;
      category: string;
      category_slug: string;
      unit: string;
      price: number;
      mrp: number | undefined;
      stock: number;
      farmerId: string;
      description: string;
      benefits: string[];
      storage: string;
      variants: Array<{
        id: string;
        unit: string;
        price: number;
        mrp: number | undefined;
        stock: number;
      }>;
    }
  > = {};

  for (const b of batches) {
    if (!b) continue;
    const pid = b.product_id || b.id;

    if (!productsMap[pid]) {
      productsMap[pid] = {
        id: pid,
        name: b.product_name,
        image: b.batch_image || b.base_image || "/logo.png",
        organic: b.is_organic,
        farmFresh: b.is_farm_fresh,
        harvestDate: b.harvest_date_display,
        category: b.category_name,
        category_slug: b.category_slug,
        // Added for compatibility with legacy Product type
        unit: b.variant?.unit || "Unit",
        price: parseFloat(b.price || "0"),
        mrp: b.mrp ? parseFloat(b.mrp) : undefined,
        stock: b.stock_level,
        farmerId: String(b.farmer_id),
        description: (b as any).description || "Freshly harvested produce.",
        benefits: (b as any).benefits || ["Naturally grown"],
        storage: (b as any).storage_instructions || "Store in a cool, dry place.",
        variants: [],
      };
    }

    productsMap[pid].variants.push({
      id: b.id,
      unit: b.variant?.unit || "Unit",
      price: parseFloat(b.price || "0"),
      mrp: b.mrp ? parseFloat(b.mrp) : undefined,
      stock: b.stock_level,
    });
  }

  return Object.values(productsMap);
}

/**
 * Cleans up image URLs that might be double-prefixed by Django's media URL.
 * e.g. https://site.com/media/https%3A/external.com/image.jpg → https://external.com/image.jpg
 */
export function getCleanImageUrl(url: string | null | undefined): string {
  if (!url) return "";

  if (url.includes("/media/http")) {
    const parts = url.split("/media/");
    if (parts.length > 1) {
      const nestedUrl = decodeURIComponent(parts[1]);
      if (nestedUrl.startsWith("http")) {
        return nestedUrl;
      }
    }
  }

  return url;
}
