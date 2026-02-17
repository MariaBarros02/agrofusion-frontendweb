import type { AxiosInstance } from "axios";
import { getSigmaServiceToken } from "./sigmaTokenManager";
import axios from "axios";
import { useAuthStore } from "../../../store/auth.store";
/**
 * Instancia base de Axios para los servicios del ecosistema Sigma.
 * Configura la URL base desde las variables de entorno y gestiona 
 * automáticamente los tokens de autenticación.
 */
export const authPrivateAxios = axios.create({
    /** @type {string} URL base obtenida de las variables de entorno para Sigma */
    baseURL: import.meta.env.VITE_API_SIGMA_URL,
    /** @type {number} Tiempo máximo de espera (10 segundos) antes de abortar la petición */
    timeout: 10000,
});
/**
 * Aplicación de interceptores globales.
 * Se encarga de inyectar los headers de autorización en cada petición.
 */

export const applyServiceAuthInterceptor = (api: AxiosInstance) => {
  api.interceptors.request.use(async (config) => {
    const token = await getSigmaServiceToken(useAuthStore.getState().email ?? "");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });
};
applyServiceAuthInterceptor(authPrivateAxios);
