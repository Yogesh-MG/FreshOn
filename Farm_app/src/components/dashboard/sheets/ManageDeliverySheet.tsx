import { useState, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/freshon/Icon";
import { BottomSheet } from "./BottomSheet";
import { Product, ProductStatus } from "../types";

interface Props {
  product: Product;
  onClose: () => void;
  onSave: (p: Product) => void;
}

const STATUS_FLOW: { value: ProductStatus; label: string; icon: string; desc: string }[] = [
  { value: "Approved", label: "Ready", icon: "inventory_2", desc: "Listed and waiting for orders" },
  { value: "In Delivery", label: "In Delivery", icon: "local_shipping", desc: "On the way to buyer" },
  { value: "Delivered", label: "Delivered", icon: "task_alt", desc: "Handed over to customer" },
];

export const ManageDeliverySheet = ({ product, onClose, onSave }: Props) => {
  const [status, setStatus] = useState<ProductStatus>(
    product.status === "Pending" ? "Approved" : product.status,
  );
  const [contactName, setContactName] = useState(product.delivery?.contactName ?? "");
  const [contactPhone, setContactPhone] = useState(product.delivery?.contactPhone ?? "");
  const [address, setAddress] = useState(product.delivery?.address ?? "");
  const [notes, setNotes] = useState(product.delivery?.notes ?? "");
  const [proofImage, setProofImage] = useState<string | undefined>(product.delivery?.proofImage);

  const needsDelivery = status === "In Delivery" || status === "Delivered";
  const needsProof = status === "Delivered";

  const handleProof = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setProofImage(URL.createObjectURL(f));
  };

  const valid =
    !needsDelivery ||
    (contactName && contactPhone && address && (!needsProof || proofImage));

  const save = () => {
    if (!valid) return;
    onSave({
      ...product,
      status,
      delivery: needsDelivery
        ? { contactName, contactPhone, address, notes, proofImage }
        : product.delivery,
    });
  };

  return (
    <BottomSheet
      eyebrow="Approved"
      title="Manage Delivery"
      onClose={onClose}
      footer={
        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={!valid}
          onClick={save}
          className="w-full h-13 py-4 rounded-full bg-secondary text-background font-extrabold text-sm tap disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Icon name="check_circle" className="text-lg" filled weight={700} />
          Save status
        </motion.button>
      }
    >
      {/* Product card */}
      <div className="flex items-center gap-3 rounded-2xl glass p-3 mb-5">
        <img src={product.image} alt={product.name} className="size-14 rounded-xl object-cover" />
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-foreground truncate">{product.name}</p>
          <p className="text-xs font-bold text-secondary tabular-nums">
            {product.price} · {product.stock}
          </p>
        </div>
        <span className="pill bg-secondary/12 text-secondary">
          <Icon name="verified" className="text-sm" filled />
          Approved
        </span>
      </div>

      {/* Status selector */}
      <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-2 px-1">
        Delivery Status
      </p>
      <div className="space-y-2 mb-5">
        {STATUS_FLOW.map((s) => {
          const active = status === s.value;
          return (
            <motion.button
              key={s.value}
              whileTap={{ scale: 0.99 }}
              onClick={() => setStatus(s.value)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                active
                  ? "bg-gradient-forest text-background shadow-deep"
                  : "glass text-foreground"
              }`}
            >
              <div
                className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${
                  active ? "bg-primary text-secondary-deep" : "bg-muted text-secondary"
                }`}
              >
                <Icon name={s.icon} className="text-lg" filled weight={600} />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-sm">{s.label}</p>
                <p className={`text-[11px] font-medium ${active ? "text-background/70" : "text-foreground/55"}`}>
                  {s.desc}
                </p>
              </div>
              {active && <Icon name="check_circle" className="text-primary text-xl" filled />}
            </motion.button>
          );
        })}
      </div>

      {needsDelivery && (
        <>
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-2 px-1">
            Delivery Contact
          </p>
          <div className="space-y-3">
            <Field label="Recipient name" icon="person">
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Priya Sharma"
                className="w-full bg-transparent outline-none font-bold placeholder:text-foreground/30"
              />
            </Field>
            <Field label="Phone number" icon="call">
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                type="tel"
                placeholder="+91 98765 43210"
                className="w-full bg-transparent outline-none font-bold tabular-nums placeholder:text-foreground/30"
              />
            </Field>
            <Field label="Drop-off address" icon="location_on">
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder="Flat 4B, Indiranagar, Bengaluru"
                className="w-full bg-transparent outline-none font-medium resize-none placeholder:text-foreground/30"
              />
            </Field>
            <Field label="Driver notes (optional)" icon="sticky_note_2">
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ring doorbell twice"
                className="w-full bg-transparent outline-none font-medium placeholder:text-foreground/30"
              />
            </Field>

            <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mt-5 mb-2 px-1">
              Delivery Proof {needsProof && <span className="text-destructive">*</span>}
            </p>
            <label className="block rounded-2xl glass p-4 cursor-pointer">
              {proofImage ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={proofImage} alt="Proof" className="w-full h-40 object-cover" />
                  <span className="absolute bottom-2 right-2 pill bg-background/95 text-secondary-deep">
                    <Icon name="autorenew" className="text-sm" /> Replace
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-2">
                    <Icon name="photo_camera" className="text-secondary-deep text-xl" filled />
                  </div>
                  <p className="font-bold text-sm text-foreground">Upload delivery photo</p>
                  <p className="text-[11px] font-medium text-foreground/55 mt-0.5">
                    Package handover or signed receipt
                  </p>
                </div>
              )}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleProof} />
            </label>
          </div>
        </>
      )}
    </BottomSheet>
  );
};

const Field = ({
  label, icon, children,
}: { label: string; icon: string; children: React.ReactNode }) => (
  <div className="rounded-2xl glass px-4 py-3">
    <div className="flex items-center gap-1.5 mb-1">
      <Icon name={icon} className="text-secondary text-sm" weight={600} />
      <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">{label}</p>
    </div>
    {children}
  </div>
);
