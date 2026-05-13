import { createContext, useContext, ReactNode } from "react";
import { useLocation, UseLocationReturn } from "@/hooks/use-location";

const LocationContext = createContext<UseLocationReturn | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocationContext must be used within LocationProvider");
  }
  return context;
}
