import { useEffect, useState } from "react";
import { MapPin, Loader2, ShieldCheck } from "lucide-react";
import { geoService, notificationService } from "@/lib/geoService";
import { pickerOrderService } from "@/lib/pickerOrderService";
import { backendAuthService } from "@/lib/backendAuthService";

interface Props {
  onUnlock: () => void;
}

export const GeoGate = ({ onUnlock }: Props) => {
  const [phase, setPhase] = useState<"locating" | "outside" | "inside">("locating");
  const [distance, setDistance] = useState(-1);
  const [hubName, setHubName] = useState<string>("FreshOn Hub");
  const [radius, setRadius] = useState<number>(200);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    // 1. Initialize hubs from picker profile
    const profile = backendAuthService.getStoredPickerProfile();
    if (profile) {
      setHubName(profile.hub_name);
      setRadius(profile.hub_radius_meters);
      
      // Inject coordinates into geoService
      geoService.setHubs([{
        name: profile.hub_name,
        latitude: profile.hub_latitude,
        longitude: profile.hub_longitude,
        radiusM: profile.hub_radius_meters
      }]);
    }

    // 2. Request notification permission for geofence alerts
    notificationService.requestPermission().catch(() => {
      console.log("Notification permission not granted");
    });

    // 3. Start watching location
    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const nearest = await geoService.getNearestHub();
        
        if (nearest) {
          setDistance(nearest.distance);
          setHubName(nearest.hub.name);
          setRadius(nearest.hub.radiusM);
        }

        // Verify with backend
        const result = await pickerOrderService.geoVerify(latitude, longitude);
        if (result.success && result.data?.verified) {
          setPhase("inside");
          if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
          if (result.data.hub_name) setHubName(result.data.hub_name);
        } else {
          setPhase("outside");
        }
      },
      (err) => {
        setError(err.message);
        setPhase("outside");
        setDistance(-1);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    setWatchId(id);

    return () => {
      if (id !== null) {
        navigator.geolocation.clearWatch(id);
      }
    };
  }, []);

  if (phase === "inside") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="animate-fade-in flex flex-col items-center gap-4">
          <div className="size-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
            <ShieldCheck className="size-10 text-primary" strokeWidth={2.5} />
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Hub Verified</p>
          <p className="text-lg font-semibold">{hubName} · Active Zone</p>
          <button
            onClick={onUnlock}
            className="touch-target mt-4 px-8 py-4 bg-primary text-primary-foreground font-mono font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 active:scale-95 transition-all"
            style={{ boxShadow: "var(--shadow-glow-primary)" }}
          >
            Begin Shift →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">FreshOn Pick · v2.4</div>

        <div className="relative size-40 rounded-full border-2 border-border flex items-center justify-center">
          <div className={`absolute inset-4 rounded-full border-2 border-dashed ${phase === "locating" ? "border-accent animate-spin" : "border-destructive"}`} style={{ animationDuration: "3s" }} />
          <MapPin className={`size-14 ${phase === "locating" ? "text-accent" : "text-destructive"}`} strokeWidth={2} />
        </div>

        {phase === "locating" ? (
          <>
            <div className="flex items-center gap-2 font-mono text-sm">
              <Loader2 className="size-4 animate-spin" />
              <span className="uppercase tracking-wider">Acquiring GPS lock…</span>
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              Distance to {hubName}: <span className="text-foreground">{geoService.formatDistance(distance)}</span>
            </div>
            {error && <div className="text-destructive text-xs font-mono">{error}</div>}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold leading-tight">Welcome to the Hub.</h1>
            <p className="text-muted-foreground text-sm">Please enter {hubName} to start picking.</p>
            <div className="w-full p-4 industrial-border bg-card rounded-md font-mono text-xs flex justify-between items-center">
              <span className="text-muted-foreground uppercase tracking-wider">Distance</span>
              <span className="text-destructive font-bold text-base">{geoService.formatDistance(distance)}</span>
            </div>
            <div className="w-full p-4 industrial-border bg-card rounded-md font-mono text-xs flex justify-between items-center">
              <span className="text-muted-foreground uppercase tracking-wider">Geo-fence</span>
              <span className="text-foreground">{radius}m radius</span>
            </div>
            {error && <div className="text-destructive text-xs font-mono text-center">{error}</div>}
          </>
        )}
      </div>
    </div>
  );
};
