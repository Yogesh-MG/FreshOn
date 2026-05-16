import { createRoot } from "react-dom/client";
import { initClient } from "@freshon/api";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

initClient({
  baseURL: import.meta.env.VITE_API_URL || "https://yogesh843120.pythonanywhere.com",
  authRedirectPath: "/",
});

createRoot(document.getElementById("root")!).render(<App />);
