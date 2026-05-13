// src/utils/api.ts
// Tauri/mobile API client. Auth uses JSON JWTs because Android WebView can
// block third-party cookies even when SameSite=None; Secure is configured.

import axios from "axios";
import { baseUrl } from "./apiconfig";

const ACCESS_TOKEN_KEY = "freshon_access_token";
const REFRESH_TOKEN_KEY = "freshon_refresh_token";

export function setAuthTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

  // Skip adding the token for registration, login, or refresh endpoints
  const isAuthEndpoint = config.url?.includes("/api/auth/register/") ||
    config.url?.includes("/api/auth/login/") ||
    config.url?.includes("/api/auth/token/refresh/");

  if (accessToken && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

function onRefreshed() {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !(originalRequest as any)._retry &&
      !originalRequest.url?.includes("/api/auth/token/refresh/")
    ) {
      (originalRequest as any)._retry = true;

      if (isRefreshing) {
        return new Promise<void>((resolve) => {
          refreshSubscribers.push(resolve);
        }).then(() => api(originalRequest));
      }

      const refreshToken = getRefreshToken();

      // If no refresh token, let the error propagate
      // PrivateRoute will catch isError=true and redirect to /welcome
      if (!refreshToken) {
        clearAuthTokens();
        return Promise.reject(error);
      }

      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${baseUrl}/api/auth/token/refresh/`,
          { refresh: refreshToken },
          { withCredentials: true }
        );

        const { access, refresh } = refreshResponse.data || {};

        if (!access || !refresh) {
          throw new Error("Refresh response did not include access and refresh tokens");
        }

        setAuthTokens(access, refresh);
        isRefreshing = false;
        onRefreshed();

        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        clearAuthTokens();

        // Let React Query handle the error
        // PrivateRoute will catch isError=true and redirect to /welcome
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
