import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/store/cart";
import { PageShell } from "@/components/freshon/PageShell";
import { ChevronLeft, Check, MapPin, Clock, CreditCard, AlertCircle, Edit2, Leaf, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  delivery, 
  profile as profileModule, 
  payment as paymentModule, 
  orders as ordersModule 
} from "@freshon/api";
import { getLocationForCheckout } from "@/utils/location";
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
  const [walletAmountUsed, setWalletAmountUsed] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const total = Number(subtotal) + Number(deliveryFee);
  const [orderData, setOrderData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

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
        return await delivery.listSlots();
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
        return await delivery.listAddresses();
      } catch {
        return [];
      }
    },
  });

  // Fetch user profile for payment prefill
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileModule.getProfile(),
  });

  // Mutation for saving new address
  const saveAddressMutation = useMutation({
    mutationFn: (address: any) => delivery.saveAddress(address),
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
      if (step === 2 && walletAmountUsed < total && !pay) {
        alert("Please select a payment method");
        return;
      }
      setStep(step + 1);
    } else {
      // Payment step - prepare order data
      if (!selectedAddress || !slot) return;

      // Determine payment method based on wallet usage
      let paymentMethod = pay.toUpperCase();
      if (walletAmountUsed > 0) {
        if (walletAmountUsed >= total) {
          paymentMethod = "WALLET";
        } else if (pay === "upi") {
          paymentMethod = "WALLET_UPI";
        } else if (pay === "card") {
          paymentMethod = "WALLET_CARD";
        }
      }

      const orderPayload = {
        address_title: selectedAddress.title,
        address_line: selectedAddress.address_line,
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
        delivery_slot: slots.find((s: any) => s.id === slot)?.slot_type || "EXPRESS",
        payment_method: paymentMethod,
        wallet_amount_used: walletAmountUsed,
        remaining_amount: Math.max(0, total - walletAmountUsed),
        items: items.map((item) => {
          // Fail-safe: Use batchId if present, otherwise parse the legacy composite ID string
          const rawId = item.product.id;
          const extractedId = (item.product as any).batchId || 
                             (rawId.includes("-") ? rawId.split("-").pop() : rawId);
          
          return {
            batch: Number(extractedId),
            quantity: item.qty,
          };
        }),
        subtotal,
        delivery_fee: deliveryFee,
        total,
      };

      setOrderData(orderPayload);
      
      // If payment is fully via wallet or COD, create order directly
      if (paymentMethod === "WALLET" || pay === "cod") {
        await createDirectOrder({
          ...orderPayload,
          is_paid: paymentMethod === "WALLET"
        });
      } else {
        // Otherwise initialize Razorpay for remaining amount
        await initializePayment(orderPayload);
      }
    }
  };

  const initializePayment = async (payload: any) => {
    setIsProcessing(true);
    try {
      // Create payment intent with backend for remaining amount only
      const resData = await paymentModule.initRazorpay({
        items: payload.items,
        amount: payload.remaining_amount,
      });

      const { orderId, key } = resData;

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const options = {
          key,
          amount: payload.remaining_amount * 100,
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
      const verifyData = await paymentModule.verifyPayment({
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      });

      if (verifyData.status === "success" || (verifyData as any).success) {
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
      const orderResponse = await ordersModule.placeOrder(payload);
      clear();
      navigate(`/track/${orderResponse.tracking_id}`);
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

        <div className="mt-6 space-y-3">
          {/* Section 1: Address */}
          <section className={cn("freshon-card overflow-hidden transition-all duration-300", step === 0 ? "p-5 border-forest/30" : "p-4 bg-surface/50 opacity-90")}>
            <button 
              onClick={() => setStep(0)}
              className="flex w-full items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className={cn("grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition", 
                  step > 0 ? "bg-mint text-mint-foreground" : "bg-forest text-forest-foreground")}>
                  {step > 0 ? <Check className="h-4 w-4" /> : "1"}
                </div>
                <div>
                  <h2 className="font-display text-sm font-bold">Delivery address</h2>
                  {step > 0 && selectedAddress && (
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{selectedAddress.title}: {selectedAddress.address_line}</p>
                  )}
                </div>
              </div>
              {step > 0 && <span className="text-[10px] font-bold text-forest uppercase tracking-wider">Change</span>}
            </button>

            {step === 0 && (
              <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                {selectedAddress?.type === "current" && (
                  <AddressCard
                    selected={selectedAddress?.type === "current"}
                    onClick={() => {}}
                    title={selectedAddress.title}
                    address={selectedAddress.address_line || selectedAddress.address}
                  />
                )}
                {savedAddresses.map((addr: any) => (
                  <AddressCard
                    key={addr.id}
                    selected={selectedAddress?.id === addr.id}
                    onClick={() => setSelectedAddress(addr)}
                    title={addr.title}
                    address={addr.address_line}
                  />
                ))}
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="w-full rounded-xl border border-dashed border-border py-3 text-sm font-semibold text-forest hover:bg-mint-soft transition"
                >
                  + Add new address
                </button>
                <button 
                  onClick={() => setStep(1)}
                  disabled={!selectedAddress}
                  className="mt-2 w-full bg-forest text-forest-foreground rounded-full py-3.5 text-sm font-bold shadow-lg"
                >
                  Confirm Address →
                </button>
              </div>
            )}
          </section>

          {/* Section 2: Delivery Slot */}
          <section className={cn("freshon-card overflow-hidden transition-all duration-300", step === 1 ? "p-5 border-forest/30" : "p-4 bg-surface/50 opacity-90")}>
            <button 
              onClick={() => selectedAddress && setStep(1)}
              disabled={!selectedAddress}
              className="flex w-full items-center justify-between text-left disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className={cn("grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition", 
                  step > 1 ? "bg-mint text-mint-foreground" : step === 1 ? "bg-forest text-forest-foreground" : "bg-surface text-muted-foreground")}>
                  {step > 1 ? <Check className="h-4 w-4" /> : "2"}
                </div>
                <div>
                  <h2 className="font-display text-sm font-bold">Delivery time</h2>
                  {step > 1 && slot && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">{slots.find((s: any) => s.id === slot)?.title}</p>
                  )}
                </div>
              </div>
              {step > 1 && <span className="text-[10px] font-bold text-forest uppercase tracking-wider">Change</span>}
            </button>

            {step === 1 && (
              <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
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
                <button 
                  onClick={() => setStep(2)}
                  disabled={!slot}
                  className="mt-2 w-full bg-forest text-forest-foreground rounded-full py-3.5 text-sm font-bold shadow-lg"
                >
                  Confirm Delivery →
                </button>
              </div>
            )}
          </section>

          {/* Section 3: Payment */}
          <section className={cn("freshon-card overflow-hidden transition-all duration-300", step === 2 ? "p-5 border-forest/30" : "p-4 bg-surface/50 opacity-90")}>
            <button 
              onClick={() => slot && setStep(2)}
              disabled={!slot}
              className="flex w-full items-center justify-between text-left disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className={cn("grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition", 
                  step > 2 ? "bg-mint text-mint-foreground" : step === 2 ? "bg-forest text-forest-foreground" : "bg-surface text-muted-foreground")}>
                  {step > 2 ? <Check className="h-4 w-4" /> : "3"}
                </div>
                <div>
                  <h2 className="font-display text-sm font-bold">Payment method</h2>
                  {step > 2 && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">{pay.toUpperCase()}</p>
                  )}
                </div>
              </div>
              {step > 2 && <span className="text-[10px] font-bold text-forest uppercase tracking-wider">Change</span>}
            </button>

            {step === 2 && (
              <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckoutWallet 
                  orderTotal={total}
                  onWalletAmountChange={setWalletAmountUsed}
                />
                <div className="space-y-3">
                  {[
                    { id: "upi", t: "UPI", d: "Google Pay, PhonePe, Paytm" },
                    { id: "card", t: "Credit / Debit Card", d: "Visa, Mastercard, RuPay" },
                    { id: "cod", t: "Cash on Delivery", d: "Pay when order arrives" },
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
                        <p className="text-[10px] text-muted-foreground">{m.d}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setStep(3)}
                  className="mt-2 w-full bg-forest text-forest-foreground rounded-full py-3.5 text-sm font-bold shadow-lg"
                >
                  Review Order →
                </button>
              </div>
            )}
          </section>

          {/* Section 4: Final Review */}
          {step === 3 && (
            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
              <section className="freshon-card p-5">
                <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">Order Review</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <img src={item.product.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-[13px] font-bold leading-tight">{item.product.name}</p>
                        <p className="text-[10px] text-muted-foreground">{item.qty} × ₹{item.product.price}</p>
                      </div>
                      <span className="text-sm font-bold">₹{item.qty * item.product.price}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 space-y-2 border-t border-dashed border-border pt-4 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery fee</span>
                    <span className="text-mint">{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                  </div>
                  {walletAmountUsed > 0 && (
                    <div className="flex justify-between text-forest font-bold">
                      <span>Wallet Used</span>
                      <span>-₹{walletAmountUsed}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-display text-lg font-extrabold text-forest pt-2">
                    <span>Total to pay</span>
                    <span>₹{Math.max(0, total - walletAmountUsed)}</span>
                  </div>
                </div>
              </section>

              {/* Trust Row */}
              <div className="grid grid-cols-3 gap-2 px-1 py-2">
                {[
                  { label: "100% Organic", icon: Leaf },
                  { label: "Safe Payment", icon: CreditCard },
                  { label: "No Middlemen", icon: Sprout },
                ].map((t) => (
                  <div key={t.label} className="flex flex-col items-center gap-1 text-center">
                    <div className="h-8 w-8 rounded-full bg-mint-soft flex items-center justify-center text-forest">
                      <t.icon className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
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

      {step === 3 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background p-4 shadow-cta animate-in slide-in-from-bottom duration-500">
          <div className="container max-w-3xl">
            <button
              onClick={next}
              disabled={isProcessing}
              className="flex h-14 w-full items-center justify-between rounded-full bg-earth px-6 text-sm font-bold text-earth-foreground shadow-xl active:scale-[0.98] transition-all"
            >
              <div className="text-left">
                <span className="block text-[10px] opacity-70 uppercase tracking-widest">Final Step</span>
                <span>{isProcessing ? "Processing..." : "Place Order"}</span>
              </div>
              <span className="font-display text-xl">₹{Math.max(0, total - walletAmountUsed)} →</span>
            </button>
          </div>
        </div>
      )}
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
