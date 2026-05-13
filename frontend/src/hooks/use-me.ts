// src/hooks/use-me.ts
// Centralized auth-state hook using React Query.
// Every component that needs to know "who is logged in" calls this —
// the result is cached so /api/auth/me/ is only fetched once per session.

import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_verified: boolean;
  partnership?: {
    tier: string;
    tier_display: string;
    invested_amount: number;
    start_date: string;
    total_savings: number;
  };
}

async function fetchMe(): Promise<CurrentUser> {
  const res = await api.get<CurrentUser>("/api/auth/me/");
  return res.data;
}

/**
 * useMe — returns the currently authenticated user.
 *
 * - `data`    : CurrentUser object, or undefined if not logged in.
 * - `isLoading`: true while the initial /me/ request is in flight.
 * - `isError` : true if the user is not authenticated (401) or server error.
 *
 * The Axios interceptor in api.ts handles silent refresh automatically:
 * if /me/ returns 401, it retries after refreshing the access token.
 * If the refresh also fails, it redirects to /welcome.
 * 
 * Caching: Results are cached for 10 minutes. Multiple components can safely
 * call useMe() — React Query deduplicates requests automatically.
 */
export function useMe() {
  return useQuery<CurrentUser, Error>({
    queryKey: ["me"],
    queryFn: fetchMe,
    // Uses defaults from QueryClient: retry=false, staleTime=5min, gcTime=30min
    // These prevent constant refetching across component re-renders
  });
}
