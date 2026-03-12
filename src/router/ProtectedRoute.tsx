import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { fetchActiveModulesService } from "../services/agrofusion/auth.service";
import type { JSX } from "react";

/**
 * Guardián de Rutas Privadas.
 * Carga módulos activos y rol al entrar para el control de acceso por módulo.
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
}