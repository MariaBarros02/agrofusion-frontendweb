import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { fetchActiveModulesService, fetchActiveSubmodulesService } from "../services/agrofusion/auth.service";
import type { JSX } from "react";

/**
 * Guardián de Rutas Privadas.
 * @param children - El componente/página que se desea renderizar.
 * @returns El componente solicitado o una redirección forzada al Login.
 */
export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuth = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (isAuth) {
      fetchActiveModulesService().catch(() => {});
      fetchActiveSubmodulesService().catch(() => {});
    }
  }, [isAuth]);

    if (!isHydrated) {
    return null; // o loader
  }
  

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
