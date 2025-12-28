import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n/i18n";
import { AppRouter } from "./router/AppRouter";
import { ThemeProvider } from "./context/ThemeContext";

/**
 * Punto de entrada principal de la aplicación.
 *
 * Responsabilidades:
 * - Inicializar React en el elemento raíz del DOM
 * - Activar verificaciones adicionales con `StrictMode`
 * - Cargar estilos globales
 * - Inicializar la configuración de internacionalización (i18n)
 * - Proveer el contexto global de tema
 * - Renderizar el sistema de rutas de la aplicación
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Proveedor global del tema (modo claro / oscuro) */}
    <ThemeProvider>
      {/* Sistema de rutas de la aplicación */}
      <AppRouter />
    </ThemeProvider>
  </StrictMode>
);
