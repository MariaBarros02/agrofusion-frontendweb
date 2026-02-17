import { authApiDisriego } from "./api/auth.api";
import type { ExternalUser } from "../../dto/request/externalUser-request.dto";

/**
 * Solicita un token de recuperación de contraseña específicamente para Disriego.
 * @param email Correo electrónico del usuario.
 * @returns {Promise<{token: string}>} El token generado por la instancia de Disriego.
 */
export const reqResetPasswordService = async (
  email: string
) => {
  const { data } = await authApiDisriego.reqResetPassword({ email });
  return data;
}
/**
 * Aplica el cambio de contraseña en la base de datos de Disriego.
 * @param token Token de validación específico de Disriego.
 * @param newPassword Nueva contraseña.
 * @param confirmPassword Confirmación de seguridad.
 */
export const resetPasswordService = async (
  token: string,
  newPassword: string,
  confirmPassword: string
) => {
  const { data } = await authApiDisriego.resetPassword({ token, newPassword, confirmPassword });
  return data;
}

/**
 * Obtiene los roles del proyecto
 */
export const getRolesService = async () => {
  const response = await authApiDisriego.getRoles();
  const roles = response.data.data;
  return roles;
}
export const getTypeDocumentsService = async () => {
  const response = await authApiDisriego.getTypeDocuments();
  const typeDocuments = response.data.data;
  return typeDocuments;
}
/**
 * Solicita autenticación de un servicio externo para endpoints protegidos.
 * @param {Object} data - Información de autenticación del servicio.
 * @param {string} data.client_id - Identificador único del cliente.
 * @param {string} data.client_secret - Secreto del cliente para autenticación.
 * @returns {Promise<any>} Resultado de la operación de autenticación del servicio.
 */
export const serviceTokenService = async (
  clientId: string,
  clientSecret: string,
  email: string
) => {
  const { data } = await authApiDisriego.serviceToken({ client_id: clientId, client_secret: clientSecret, email });
  return data;

}

 /**
     * Como administrador crea un usuario en el sistema.
     * @param {ExternalUser} data - Información de autenticación del servicio.
     * @returns {Promise<any>} Resultado de la operación de autenticación del servicio.
     */
export const createUserByAdminService = async (user: ExternalUser) => {
  const {data} = await  authApiDisriego.createUserByAdmin(user);
  return data;
}

 /**
     * Activar una cuenta de usuario.
     * @param {string} token - Información de autenticación del servicio.
     * @returns {Promise<any>} Resultado de la operación de autenticación del servicio.
     */
export const accountActivationService = async (token:string) => {
  const {data} = await  authApiDisriego.accountActivation(token);
  return data;
}

