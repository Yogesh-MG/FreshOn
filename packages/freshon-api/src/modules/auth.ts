// packages/freshon-api/src/modules/auth.ts
// Authentication module — login, register, logout, me, refresh.
// Maps to Django's apps/accounts/views.py endpoints.

import { getClient, setAuthTokens, clearAuthTokens, getRefreshToken } from "../client";
import type {
  CurrentUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  TokenRefreshResponse,
} from "../types";

/**
 * Register a new customer account.
 * POST /api/auth/register/
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const res = await getClient().post<RegisterResponse>("/api/auth/register/", data);
  return res.data;
}

/**
 * Login with username + password.
 * POST /api/auth/login/
 * Stores JWT tokens in localStorage for subsequent requests.
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await getClient().post<LoginResponse>("/api/auth/login/", data);

  // Store tokens for Bearer auth (mobile/Tauri WebView can't always use cookies)
  if (res.data.access && res.data.refresh) {
    setAuthTokens(res.data.access, res.data.refresh);
  }

  return res.data;
}

/**
 * Logout — blacklists the refresh token on the server and clears local storage.
 * POST /api/auth/logout/
 */
export async function logout(): Promise<void> {
  const refresh = getRefreshToken();
  try {
    await getClient().post("/api/auth/logout/", refresh ? { refresh } : {});
  } catch {
    // Treat as successful even if server rejects — we clear local state regardless
  }
  clearAuthTokens();
}

/**
 * Get the currently authenticated user.
 * GET /api/auth/me/
 * The Axios interceptor handles silent token refresh automatically.
 */
export async function me(): Promise<CurrentUser> {
  const res = await getClient().get<CurrentUser>("/api/auth/me/");
  return res.data;
}

/**
 * Manually refresh the access token.
 * POST /api/auth/token/refresh/
 * Usually the response interceptor handles this automatically,
 * but this is exposed for explicit refresh scenarios.
 */
export async function refreshTokens(): Promise<TokenRefreshResponse> {
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new Error("No refresh token available");
  }

  const res = await getClient().post<TokenRefreshResponse>(
    "/api/auth/token/refresh/",
    { refresh }
  );

  if (res.data.access && res.data.refresh) {
    setAuthTokens(res.data.access, res.data.refresh);
  }

  return res.data;
}
