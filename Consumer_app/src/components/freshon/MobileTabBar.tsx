import { Home, LayoutGrid, ShoppingBag, User, Zap } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

export const MobileTabBar = () => {
  const count = useCart((s) => s.count());
  const tabs = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/categories", icon: LayoutGrid, label: "Categories" },
    { to: "/cart", icon: ShoppingBag, label: "Cart", badge: count },
    { to: "/profile", icon: User, label: "Profile" },
  ];
  
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 md:hidden">
      <div className="relative border-t border-border bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4 px-2 pt-2">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === "/"}
              className={({ isActive }) =>
                cn("flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium outline-none", isActive ? "text-forest" : "text-muted-foreground")
              }
            >
              <span id="mobile-cart-target" className="relative">
                <t.icon className="h-5 w-5" />
                {!!t.badge && (
                  <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-harvest px-1 text-[9px] font-bold text-harvest-foreground">
                    {t.badge}
                  </span>
                )}
              </span>
              {t.label}
            </NavLink>
          ))}
        </div>
        
        {/* Quick Shop FAB Button */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <Link
            to="/quick-shop"
            className="flex flex-col items-center gap-1 outline-none"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-b from-mint to-forest shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow">
              <Zap className="h-6 w-6" />
            </div>
            <span className="text-[9px] font-bold text-forest whitespace-nowrap mt-1">Quick Shop</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
