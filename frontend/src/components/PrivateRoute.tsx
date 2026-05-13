// src/components/PrivateRoute.tsx
// Wraps protected routes — redirects to /welcome if the user is not authenticated.
// Auth state comes from the server-verified useMe hook, NOT localStorage flags.

import { Navigate } from "react-router-dom";
import { useMe } from "@/hooks/use-me";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { data: user, isLoading, isError } = useMe();

  // While the /me/ request is in-flight (including the silent refresh attempt),
  // render nothing to avoid a flash redirect to /welcome.
  if (isLoading) return null;

  // If /me/ failed (401 even after refresh, or network error) → send to auth.
  if (isError || !user) {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
