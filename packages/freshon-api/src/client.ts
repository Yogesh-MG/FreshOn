// packages/freshon-api/src/client.ts
// Central Axios HTTP client for all FreshOn apps.
// Handles JWT Bearer auth via localStorage (for mobile/Tauri) with automatic
// silent refresh and request queuing during refresh.

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

// ─── Token Storage ────────────────────────────────────────────────────

const ACCESS_KEY = "freshon_access_token";
const REFRESH_KEY = "freshon_refresh_token";

export function setAuthTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function clearAuthTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// ─── Configuration ────────────────────────────────────────────────────

export interface FreshOnClientConfig {
  /** Base URL for the Django backend (e.g. "https://yogesh843120.pythonanywhere.com") */
  baseURL: string;
  /** Path to redirect to on auth failure (default: "/welcome") */
  authRedirectPath?: string;
  /** Public endpoints that skip the Bearer header (default: register, login, refresh) */
  publicEndpoints?: string[];
}

const DEFAULT_PUBLIC_ENDPOINTS = [
  "/api/auth/register/",
  "/api/auth/login/",
  "/api/auth/token/refresh/",
];

// ─── Client Factory ───────────────────────────────────────────────────

let _instance: AxiosInstance | null = null;
let _config: FreshOnClientConfig | null = null;

/**
 * Initialize the FreshOn API client. Must be called once at app startup
 * (e.g. in main.tsx or App.tsx) before any API module is used.
 *
 * ```ts
 * import { initClient } from "@freshon/api";
 * initClient({ baseURL: import.meta.env.VITE_API_MAIN_URL });
 * ```
 */
export function initClient(config: FreshOnClientConfig): AxiosInstance {
  _config = config;

  const client = axios.create({
    baseURL: config.baseURL,
    withCredentials: true,
    xsrfCookieName: "csrftoken",
    xsrfHeaderName: "X-CSRFToken",
  });

  // ── Request interceptor: attach Bearer token ──────────────────────

  const publicEndpoints = config.publicEndpoints ?? DEFAULT_PUBLIC_ENDPOINTS;

  client.interceptors.request.use((req: InternalAxiosRequestConfig) => {
    const isPublic = publicEndpoints.some((ep) => req.url?.includes(ep));

    if (!isPublic) {
      const token = getAccessToken();
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
    }

    return req;
  });

  // ── Response interceptor: silent refresh on 401 ───────────────────

  let isRefreshing = false;
  let refreshSubscribers: Array<() => void> = [];

  function onRefreshed() {
    refreshSubscribers.forEach((cb) => cb());
    refreshSubscribers = [];
  }

  function redirectToAuth() {
    clearAuthTokens();
    if (typeof window !== "undefined") {
      window.location.href = config.authRedirectPath ?? "/welcome";
    }
  }

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("/api/auth/token/refresh/")
      ) {
        originalRequest._retry = true;

        // Queue subsequent requests while refresh is in progress
        if (isRefreshing) {
          return new Promise<void>((resolve) => {
            refreshSubscribers.push(resolve);
          }).then(() => client(originalRequest));
        }

        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          redirectToAuth();
          return Promise.reject(error);
        }

        isRefreshing = true;

        try {
          const refreshResponse = await axios.post(
            `${config.baseURL}/api/auth/token/refresh/`,
            { refresh: refreshToken },
            { withCredentials: true }
          );

          const { access, refresh } = refreshResponse.data ?? {};

          if (!access || !refresh) {
            throw new Error("Refresh response missing tokens");
          }

          setAuthTokens(access, refresh);
          isRefreshing = false;
          onRefreshed();

          return client(originalRequest);
        } catch {
          isRefreshing = false;
          refreshSubscribers = [];
          redirectToAuth();
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  _instance = client;
  return client;
}

/**
 * Returns the initialized Axios instance.
 * Throws if `initClient` was not called first.
 */
export function getClient(): AxiosInstance {
  if (!_instance) {
    throw new Error(
      "[@freshon/api] Client not initialized. Call initClient({ baseURL }) before using API modules."
    );
  }
  return _instance;
}

/**
 * Returns the client config (baseURL etc.) for use in WebSocket connections.
 */
export function getClientConfig(): FreshOnClientConfig {
  if (!_config) {
    throw new Error(
      "[@freshon/api] Client not initialized. Call initClient({ baseURL }) first."
    );
  }
  return _config;
}
