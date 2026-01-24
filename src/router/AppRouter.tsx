import { BrowserRouter, Routes, Route } from "react-router-dom";
import Example from "../pages/Example";
import "../index.css";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import Login from "../pages/Login";
import ResetPassword from "../pages/ResetPassword";
import RequestResetPass from "../pages/RequestResetPass";


/**
 * Router Principal de la Aplicación.
 * Define la estructura de navegación utilizando React Router DOM.
 * * Se divide en dos grupos lógicos:
 * 1. Rutas Protegidas: Requieren un token de sesión válido.
 * 2. Rutas Públicas: Solo accesibles si el usuario NO está autenticado (Login, Recobro).
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Raíz: Protegida. Si no hay login, rebota a /login */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Example initial={10} />
            </ProtectedRoute>
          }
        />
        {/* Ruta de Login: Pública. Si ya está logueado, rebota a / */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        {/* Flujo de Recuperación de Contraseña: Público */}
        <Route
          path="/request-reset-password"
          element={
            <PublicRoute>
              <RequestResetPass />
            </PublicRoute>
          }
        />
        
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
