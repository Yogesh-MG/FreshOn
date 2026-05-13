// src/utils/apiconfig.ts
// API Configuration for Freshon OS

const getBaseUrl = (): string => {
  // Use VITE_API_MAIN_URL from .env
  const apiUrl = import.meta.env.VITE_API_MAIN_URL;

  if (apiUrl) {
    return apiUrl;
  }

  // Fallback for development if .env is missing
  return "http://localhost";
};

/**
 * Get WebSocket URL for real-time updates
 */
export const getWebSocketUrl = (): string => {
  const wsEnv = import.meta.env.VITE_WS_MAIN_URL;
  if (wsEnv) return wsEnv;

  const apiUrl = getBaseUrl();
  const wsUrl = apiUrl
    .replace(/^https:/, 'wss:')
    .replace(/^http:/, 'ws:');

  return wsUrl.endsWith('/api') ? wsUrl.replace('/api', '/ws') : `${wsUrl}/ws`;
};

/**
 * Common headers for all API requests
 */
export const getApiHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
});

/**
 * Wrapper around fetch for simple requests
 */
export const apiFetch = (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = {
    ...getApiHeaders(),
    ...(options.headers || {}),
  };

  return fetch(url, {
    ...options,
    headers,
    credentials: "include", // Essential for HttpOnly cookies
  });
};

export const baseUrl = getBaseUrl();
