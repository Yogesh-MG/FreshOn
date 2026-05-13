import { Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { NavLink } from "react-router-dom";
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
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-4">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === "/"}
            className={({ isActive }) =>
              cn("flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium", isActive ? "text-forest" : "text-muted-foreground")
            }
          >
            <span className="relative">
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
    </nav>
  );
};
