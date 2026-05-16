/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from "jwt-decode";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useModuleAccessStore } from "./moduleAccess.store";
import { useSubmoduleAccessStore } from "./submoduleAccess.store";

const isTokenExpired = (token: string) => {
  const decoded: any = jwtDecode(token);
  return decoded.exp * 1000 < Date.now();
};
/**
 * Interfaz que define la estructura del estado de autenticación.
 * Contiene tanto los datos (tokens) como las acciones (login/logout).
 */
interface AuthState {
  /** Token de acceso para peticiones API */
  accessToken: string | null;
  /** Token para renovar el accessToken cuando expire */
  refreshToken: string | null;
  /** Booleano para verificar rápidamente si hay una sesión activa */
  isAuthenticated: boolean;
  /** Booleano para verificar si el estado ha sido hidratado desde el almacenamiento persistente */
  isHydrated: boolean;
  id: string | null;
    isRefreshing: boolean;
    setRefreshing: (val: boolean) => void;  
  email: string | null;


  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;

  /**
   * Función para hidratar el estado al iniciar sesión.
   * @param access - JWT de acceso.
   * @param refresh - JWT de refresco.
   * @param email - Email del usuario autenticado.
   */
  login: (access: string, refresh: string, email: string) => void;
  /** * Limpia el estado y cierra la sesión del usuario.
   */
  logout: () => void;
}
/**
 * Hook `useAuthStore` para acceder al estado global de autenticación.
 * * El middleware `persist` envuelve la configuración para guardar automáticamente
 * el estado en el almacenamiento del navegador (localStorage).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // --- ESTADO INICIAL ---
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      email: null,
      id: null,
      isHydrated: false,
      isRefreshing: false,

      sidebarOpen: true,
      setSidebarOpen: (value: boolean) =>
        set({ sidebarOpen: value }),
      setRefreshing: (val: boolean) => set({ isRefreshing: val }),

      // --- ACCIONES ---

      /**
       * Establece los tokens y marca al usuario como autenticado.
       */
      login: (access, refresh, email) => {
        const decoded: any = jwtDecode(access);
        set({
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: !!access && !isTokenExpired(access),
          email: email,
          id: decoded.sub,
        });
      },
      logout: () => {
        useModuleAccessStore.getState().clearModuleAccess();
        useSubmoduleAccessStore.getState().clearSubmoduleAccess();
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          email: null,
          id: null,
        });
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      },
    },
  ),
);
