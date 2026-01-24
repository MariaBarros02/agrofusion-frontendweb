import {create} from 'zustand';
import {persist} from 'zustand/middleware';


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

    /**
     * Función para hidratar el estado al iniciar sesión.
     * @param access - JWT de acceso.
     * @param refresh - JWT de refresco.
     */
    login: (access:string, refresh:string) => void;
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

            // --- ACCIONES ---

            /**
             * Establece los tokens y marca al usuario como autenticado.
             */
            login: (access, refresh) =>
                set({
                    accessToken: access,
                    refreshToken: refresh,
                    isAuthenticated: true,
                }),
            logout: () =>
                set({
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                }),
                
        }),
        {
            name: 'auth-storage',
        }
    )
);