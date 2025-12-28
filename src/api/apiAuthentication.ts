import axios from "axios";

/**
 * Instancia de Axios para manejar la autenticación de la aplicación.
 *
 * Esta instancia está configurada con:
 * - URL base obtenida desde variables de entorno (`VITE_API_AUTH_URL`)
 * - Tiempo máximo de espera de 10 segundos
 *
 * Debe usarse exclusivamente para:
 * - Login
 * - Registro
 * - Refresh de tokens
 * - Endpoints de autenticación
 *
 * @example
 * api_authentication.post("/login", {
 *   email: "user@email.com",
 *   password: "123456"
 * });
 */
export const api_authentication = axios.create({
  baseURL: import.meta.env.VITE_API_AUTH_URL,
  timeout: 10000,
});
