export type ProductStatus =
  | "Pending"      // awaiting admin approval
  | "Approved"     // approved, not yet shipping
  | "In Delivery"  // being delivered
  | "Delivered"    // completed
  | "Live"         // listed/active
  | "Out";         // out of stock

export interface Product {
  id: string;
  productId?: number | string;
  name: string;
  category: string;
  price: string;
  unit: string;
  stock: string;
  harvestDate?: string;
  description?: string;
  image: string;
  status: ProductStatus;
  customProductName?: string;
  delivery?: {
    contactName: string;
    contactPhone: string;
    address: string;
    proofImage?: string;
    notes?: string;
  };
}
