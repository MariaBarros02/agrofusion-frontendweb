import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import type { JSX } from "react";


/**
 * Guardián de Rutas Públicas.
 * Evita el acceso a Login/Reset si ya existe una sesión activa.
 * * @param children - Formularios de autenticación o recuperación.
 * @returns El formulario o una redirección al Dashboard (/) si ya hay sesión.
 */
export function PublicRoute({ children }: { children: JSX.Element }) {
  const isAuth = useAuthStore((state) => state.isAuthenticated);

  if (isAuth) {
    // Si el usuario ya está autenticado, no tiene sentido que vea el Login
    return <Navigate to="/" replace />;
  }

  return children;
}
