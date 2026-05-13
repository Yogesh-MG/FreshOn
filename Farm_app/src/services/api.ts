export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
export const USER_KEY = "freshon_farmer_user";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_TIMEOUT = Number.parseInt(import.meta.env.VITE_API_TIMEOUT || "30000", 10);

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
  skipAuth?: boolean;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const clearSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("farmer_id");
};

const parseJson = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const getErrorMessage = (data: unknown, fallback: string) => {
  if (data && typeof data === "object") {
    const body = data as { message?: string; detail?: string; error?: string };
    return body.message || body.detail || body.error || fallback;
  }
  return fallback;
};

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async () => {
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refresh) return null;

  const response = await fetch(`${API_URL}/api/auth/token/refresh/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-app-platform": "web",
    },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) return null;

  const data = (await parseJson(response)) as { access?: string } | null;
  if (!data?.access) return null;

  localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
  return data.access;
};

const buildBody = (body: RequestOptions["body"], headers: Headers) => {
  if (!body) return undefined;
  if (body instanceof FormData) return body;
  if (typeof body === "string" || body instanceof Blob || body instanceof ArrayBuffer) return body;
  headers.set("Content-Type", "application/json");
  return JSON.stringify(body);
};

const request = async <T>(path: string, options: RequestOptions = {}, retry = true): Promise<T> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), Number.isFinite(API_TIMEOUT) ? API_TIMEOUT : 30000);
  const headers = new Headers(options.headers);
  headers.set("x-app-platform", "web");

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token && !options.skipAuth) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_URL}/api${path}`, {
      ...options,
      headers,
      credentials: "include",
      signal: controller.signal,
      body: buildBody(options.body, headers),
    });

    const data = await parseJson(response);

    if (response.status === 401 && retry && !options.skipAuth) {
      refreshPromise ||= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      const nextToken = await refreshPromise;
      if (nextToken) return request<T>(path, options, false);

      clearSession();
    }

    if (!response.ok) {
      throw new ApiError(getErrorMessage(data, response.statusText), response.status, data);
    }

    return data as T;
  } finally {
    window.clearTimeout(timeout);
  }
};

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: RequestOptions["body"], options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: RequestOptions["body"], options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  put: <T>(path: string, body?: RequestOptions["body"], options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
};

export const getApiErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error) return error.message || fallback;
  return fallback;
};

export default apiClient;
