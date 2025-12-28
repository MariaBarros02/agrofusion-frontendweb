import { BrowserRouter, Routes, Route } from "react-router-dom";
import Example from "../pages/Example";
import "../index.css";

/**
 * Componente encargado de definir el enrutamiento principal
 * de la aplicación.
 *
 * Responsabilidades:
 * - Inicializar el router basado en el historial del navegador
 * - Definir las rutas disponibles de la aplicación
 * - Asociar cada ruta con su componente correspondiente
 *
 *
 * @example
 * <AppRouter />
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal de la aplicación */}
        <Route path="/" element={<Example initial={10} />} />
      </Routes>
    </BrowserRouter>
  );
}
