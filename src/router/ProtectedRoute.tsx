import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import type { JSX } from "react";


/**
 * Guardián de Rutas Privadas.
 * * @param children - El componente/página que se desea renderizar.
 * @returns El componente solicitado o una redirección forzada al Login.
 */
export function ProtectedRoute({ children }: { children: JSX.Element }) {
      // Suscripción selectiva al estado de autenticación
    const isAuth = useAuthStore((state) => state.isAuthenticated);
    if (!isAuth) {
       // 'replace' evita que el usuario pueda volver atrás al login vacío
        return <Navigate to="/login" replace />;
    }
    return children;
}