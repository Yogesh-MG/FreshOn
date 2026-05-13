// packages/freshon-api/src/modules/ws.ts
// WebSocket manager for real-time communication across all FreshOn apps.
// Provides a singleton connection per channel with auto-reconnect.

import { getClientConfig, getAccessToken } from "../client";
import type { WSChannel, WSEvent } from "../types";

export type WSEventHandler = (event: WSEvent) => void;
export type WSStatusHandler = (status: "connecting" | "connected" | "disconnected" | "error") => void;

interface WSConnection {
  socket: WebSocket | null;
  channel: WSChannel;
  handlers: Set<WSEventHandler>;
  statusHandlers: Set<WSStatusHandler>;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  reconnectAttempts: number;
}

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY_MS = 1000;

const connections = new Map<WSChannel, WSConnection>();

/**
 * Derive the WebSocket URL from the configured API base URL.
 */
function getWSBaseUrl(): string {
  const config = getClientConfig();
  return config.baseURL
    .replace(/^https:/, "wss:")
    .replace(/^http:/, "ws:");
}

/**
 * Build the full WebSocket URL for a channel, including auth token.
 */
function buildWSUrl(channel: WSChannel): string {
  const base = getWSBaseUrl();
  const token = getAccessToken();
  const url = `${base}/ws/${channel}/`;
  // Pass token as query param for WebSocket auth (Django Channels pattern)
  return token ? `${url}?token=${token}` : url;
}

/**
 * Get or create a connection record for a channel.
 */
function getConnection(channel: WSChannel): WSConnection {
  if (!connections.has(channel)) {
    connections.set(channel, {
      socket: null,
      channel,
      handlers: new Set(),
      statusHandlers: new Set(),
      reconnectTimer: null,
      reconnectAttempts: 0,
    });
  }
  return connections.get(channel)!;
}

/**
 * Notify all status handlers for a connection.
 */
function emitStatus(
  conn: WSConnection,
  status: "connecting" | "connected" | "disconnected" | "error"
): void {
  conn.statusHandlers.forEach((handler) => {
    try {
      handler(status);
    } catch (e) {
      console.error(`[@freshon/api] WS status handler error:`, e);
    }
  });
}

/**
 * Connect to a WebSocket channel.
 *
 * ```ts
 * import { connect, subscribe } from "@freshon/api/ws";
 *
 * connect("orders");
 * subscribe("orders", (event) => {
 *   if (event.type === "order_status_changed") { ... }
 * });
 * ```
 */
export function connect(channel: WSChannel): void {
  const conn = getConnection(channel);

  // Already connected or connecting
  if (conn.socket?.readyState === WebSocket.OPEN || conn.socket?.readyState === WebSocket.CONNECTING) {
    return;
  }

  emitStatus(conn, "connecting");

  try {
    const url = buildWSUrl(channel);
    conn.socket = new WebSocket(url);

    conn.socket.onopen = () => {
      conn.reconnectAttempts = 0;
      emitStatus(conn, "connected");
    };

    conn.socket.onmessage = (event) => {
      try {
        const data: WSEvent = JSON.parse(event.data);
        conn.handlers.forEach((handler) => {
          try {
            handler(data);
          } catch (e) {
            console.error(`[@freshon/api] WS event handler error:`, e);
          }
        });
      } catch (e) {
        console.error(`[@freshon/api] WS message parse error:`, e);
      }
    };

    conn.socket.onclose = () => {
      emitStatus(conn, "disconnected");
      scheduleReconnect(conn);
    };

    conn.socket.onerror = () => {
      emitStatus(conn, "error");
    };
  } catch (e) {
    console.error(`[@freshon/api] WS connection error for channel "${channel}":`, e);
    emitStatus(conn, "error");
    scheduleReconnect(conn);
  }
}

/**
 * Schedule a reconnect with exponential backoff.
 */
function scheduleReconnect(conn: WSConnection): void {
  if (conn.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.warn(
      `[@freshon/api] WS max reconnect attempts reached for channel "${conn.channel}"`
    );
    return;
  }

  if (conn.reconnectTimer) {
    clearTimeout(conn.reconnectTimer);
  }

  const delay = BASE_RECONNECT_DELAY_MS * Math.pow(2, conn.reconnectAttempts);
  conn.reconnectAttempts++;

  conn.reconnectTimer = setTimeout(() => {
    connect(conn.channel);
  }, delay);
}

/**
 * Subscribe to events on a channel.
 * Returns an unsubscribe function.
 */
export function subscribe(channel: WSChannel, handler: WSEventHandler): () => void {
  const conn = getConnection(channel);
  conn.handlers.add(handler);

  return () => {
    conn.handlers.delete(handler);
  };
}

/**
 * Subscribe to connection status changes.
 * Returns an unsubscribe function.
 */
export function onStatus(channel: WSChannel, handler: WSStatusHandler): () => void {
  const conn = getConnection(channel);
  conn.statusHandlers.add(handler);

  return () => {
    conn.statusHandlers.delete(handler);
  };
}

/**
 * Disconnect from a specific channel.
 */
export function disconnect(channel: WSChannel): void {
  const conn = connections.get(channel);
  if (!conn) return;

  if (conn.reconnectTimer) {
    clearTimeout(conn.reconnectTimer);
    conn.reconnectTimer = null;
  }

  if (conn.socket) {
    conn.socket.onclose = null; // Prevent auto-reconnect
    conn.socket.close();
    conn.socket = null;
  }

  connections.delete(channel);
}

/**
 * Disconnect from all channels. Call on logout.
 */
export function disconnectAll(): void {
  for (const channel of connections.keys()) {
    disconnect(channel);
  }
}

/**
 * Send a message on an open WebSocket channel.
 */
export function send(channel: WSChannel, data: Record<string, unknown>): void {
  const conn = connections.get(channel);
  if (!conn?.socket || conn.socket.readyState !== WebSocket.OPEN) {
    console.warn(`[@freshon/api] Cannot send on channel "${channel}" — not connected`);
    return;
  }
  conn.socket.send(JSON.stringify(data));
}
