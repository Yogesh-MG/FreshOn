// packages/freshon-api/src/index.ts
// Barrel export — the single entry point for @freshon/api.
//
// Usage:
//   import { initClient, auth, inventory, orders } from "@freshon/api";
//   initClient({ baseURL: "https://yogesh843120.pythonanywhere.com" });
//   const user = await auth.me();

// ─── Core ─────────────────────────────────────────────────────────────

export {
  initClient,
  getClient,
  getClientConfig,
  setAuthTokens,
  getAccessToken,
  getRefreshToken,
  clearAuthTokens,
} from "./client";
export type { FreshOnClientConfig } from "./client";

// ─── Types ────────────────────────────────────────────────────────────

export * from "./types";

// ─── API Modules (namespaced) ─────────────────────────────────────────

import * as auth from "./modules/auth";
import * as inventory from "./modules/inventory";
import * as orders from "./modules/orders";
import * as delivery from "./modules/delivery";
import * as wallet from "./modules/wallet";
import * as payment from "./modules/payment";
import * as profile from "./modules/profile";
import * as picker from "./modules/picker";
import * as deliveryPartner from "./modules/delivery-partner";
import * as farmer from "./modules/farmer";
import * as pos from "./modules/pos";
import * as ws from "./modules/ws";

export {
  auth,
  inventory,
  orders,
  delivery,
  wallet,
  payment,
  profile,
  picker,
  deliveryPartner,
  farmer,
  pos,
  ws,
};
