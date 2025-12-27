import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n";
import { AppRouter } from "./router/AppRouter";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <AppRouter />
  </StrictMode>
);
