import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initClient } from "@freshon/api";
import { baseUrl } from "./utils/apiconfig";

// Initialize the shared API SDK
initClient({ baseURL: baseUrl });

createRoot(document.getElementById("root")!).render(<App />);
