import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Heart, Leaf, LogOut, MapPin, Package, Settings, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/freshon/PageShell";
import { cn } from "@/lib/utils";
import { useMe } from "@/hooks/use-me";
import { 
  auth as authModule, 
  orders as ordersModule, 
  profile as profileModule 
} from "@freshon/api";
import { WalletSection } from "@/components/freshon/WalletSection";

type ProfileSection = "orders" | "addresses" | "preferences" | "settings" | "wallet";

const defaultAddress = {
  title: "",
  address_line: "",
  address_type: "HOME",
};

const defaultPreferences = {
  organicOnly: false,
  vegetarian: true,
  avoidPlastic: true,
  allergens: "",
  notes: "",
};

const defaultSettings = {
  orderUpdates: true,
  offers: false,
  weeklySummary: true,
  privateProfile: false,
};

// Helper Components (declared before Profile)

interface AccordionSectionProps {
  id: ProfileSection;
  title: string;
  icon: typeof Package;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const AccordionSection = ({ title, icon: Icon, isExpanded, onToggle, children }: AccordionSectionProps) => (
  <div className="freshon-card overflow-hidden">
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 p-4 hover:bg-mint-soft transition"
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-mint-soft text-forest">
          <Icon className="h-4 w-4" />
        </div>
        <p className="font-semibold text-sm">{title}</p>
      </div>
      <ChevronDown
        className={cn("h-5 w-5 text-muted-foreground transition-transform", isExpanded && "rotate-180")}
      />
    </button>

    {isExpanded && <div className="border-t border-border px-4 py-4">{children}</div>}
  </div>
);

const OrdersSection = ({ orders }: { orders: any[] }) => (
  <div className="space-y-3">
    {orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
    {orders.map((order) => (
      <Link
        key={order.id || order.tracking_id}
        to={`/track/${order.tracking_id}`}
        className="flex items-center gap-3 rounded-lg bg-surface p-3 hover:bg-mint-soft transition"
      >
        <Package className="h-5 w-5 text-forest flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Order #{order.tracking_id}</p>
          <p className="text-xs text-muted-foreground">
            {order.status} - {order.created_at ? new Date(order.created_at).toLocaleDateString() : "Placed"}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 rotate-[-90deg]" />
      </Link>
    ))}
  </div>
);

const AddressSection = ({
  address,
  setAddress,
  isSaving,
  onSave,
}: {
  address: any;
  setAddress: (value: any) => void;
  isSaving: boolean;
  onSave: () => void;
}) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      onSave();
    }}
    className="space-y-3"
  >
    {[
      ["title", "Address title (e.g. Home, Work)"],
      ["address_line", "Full address line"],
    ].map(([key, label]) => (
      <label key={key} className="grid gap-1 text-sm font-semibold">
        {label}
        <input
          value={address[key]}
          onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
          className="h-10 rounded-lg bg-surface px-3 text-sm font-medium outline-none ring-mint/40 focus:ring-2"
        />
      </label>
    ))}
    <SaveButton isSaving={isSaving} />
  </form>
);

const PreferencesSection = ({
  preferences,
  setPreferences,
  isSaving,
  onSave,
}: {
  preferences: any;
  setPreferences: (value: any) => void;
  isSaving: boolean;
  onSave: () => void;
}) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      onSave();
    }}
    className="space-y-3"
  >
    {[
      ["organicOnly", "Show organic first"],
      ["vegetarian", "Vegetarian household"],
      ["avoidPlastic", "Prefer plastic-free packing"],
    ].map(([key, label]) => (
      <label key={key} className="flex items-center justify-between rounded-lg bg-surface p-3 text-sm font-semibold">
        {label}
        <input
          type="checkbox"
          checked={!!preferences[key]}
          onChange={(e) => setPreferences({ ...preferences, [key]: e.target.checked })}
          className="h-5 w-5 accent-forest"
        />
      </label>
    ))}
    <label className="grid gap-1 text-sm font-semibold">
      Allergens to avoid
      <input
        value={preferences.allergens}
        onChange={(e) => setPreferences({ ...preferences, allergens: e.target.value })}
        placeholder="Nuts, dairy, gluten..."
        className="h-10 rounded-lg bg-surface px-3 text-sm font-medium outline-none ring-mint/40 focus:ring-2"
      />
    </label>
    <label className="grid gap-1 text-sm font-semibold">
      Delivery notes
      <textarea
        value={preferences.notes}
        onChange={(e) => setPreferences({ ...preferences, notes: e.target.value })}
        className="min-h-20 rounded-lg bg-surface px-3 py-2 text-sm font-medium outline-none ring-mint/40 focus:ring-2"
      />
    </label>
    <SaveButton isSaving={isSaving} />
  </form>
);

const SettingsSection = ({
  settings,
  setSettings,
  isSaving,
  onSave,
}: {
  settings: any;
  setSettings: (value: any) => void;
  isSaving: boolean;
  onSave: () => void;
}) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      onSave();
    }}
    className="space-y-3"
  >
    {[
      ["orderUpdates", "Order updates"],
      ["offers", "Offers and coupons"],
      ["weeklySummary", "Weekly summary"],
      ["privateProfile", "Private profile"],
    ].map(([key, label]) => (
      <label key={key} className="flex items-center justify-between rounded-lg bg-surface p-3 text-sm font-semibold">
        {label}
        <input
          type="checkbox"
          checked={!!settings[key]}
          onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
          className="h-5 w-5 accent-forest"
        />
      </label>
    ))}
    <SaveButton isSaving={isSaving} />
  </form>
);

const SaveButton = ({ isSaving }: { isSaving: boolean }) => (
  <button className="mt-4 h-10 rounded-lg bg-forest px-6 text-sm font-semibold text-forest-foreground disabled:opacity-60" type="submit" disabled={isSaving}>
    {isSaving ? "Saving..." : "Save changes"}
  </button>
);

// Main Profile Component

const Profile = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { data: profile } = useMe();
  const [savedMessage, setSavedMessage] = useState("");
  const sectionFromQuery = (searchParams.get("section") || "orders") as ProfileSection;
  const [expandedSections, setExpandedSections] = useState<Record<ProfileSection, boolean>>({
    orders: sectionFromQuery === "orders",
    addresses: sectionFromQuery === "addresses",
    preferences: sectionFromQuery === "preferences",
    settings: sectionFromQuery === "settings",
    wallet: sectionFromQuery === "wallet",
  });

  const { data: ordersData } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => ordersModule.listOrders(),
  });

  const orders = ordersData?.results || [];
  
  console.log("orders:", orders);
  console.log("isArray:", Array.isArray(orders));

  const { data: profileData } = useQuery({
    queryKey: ["profile-data"],
    queryFn: () => profileModule.getProfile(),
  });

  const [address, setAddress] = useState(defaultAddress);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    if (!profileData) return;
    setAddress({ ...defaultAddress, ...(profileData.address || {}) });
    setPreferences({ ...defaultPreferences, ...(profileData.preferences || {}) });
    setSettings({ ...defaultSettings, ...(profileData.settings || {}) });
  }, [profileData]);

  const profileMutation = useMutation({
    mutationFn: (payload: any) => profileModule.updateProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile-data"], (current: any) => ({ ...(current || {}), ...data }));
      setSavedMessage("Saved");
    },
  });

  const recentOrder = orders[0];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const saved = useMemo(() => safeOrders.reduce((sum: number, order: any) => sum + Number(order.discount || 0), 0), [safeOrders]);

  useEffect(() => {
    if (!savedMessage) return;
    const timer = window.setTimeout(() => setSavedMessage(""), 1800);
    return () => window.clearTimeout(timer);
  }, [savedMessage]);

  const toggleSection = (section: ProfileSection) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLogout = async () => {
    try {
      await authModule.logout();
    } catch (e) {
      console.error("Logout failed", e);
    }
    queryClient.clear();
    window.location.href = "/welcome";
  };

  return (
    <PageShell>
      <div className="container max-w-4xl pt-6 pb-20">
        <div className="freshon-card flex items-center gap-4 bg-gradient-fresh p-5">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-forest font-display text-xl font-bold text-forest-foreground">
            {profile?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold">{profile?.username || "Guest User"}</h1>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
          <span className="freshon-chip bg-background">
            <Leaf className="h-3 w-3 text-mint" /> Member
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { v: orders.length.toString(), l: "Orders" },
            { v: `Rs ${saved}`, l: "Saved" },
            { v: preferences.avoidPlastic ? "On" : "Off", l: "Plastic-free" },
          ].map((s) => (
            <div key={s.l} className="freshon-card p-4 text-center">
              <p className="font-display text-lg font-bold text-forest">{s.v}</p>
              <p className="text-xs text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>

        {recentOrder && (
          <section className="mt-6">
            <h2 className="mb-3 font-display text-base font-bold">Recent order</h2>
            <Link to={`/track/${recentOrder.tracking_id}`} className="freshon-card flex items-center gap-3 p-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-mint-soft text-forest">
                <Package className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Order #{recentOrder.tracking_id}</p>
                <p className="text-xs text-muted-foreground">
                  {recentOrder.status} - {new Date(recentOrder.created_at).toLocaleDateString()}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Link>
          </section>
        )}

        {/* Accordion Sections */}
        <div className="mt-6 space-y-3">
          {/* Wallet Section */}
          <AccordionSection
            id="wallet"
            title="Wallet"
            icon={Wallet}
            isExpanded={expandedSections.wallet}
            onToggle={() => toggleSection("wallet")}
          >
            <WalletSection />
          </AccordionSection>

          {/* Orders Section */}
          <AccordionSection
            id="orders"
            title="My orders"
            icon={Package}
            isExpanded={expandedSections.orders}
            onToggle={() => toggleSection("orders")}
          >
            <OrdersSection orders={orders} />
          </AccordionSection>

          {/* Addresses Section */}
          <AccordionSection
            id="addresses"
            title="Addresses"
            icon={MapPin}
            isExpanded={expandedSections.addresses}
            onToggle={() => toggleSection("addresses")}
          >
            <AddressSection
              address={address}
              setAddress={setAddress}
              isSaving={profileMutation.isPending}
              onSave={() => profileMutation.mutate({ address })}
            />
          </AccordionSection>

          {/* Preferences Section */}
          <AccordionSection
            id="preferences"
            title="Preferences"
            icon={Heart}
            isExpanded={expandedSections.preferences}
            onToggle={() => toggleSection("preferences")}
          >
            <PreferencesSection
              preferences={preferences}
              setPreferences={setPreferences}
              isSaving={profileMutation.isPending}
              onSave={() => profileMutation.mutate({ preferences })}
            />
          </AccordionSection>

          {/* Settings Section */}
          <AccordionSection
            id="settings"
            title="Settings"
            icon={Settings}
            isExpanded={expandedSections.settings}
            onToggle={() => toggleSection("settings")}
          >
            <SettingsSection
              settings={settings}
              setSettings={setSettings}
              isSaving={profileMutation.isPending}
              onSave={() => profileMutation.mutate({ settings })}
            />
          </AccordionSection>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-surface text-sm font-semibold text-foreground hover:bg-gray-200 transition"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </PageShell>
  );
};

export default Profile;
