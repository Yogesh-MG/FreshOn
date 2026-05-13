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

export function isAuthed() {
  return !!localStorage.getItem(ACCESS_TOKEN_KEY);
}

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

api.interceptors.request.use((config) => {
  // Don't auto-inject token for public auth endpoints
  const publicEndpoints = [
    "/api/auth/send-otp/",
    "/api/auth/verify-otp/",
    "/api/auth/register/",
    "/api/auth/login/",
    "/api/auth/token/refresh/",
  ];

  const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

  if (!isPublicEndpoint) {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return config;
});

let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

function onRefreshed() {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
}

function redirectToWelcome() {
  clearAuthTokens();

  if (typeof window !== "undefined") {
    window.location.href = "/welcome";
  }
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

      if (!refreshToken) {
        redirectToWelcome();
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
        redirectToWelcome();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
