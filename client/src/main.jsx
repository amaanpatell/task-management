import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import useAuthStore from "./store/authStore";
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter } from "react-router-dom";

useAuthStore.getState().initialize();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster />
      <App />
    </BrowserRouter>
  </StrictMode>
);
