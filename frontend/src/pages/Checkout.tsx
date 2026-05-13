import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/store/cart";
import { PageShell } from "@/components/freshon/PageShell";
import { ChevronLeft, Check, MapPin, Clock, CreditCard, AlertCircle, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/utils/api";
import { getLocationForCheckout, getStoredLocation, getStoredAddress } from "@/utils/location";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AddressModal from "@/components/AddressModal";
import { CheckoutWallet } from "@/components/freshon/CheckoutWallet";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const steps = ["Address", "Delivery", "Payment", "Review"] as const;

const Checkout = () => {
  const [step, setStep] = useState(0);
  const subtotal = useCart((s) => s.subtotal());
  const items = Object.values(useCart((s) => s.items));
  const clear = useCart((s) => s.clear);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [pay, setPay] = useState("upi");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const total = Number(subtotal) + Number(deliveryFee);
  const [orderData, setOrderData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [walletAmount, setWalletAmount] = useState(0);

  // Load location data on mount
  useEffect(() => {
    const locationData = getLocationForCheckout();
    if (locationData.address) {
      setSelectedAddress({
        type: "current",
        title: "Current Location",
        address_line: locationData.address,
        latitude: locationData.location?.latitude,
        longitude: locationData.location?.longitude,
      });
    }
  }, []);

  // Fetch delivery slots
  const { data: slots = [] } = useQuery({
    queryKey: ["delivery-slots"],
    queryFn: async () => {
      try {
        const res = await api.get("/api/delivery/slots/");
        return res.data;
      } catch {
        // Fallback slots if endpoint not ready
        return [
          { id: "express", title: "Express", description: "Within 12 minutes", fee: 25, available: true },
          { id: "today-evening", title: "Today, 6–8 PM", description: "Pick a 2-hour window", fee: 0, available: true },
          { id: "tomorrow-morning", title: "Tomorrow, 7–9 AM", description: "Morning delivery", fee: 0, available: true },
        ];
      }
    },
  });

  // Fetch saved addresses
  const { data: savedAddresses = [] } = useQuery({
    queryKey: ["saved-addresses"],
    queryFn: async () => {
      try {
        const res = await api.get("/api/delivery/addresses/");
        return res.data;
      } catch {
        return [];
      }
    },
  });

  // Fetch user profile for payment prefill
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get("/api/auth/profile-data/").then((res) => res.data),
  });

  // Mutation for saving new address
  const saveAddressMutation = useMutation({
    mutationFn: async (address: any) => {
      const response = await api.post("/api/delivery/addresses/", address);
      return response.data;
    },
    onSuccess: (newAddress) => {
      // Refresh address list and select the new address
      queryClient.invalidateQueries({ queryKey: ["saved-addresses"] });
      setSelectedAddress({
        ...newAddress,
        type: "saved",
        id: newAddress.id,
      });
      setShowAddressModal(false);
    },
    onError: (error: any) => {
      console.error("Failed to save address:", error);
      alert(error.response?.data?.detail || "Failed to save address");
    },
  });

  const next = async () => {
    if (step < 3) {
      // Validate current step
      if (step === 0 && !selectedAddress) {
        alert("Please select or add an address");
        return;
      }
      if (step === 1 && !slot) {
        alert("Please select a delivery slot");
        return;
      }
      setStep(step + 1);
    } else {
      // Payment step - prepare order data
      if (!selectedAddress || !slot) return;

      const orderPayload = {
        address_title: selectedAddress.title,
        address_line: selectedAddress.address_line,
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
        delivery_slot: slots.find((s: any) => s.id === slot)?.slot_type || "EXPRESS",
        payment_method: pay.toUpperCase(),
        items: items.map((item) => ({
          batch: item.product.id,
          quantity: item.qty,
        })),
        subtotal,
        delivery_fee: deliveryFee,
        wallet_amount: walletAmount,
        total: total - walletAmount,
      };

      setOrderData(orderPayload);
      
      // If order is fully covered by wallet, create direct order
      if (total - walletAmount <= 0) {
        await createDirectOrder({ ...orderPayload, is_paid: true, payment_method: 'WALLET' });
        return;
      }
      
      if (pay === "cod") {
        await createDirectOrder(orderPayload);
      } else {
        await initializePayment(orderPayload);
      }
    }
  };

  const initializePayment = async (payload: any) => {
    setIsProcessing(true);
    try {
      // Create payment intent with backend
      const response = await api.post("/api/payment/razorpay-init/", {
        items: payload.items,
      });

      const { orderId, key } = response.data;

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const options = {
          key,
          amount: (total - walletAmount) * 100,
          currency: "INR",
          name: "Freshon",
          description: "Order for fresh groceries",
          order_id: orderId,
          handler: async (response: any) => {
            // Verify payment and create order
            await verifyAndCreateOrder(response, payload);
          },
          prefill: {
            email: profile?.email || "customer@example.com",
            contact: profile?.phone_number || "9999999999",
            method: pay === "upi" ? "upi" : pay === "card" ? "card" : undefined,
          },
          config: {
            display: {
              blocks: {
                upi: {
                  name: "UPI / QR",
                  instruments: [{ method: "upi" }],
                },
              },
              sequence: ["block.upi", "block.other"],
              preferences: {
                show_default_blocks: true,
              },
            },
          },
          theme: { color: "#1B8B5F" },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error("Payment initialization failed:", error);
      alert("Failed to initialize payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyAndCreateOrder = async (paymentResponse: any, payload: any) => {
    try {
      // Verify payment with backend
      const verifyResponse = await api.post("/api/payment/razorpay-verify/", {
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      });

      if (verifyResponse.data.success) {
        // Create order in the system
        await createDirectOrder({
          ...payload,
          is_paid: true,
        });
      }
    } catch (error: any) {
      console.error("Order verification failed:", error);
      alert(error.response?.data?.error || "Payment verification failed.");
    }
  };

  const createDirectOrder = async (payload: any) => {
    setIsProcessing(true);
    try {
      const orderResponse = await api.post("/api/orders/orders/", payload);
      clear();
      navigate(`/track/${orderResponse.data.tracking_id}`);
    } catch (error: any) {
      console.error("Order creation failed:", error);
      alert(error.response?.data?.error || "Failed to create order. Please contact support.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PageShell hideTabBar>
      <div className="container max-w-3xl pt-4 pb-32">
        <Link to="/cart" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <ChevronLeft className="h-4 w-4" /> Back to cart
        </Link>

        {/* Stepper */}
        <ol className="mt-4 grid grid-cols-4 gap-2">
          {steps.map((s, i) => (
            <li key={s} className="flex flex-col items-center gap-1">
              <span className={cn("grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition",
                i < step ? "bg-mint text-mint-foreground" : i === step ? "bg-forest text-forest-foreground" : "bg-surface text-muted-foreground")}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={cn("text-[10px] font-semibold md:text-xs", i === step ? "text-forest" : "text-muted-foreground")}>{s}</span>
            </li>
          ))}
        </ol>

        <div className="mt-6 space-y-4">
          {step === 0 && (
            <Card title="Delivery address" icon={<MapPin className="h-4 w-4" />}>
              {/* Current Location */}
              {selectedAddress?.type === "current" && (
                <AddressCard
                  selected={selectedAddress?.type === "current"}
                  onClick={() => {}}
                  title={selectedAddress.title}
                  address={selectedAddress.address_line || selectedAddress.address}
                  editable
                />
              )}

              {/* Saved Addresses */}
              {savedAddresses.map((addr: any) => (
                <AddressCard
                  key={addr.id}
                  selected={selectedAddress?.id === addr.id}
                  onClick={() => setSelectedAddress(addr)}
                  title={addr.title}
                  address={addr.address_line}
                  editable
                />
              ))}

              {/* Add New Address */}
              <button
                onClick={() => setShowAddressModal(true)}
                className="w-full rounded-xl border border-dashed border-border py-3 text-sm font-semibold text-forest hover:bg-mint-soft transition"
              >
                + Add new address
              </button>
            </Card>
          )}

          {step === 1 && (
            <Card title="Delivery slot" icon={<Clock className="h-4 w-4" />}>
              {slots.map((s: any) => (
                <DeliverySlotCard
                  key={s.id}
                  selected={slot === s.id}
                  onClick={() => {
                    setSlot(s.id);
                    setDeliveryFee(s.fee || 0);
                  }}
                  title={s.title}
                  description={s.description}
                  fee={s.fee}
                  available={s.available}
                />
              ))}
            </Card>
          )}

          {step === 2 && (
            <Card title="Payment method" icon={<CreditCard className="h-4 w-4" />}>
              {[
                { id: "upi", t: "UPI", d: "Pay via Google Pay, PhonePe, Paytm" },
                { id: "card", t: "Credit/Debit Card", d: "Visa, Mastercard, RuPay" },
                { id: "cod", t: "Cash on Delivery", d: "Pay when your order arrives" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPay(m.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition",
                    pay === m.id ? "border-mint bg-mint-soft" : "border-border"
                  )}
                >
                  <span className={cn("h-4 w-4 rounded-full border-2", pay === m.id ? "border-mint bg-mint" : "border-border")} />
                  <div>
                    <p className="font-display text-sm font-bold">{m.t}</p>
                    <p className="text-xs text-muted-foreground">{m.d}</p>
                  </div>
                </button>
              ))}
              
              <div className="mt-6">
                <CheckoutWallet 
                  orderTotal={total} 
                  onWalletAmountChange={(amt) => setWalletAmount(amt)} 
                />
              </div>
            </Card>
          )}

          {step === 3 && (
            <>
              {/* Order Summary */}
              <Card title="Order review">
                <div className="space-y-2">
                  {items.map(({ product, qty }) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <img src={product.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {qty} × ₹{product.price}
                        </p>
                      </div>
                      <span className="text-sm font-bold">₹{qty * product.price}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-border pt-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery fee</span>
                    <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                  </div>
                  <div className="mt-2 flex justify-between font-display font-bold">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                  {walletAmount > 0 && (
                    <div className="mt-2 flex justify-between font-semibold text-green-600">
                      <span>Wallet applied</span>
                      <span>-₹{walletAmount}</span>
                    </div>
                  )}
                  {walletAmount > 0 && (
                    <div className="mt-2 flex justify-between font-display font-bold border-t border-border pt-2 text-forest">
                      <span>Payable</span>
                      <span>₹{(total - walletAmount).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Address Review */}
              <Card title="Delivery to" icon={<MapPin className="h-4 w-4" />}>
                <div className="rounded-xl border border-border p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="font-display font-bold">{selectedAddress?.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{selectedAddress?.address_line}</p>
                    </div>
                    <button
                      onClick={() => setStep(0)}
                      className="text-forest hover:text-forest/80 transition"
                      title="Edit address"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>

              {/* Delivery Slot Review */}
              <Card title="Delivery slot" icon={<Clock className="h-4 w-4" />}>
                <div className="rounded-xl border border-border p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="font-display font-bold">
                        {slots.find((s: any) => s.id === slot)?.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {slots.find((s: any) => s.id === slot)?.description}
                      </p>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="text-forest hover:text-forest/80 transition"
                      title="Edit slot"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>

              {/* Payment Method Review */}
              <Card title="Payment method" icon={<CreditCard className="h-4 w-4" />}>
                <div className="rounded-xl border border-border p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="font-display font-bold">
                        {pay === "upi" ? "UPI" : pay === "card" ? "Credit/Debit Card" : "Cash on Delivery"}
                      </p>
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      className="text-forest hover:text-forest/80 transition"
                      title="Edit payment"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Address Modal */}
      <AddressModal
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={(address) => saveAddressMutation.mutate(address)}
        loading={saveAddressMutation.isPending}
      />

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background p-3 shadow-cta">
        <div className="container max-w-3xl">
          <button
            onClick={next}
            disabled={isProcessing}
            className="flex h-14 w-full items-center justify-between rounded-full bg-earth px-5 text-sm font-semibold text-earth-foreground hover:bg-earth/90 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            <span>
              {step === 3
                ? isProcessing
                  ? "Processing..."
                  : `Place order · ₹${(total - walletAmount).toFixed(2)}`
                : "Continue"}
            </span>
            <span>→</span>
          </button>
        </div>
      </div>
    </PageShell>
  );
};

// Helper Components
interface AddressCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  address: string;
  editable?: boolean;
}

const AddressCard = ({ selected, onClick, title, address, editable }: AddressCardProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition",
      selected ? "border-mint bg-mint-soft" : "border-border hover:border-mint/50"
    )}
  >
    <span className={cn("mt-1 h-5 w-5 rounded-full border-2 flex-shrink-0", selected ? "border-mint bg-mint" : "border-border")} />
    <div className="flex-1 min-w-0">
      <p className="font-display text-sm font-bold">{title}</p>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{address}</p>
    </div>
  </button>
);

interface DeliverySlotCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  fee: number;
  available: boolean;
}

const DeliverySlotCard = ({ selected, onClick, title, description, fee, available }: DeliverySlotCardProps) => (
  <button
    onClick={onClick}
    disabled={!available}
    className={cn(
      "flex w-full items-center justify-between rounded-xl border p-4 text-left transition",
      selected ? "border-mint bg-mint-soft" : "border-border",
      !available && "opacity-50 cursor-not-allowed"
    )}
  >
    <div className="flex-1">
      <p className="font-display text-sm font-bold">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <span className={cn("text-sm font-bold flex-shrink-0", fee === 0 ? "text-mint" : "text-foreground")}>
      {fee === 0 ? "FREE" : `₹${fee}`}
    </span>
  </button>
);

const Card = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="freshon-card p-5">
    <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold">
      {icon && <span className="grid h-7 w-7 place-items-center rounded-full bg-mint-soft text-forest">{icon}</span>}
      {title}
    </h2>
    <div className="space-y-3">{children}</div>
  </section>
);

export default Checkout;
