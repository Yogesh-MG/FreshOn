import { createRoot } from "react-dom/client";
import { initClient } from "@freshon/api";
import App from "./App.tsx";
import "./index.css";

// ── Initialize the FreshOn API client before rendering ──────────────
const API_URL = import.meta.env.VITE_API_URL || "https://yogesh843120.pythonanywhere.com";

initClient({
  baseURL: API_URL,
  authRedirectPath: "/",                // POS login is at root
  publicEndpoints: [
    "/api/auth/register/",
    "/api/auth/login/",
    "/api/auth/token/refresh/",
    "/api/pos/login/",                  // POS PIN login is public
  ],
});

createRoot(document.getElementById("root")!).render(<App />);
