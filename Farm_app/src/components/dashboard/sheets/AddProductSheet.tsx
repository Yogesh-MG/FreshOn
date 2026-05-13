import { ChangeEvent, useState } from "react";
import { motion } from "framer-motion";
import produceImg from "@/assets/produce-flatlay.jpg";
import { useCatalogProducts } from "@/hooks/useFarmer";
import { Icon } from "@/components/freshon/Icon";
import { Product } from "../types";
import { BottomSheet } from "./BottomSheet";

interface Props {
  onClose: () => void;
  onSubmit: (p: Product) => void;
  mode?: "product" | "harvest";
  initial?: Partial<Product>;
}

const CATEGORIES = ["Vegetables", "Fruits", "Greens", "Herbs", "Grains", "Dairy"];
const UNITS = ["kg", "bunch", "dozen", "litre", "piece"];

export const AddProductSheet = ({ onClose, onSubmit, mode = "product", initial }: Props) => {
  const { data: catalogProducts, isLoading } = useCatalogProducts();
  const [name, setName] = useState(initial?.name ?? "");
  const [isCustom, setIsCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [category, setCategory] = useState(initial?.category ?? "Vegetables");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<string>(initial?.unit ?? "kg");
  const [stock, setStock] = useState(initial?.stock ?? "");
  const [harvestDate, setHarvestDate] = useState(initial?.harvestDate ?? new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [image, setImage] = useState<string>(initial?.image ?? produceImg);

  const isHarvest = mode === "harvest";
  const selectedProduct = catalogProducts?.find((product) => product.name === name);

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImage(URL.createObjectURL(f));
  };

  // Valid if: (catalog product selected OR custom name provided) + price + stock
  const valid = Boolean((selectedProduct || (isCustom && customName.trim())) && price && stock);

  const submit = () => {
    if (!valid) return;

    if (isCustom && customName.trim()) {
      // Custom product — use customProductName field, no productId
      onSubmit({
        id: "0",
        productId: 0,
        name: customName.trim(),
        category,
        price: `Rs ${price}/${unit}`,
        unit,
        stock: `${stock} ${unit}`,
        harvestDate,
        description,
        image,
        status: "Pending",
        customProductName: customName.trim(),
      });
    } else if (selectedProduct) {
      onSubmit({
        id: String(selectedProduct.id),
        productId: selectedProduct.id,
        name: selectedProduct.name,
        category: selectedProduct.category_name || category,
        price: `Rs ${price}/${unit}`,
        unit,
        stock: `${stock} ${unit}`,
        harvestDate,
        description,
        image,
        status: "Pending",
      });
    }
  };

  return (
    <BottomSheet
      eyebrow={isHarvest ? "Harvest" : "Inventory"}
      title={isHarvest ? "Update Harvest" : "Add Product"}
      onClose={onClose}
      footer={
        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={!valid}
          onClick={submit}
          className="w-full h-13 py-4 rounded-full bg-gradient-golden text-secondary-deep font-extrabold text-sm shadow-glow tap disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
        >
          <Icon name="send" className="text-lg" weight={700} />
          Submit for approval
        </motion.button>
      }
    >
      <label className="relative block rounded-[24px] overflow-hidden mb-5 group cursor-pointer">
        <img src={image} alt="Product" className="w-full h-44 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-deep/80 via-transparent to-transparent flex items-end p-4">
          <span className="pill bg-background/95 text-secondary-deep">
            <Icon name="photo_camera" className="text-sm" filled />
            Tap to change
          </span>
        </div>
        <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
      </label>

      <div className="space-y-4">
        {/* Toggle: Catalog vs Custom */}
        <div className="flex p-1 rounded-full bg-muted text-xs font-bold">
          <button
            onClick={() => { setIsCustom(false); setCustomName(""); }}
            className={`flex-1 px-3 py-2.5 rounded-full transition-all text-center ${!isCustom ? "bg-secondary text-background shadow-sm" : "text-foreground/60"}`}
          >
            From catalog
          </button>
          <button
            onClick={() => { setIsCustom(true); setName(""); }}
            className={`flex-1 px-3 py-2.5 rounded-full transition-all text-center ${isCustom ? "bg-secondary text-background shadow-sm" : "text-foreground/60"}`}
          >
            Custom product
          </button>
        </div>

        {!isCustom ? (
          <Field label="Catalog product">
            <select
              value={name}
              onChange={(e) => {
                const nextName = e.target.value;
                const product = catalogProducts?.find((p) => p.name === nextName);
                setName(nextName);
                setCategory(product?.category_name || "Vegetables");
                setDescription(product?.description || "");
                setImage(product?.base_image || produceImg);
                setUnit(product?.variants?.[0]?.unit || unit);
              }}
              className="w-full bg-transparent outline-none font-bold appearance-none text-foreground"
            >
              <option value="">{isLoading ? "Loading catalog..." : "Select a product"}</option>
              {catalogProducts?.map((product) => (
                <option key={product.id} value={product.name}>
                  {product.name}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <Field label="Product name">
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Red Amaranth, Moringa leaves..."
              className="w-full bg-transparent outline-none font-bold text-foreground placeholder:text-foreground/30"
            />
          </Field>
        )}

        {/* Info banner for custom products */}
        {isCustom && (
          <div className="flex items-start gap-3 rounded-2xl bg-secondary/8 border border-secondary/20 p-3">
            <Icon name="info" className="text-secondary text-base mt-0.5 shrink-0" weight={500} />
            <p className="text-[11px] font-medium text-foreground/70 leading-relaxed">
              Can't find your product? Type the name above and we'll add it to our catalog after review.
            </p>
          </div>
        )}

        <Field label="Category">
          <div className="flex gap-2 flex-wrap -mx-1 px-1 overflow-x-auto">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`pill shrink-0 ${category === c ? "bg-secondary text-background" : "bg-muted text-foreground/70"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (Rs)">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              placeholder="120"
              className="w-full bg-transparent outline-none font-bold tabular-nums placeholder:text-foreground/30"
            />
          </Field>
          <Field label="Unit">
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full bg-transparent outline-none font-bold appearance-none">
              {UNITS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label={`Available stock (${unit})`}>
          <input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            type="number"
            placeholder="32"
            className="w-full bg-transparent outline-none font-bold tabular-nums placeholder:text-foreground/30"
          />
        </Field>

        <Field label="Harvest date">
          <input type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} className="w-full bg-transparent outline-none font-bold" />
        </Field>

        <Field label="Notes for buyer (optional)">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Sun-ripened, hand-picked at dawn..."
            className="w-full bg-transparent outline-none font-medium resize-none placeholder:text-foreground/30"
          />
        </Field>

        <div className="flex items-start gap-3 rounded-2xl bg-primary/15 border border-primary/30 p-4">
          <div className="size-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Icon name="verified" className="text-secondary-deep text-base" filled weight={700} />
          </div>
          <div>
            <p className="text-xs font-extrabold text-secondary-deep">Approval required</p>
            <p className="text-[11px] font-medium text-secondary-deep/80 leading-relaxed mt-0.5">
              FreshOn quality team reviews submissions within 6 hours. You'll get a notification once approved.
            </p>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="rounded-2xl glass px-4 py-3">
    <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1">{label}</p>
    {children}
  </div>
);
