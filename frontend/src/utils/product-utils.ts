import { normalizeImageUrl } from "./image-utils";

export const groupBatchesByProduct = (items: any[]) => {
  const productsMap: Record<string, any> = {};

  items.forEach((b: any) => {
    if (!b) return;
    const pid = b.product_id || b.id;
    
    if (!productsMap[pid]) {
      productsMap[pid] = {
        id: pid,
        name: b.product_name,
        image: normalizeImageUrl(b.batch_image || b.base_image),
        organic: b.is_organic,
        farmFresh: b.is_farm_fresh,
        harvestDate: b.harvest_date_display,
        category: b.category_name,
        category_slug: b.category_slug,
        variants: []
      };
    }
    
    productsMap[pid].variants.push({
      id: b.id,
      unit: b.variant?.unit || "Unit",
      price: parseFloat(b.price || "0"),
      mrp: b.mrp ? parseFloat(b.mrp) : undefined,
      stock: b.stock_level
    });
  });

  return Object.values(productsMap);
};
