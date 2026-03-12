import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";
import { fetchActiveModulesService } from "../services/agrofusion/auth.service";
import { fetchActiveSubmodulesService } from "../services/agrofusion/auth.service";
import type { JSX } from "react";

/**
 * Guardián de Rutas Privadas.
 * @param children - El componente/página que se desea renderizar.
 * @returns El componente solicitado o una redirección forzada al Login.
 */
export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuth = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuth) {
      fetchActiveModulesService().catch(() => {
        // Si falla (ej. 401), el interceptor ya maneja logout/redirect
      });
    }
  }, [isAuth]);

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
  const isAuth = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuth) {
      fetchActiveSubmodulesService().catch(() => {});
    }
  }, [isAuth]);

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
}