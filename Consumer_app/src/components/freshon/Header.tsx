import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Home,
  LayoutGrid,
  MapPin,
  Menu,
  Package,
  Search,
  ShoppingCart,
  User,
  Wallet,
  Star,
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

export const Header = () => {
  const count = useCart((s) => s.count());
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [location, setLocation] = useState(() => localStorage.getItem("freshon-location") || "Koramangala");
  const locations = ["Koramangala", "Indiranagar", "Whitefield", "HSR Layout"];

  const chooseLocation = (nextLocation: string) => {
    setLocation(nextLocation);
    localStorage.setItem("freshon-location", nextLocation);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    navigate(`/search${query ? `?q=${encodeURIComponent(query)}` : ""}`);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md pt-[env(safe-area-inset-top)]">
      <div className="container flex h-16 items-center gap-3 md:h-20 md:gap-6 px-4 mx-auto">
        <Link to="/" className="flex shrink-0 items-center">
          <img src="/logo.png" alt="Freshon" className="h-10 w-auto md:h-12" />
        </Link>

        <Sheet>
          <SheetTrigger asChild>
            <button className="hidden items-center gap-1 rounded-full px-3 py-1.5 text-sm hover:bg-surface md:flex">
              <MapPin className="h-4 w-4 text-mint" />
              <span className="font-medium">{location}</span>
              <span className="text-muted-foreground">- 12 min</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </SheetTrigger>
          <SheetContent side="top" className="mx-auto max-w-xl rounded-b-2xl">
            <SheetHeader>
              <SheetTitle>Delivery location</SheetTitle>
            </SheetHeader>
            <div className="mt-5 grid gap-2">
              {locations.map((item) => (
                <SheetClose asChild key={item}>
                  <button
                    onClick={() => chooseLocation(item)}
                    className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-left text-sm font-semibold hover:bg-mint-soft"
                  >
                    <span>{item}</span>
                    <span className="text-xs text-muted-foreground">12 min</span>
                  </button>
                </SheetClose>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <form onSubmit={submit} className="relative max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => navigate("/search")}
            placeholder='Search "tomato", "milk", "spinach"...'
            className="h-11 w-full rounded-full bg-surface pl-11 pr-4 text-sm font-medium outline-none ring-mint/40 placeholder:text-muted-foreground focus:ring-2"
          />
        </form>

        <Link to="/profile" className="hidden h-10 w-10 place-items-center rounded-full hover:bg-surface md:grid" aria-label="Profile">
          <User className="h-5 w-5" />
        </Link>
        <Link to="/profile?section=wallet" className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface" aria-label="Wallet">
          <Wallet className="h-5 w-5 text-mint" />
        </Link>
        <Link to="/cart" className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-surface" aria-label="Cart">
          <ShoppingCart className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-harvest px-1 text-[10px] font-bold text-harvest-foreground">
              {count}
            </span>
          )}
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface md:hidden" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>Freshon</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 grid gap-2">
              {[
                { to: "/", label: "Home", icon: Home },
                { to: "/categories", label: "Categories", icon: LayoutGrid },
                { to: "/cart", label: "Cart", icon: ShoppingCart },
                 { to: "/profile?section=orders", label: "My orders", icon: Package },
                 { to: "/profile", label: "Profile", icon: User },
                 { to: "/pride", label: "Become PRIDE Partner", icon: Star, highlight: true },
               ].map((item: any) => (
                 <SheetClose asChild key={item.to}>
                   <Link 
                    to={item.to} 
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold hover:bg-surface",
                      item.highlight && "bg-harvest text-harvest-foreground hover:bg-harvest/90"
                    )}
                   >
                     <item.icon className={cn("h-4 w-4 text-forest", item.highlight && "text-harvest-foreground")} />
                     {item.label}
                   </Link>
                 </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <div className="container -mt-1 flex items-center gap-2 pb-2 md:hidden">
        <MapPin className="h-3.5 w-3.5 text-mint" />
        <span className="text-xs font-medium">
          Deliver to <b>{location}</b> - 12 min
        </span>
      </div>
    </header>
  );
};
