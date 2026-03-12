/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSubmoduleAccessStore } from './submoduleAccess.store';


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

    id: string | null;

    email: string | null;
    /**
     * Función para hidratar el estado al iniciar sesión.
     * @param access - JWT de acceso.
     * @param refresh - JWT de refresco.
     * @param email - Email del usuario autenticado.
     */
    login: (access:string, refresh:string, email:string) => void;
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

            // --- ACCIONES ---

            /**
             * Establece los tokens y marca al usuario como autenticado.
             */
            login: (access, refresh, email) => {
                const decoded: any = jwtDecode(access);
                set({
                    accessToken: access,
                    refreshToken: refresh,
                    isAuthenticated: true,
                    email: email,
                    id: decoded.sub
                })},
            logout: () => {
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
            name: 'auth-storage',
        }
    )
);