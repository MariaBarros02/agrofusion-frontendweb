/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError, AxiosInstance } from "axios";

import { useAuthStore } from "../store/auth.store";

/** * Estado global para evitar múltiples peticiones simultáneas de refresco de token.
 * @type {boolean}
 */
let isRefreshing = false;

/** * Cola de peticiones que quedaron en espera mientras se refrescaba el token.
 * @type {Array<(token: string) => void>}
 */
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Añade una función callback a la cola de suscriptores que esperan el nuevo token.
 * @param {Function} cb - Callback que recibe el nuevo token de acceso.
 */
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};
/**
 * Notifica a todos los suscriptores en la cola con el nuevo token obtenido
 * y limpia la cola.
 * @param {string} token - El nuevo Access Token.
 */
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};
/**
 * Aplica interceptores de solicitud (Request) y respuesta (Response) a una instancia de Axios.
 * Maneja la inyección de JWT y la lógica de "Silent Refresh" para errores 401.
 * * @param {AxiosInstance} api - Instancia de Axios a la que se le aplicará la configuración.
 */
export const applyAuthInterceptor = (api: AxiosInstance) => {
  /**
   * INTERCEPTOR DE PETICIÓN
   * Se ejecuta antes de que la petición salga hacia el servidor.
   */
  api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  /**
   * INTERCEPTOR DE RESPUESTA
   * Se ejecuta cuando el servidor responde o cuando hay un error de red.
   */
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest: any = error.config;
      const store = useAuthStore.getState();

      if (!error.response) {
        return Promise.reject(error);
      }

      /**
       * MANEJO DE ERROR 401 (Unauthorized)
       * Indica que el token ha expirado o no es válido.
       */
      if (error.response.status === 401) {
        
        if (!store.refreshToken) {
          store.logout();
          localStorage.removeItem("auth-storage");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        if (!originalRequest._retry) {
          if (isRefreshing) {
            return new Promise((resolve) => {
              subscribeTokenRefresh((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(api(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            /** * Intento de renovar el Access Token usando el Refresh Token 
             */
            const res = await api.post("/auth/refresh", {
              refresh_token: store.refreshToken,
            });

            const { access_token, refresh_token } = res.data;

            store.login(access_token, refresh_token);
            onRefreshed(access_token);

            originalRequest.headers.Authorization =
              `Bearer ${access_token}`;

            return api(originalRequest);
          } catch (refreshError) {
            /** * Si el refresco falla (ej: Refresh Token expirado), 
             * limpiamos todo y redirigimos al login.
             */
            store.logout();
            localStorage.removeItem("auth-storage");
            window.location.href = "/login";
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }
      }

      return Promise.reject(error);
    }
  );
};
