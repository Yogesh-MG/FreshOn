import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { PageShell } from "@/components/freshon/PageShell";
import { Check, Package, Truck, Home, MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const Track = () => {
  const { id } = useParams();

  // 1. Fetch Order Details
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => api.get(`/api/orders/orders/${id}/`).then((res) => res.data),
    refetchInterval: 10000, // Refresh every 10s for tracking
  });

  const getStages = (status: string) => [
    { icon: Check, t: "Order placed", time: "Confirmed", done: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(status) },
    { icon: Package, t: "Packed at farm hub", time: "Ready", done: ["PROCESSING", "SHIPPED", "DELIVERED"].includes(status), active: status === "PROCESSING" },
    { icon: Truck, t: "Out for delivery", time: "On the way", done: ["SHIPPED", "DELIVERED"].includes(status), active: status === "SHIPPED" },
    { icon: Home, t: "Delivered", time: "Arrival", done: status === "DELIVERED", active: status === "DELIVERED" },
  ];

  const stages = order ? getStages(order.status) : [];
  return (
    <PageShell>
      <div className="container max-w-2xl pt-6 pb-12">
        <span className="freshon-chip bg-mint-soft text-forest">Order #{id}</span>
        <h1 className="mt-3 font-display text-2xl font-bold">Arriving in <span className="text-forest">12 minutes</span></h1>
        <p className="text-sm text-muted-foreground">Your fresh order is on its way 🌿</p>

        <div className="mt-8 freshon-card p-6">
          <ol className="relative space-y-6">
            <span className="absolute left-[19px] top-2 h-[calc(100%-1rem)] w-px bg-border" />
            {stages.map((s) => (
              <li key={s.t} className="relative flex items-start gap-4">
                <span className={cn("relative z-10 grid h-10 w-10 place-items-center rounded-full",
                  s.done ? "bg-mint text-mint-foreground" : s.active ? "bg-forest text-forest-foreground ring-4 ring-mint-soft" : "bg-surface text-muted-foreground")}>
                  <s.icon className="h-4 w-4" />
                </span>
                <div className="pt-1.5">
                  <p className={cn("font-display text-sm font-semibold", s.active && "text-forest")}>{s.t}</p>
                  <p className="text-xs text-muted-foreground">{s.time}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-4 freshon-card p-5">
          <h3 className="font-display text-sm font-bold">Delivery partner</h3>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-mint-soft text-lg">🚴</div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Arjun K.</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> 1.2 km away</p>
            </div>
            <button className="grid h-10 w-10 place-items-center rounded-full bg-mint text-mint-foreground"><Phone className="h-4 w-4" /></button>
          </div>
        </div>

        <Link to="/" className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-surface text-sm font-semibold">Continue shopping</Link>
      </div>
    </PageShell>
  );
};

export default Track;
