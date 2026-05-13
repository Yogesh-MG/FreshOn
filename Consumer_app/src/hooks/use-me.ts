import { useQuery } from "@tanstack/react-query";
import { auth as authModule, type CurrentUser } from "@freshon/api";

async function fetchMe(): Promise<CurrentUser> {
  return await authModule.me();
}

/**
 * useMe — returns the currently authenticated user.
 */
export function useMe() {
  return useQuery<CurrentUser, Error>({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,          // Don't retry on 401 — the interceptor handles that
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
