import type { ExternalUser } from "../../../dto/request/externalUser-request.dto";
import { authAxios } from "./axios";
import { authPrivateAxios } from "./axiosPrivate";

/**
 * Servicio de API para la gestión de usuarios y seguridad en Sigma.
 * Se enfoca principalmente en la recuperación de cuentas y flujo de contraseñas.
 */
export const authApiSigma = {
  /**
   * Inicia el flujo de recuperación de contraseña solicitando un token vía email.
   * @param {Object} data - Datos de la solicitud.
   * @param {string} data.email - Correo electrónico del usuario que desea recuperar el acceso.
   * @returns {Promise<any>} Promesa con el resultado de la solicitud.
   */
  reqResetPassword: (data: { email: string }) =>
    authAxios.post("/users/auth/request-reset-password", data),
  /**
   * Completa el cambio de contraseña utilizando el token de verificación recibido.
   * @param {Object} data - Información necesaria para el cambio.
   * @param {string} data.token - Identificador único de recuperación.
   * @param {string} data.newPassword - Nueva contraseña a establecer.
   * @param {string} data.confirmPassword - Confirmación de la nueva contraseña.
   * @returns {Promise<any>} Promesa con el estado de la actualización.
   */
  resetPassword: (data: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }) =>
    authAxios.post(`/users/auth/reset-password/${data.token}`, {
      new_password: data.newPassword,
      confirm_password: data.confirmPassword,
    }),

  /**
   * Solicita los roles del sistema.
   * @returns {Promise<any>} Respuesta del servidor sobre los roles.
   */
  getRoles: () => authAxios.get("/users/roles/agrofusion"),

  /*  * Solicita los tipos de documentos del sistema.
   * @returns {Promise<any>} Respuesta del servidor sobre los tipos de documentos.
   */
  getTypeDocuments: () => authAxios.get("/users/users/type-documents"),
  /**
  /**
       * Solicita autenticación de un servicio externo para endpoints protegidos.
       * @param {Object} data - Información de autenticación del servicio.
       * @param {string} data.client_id - Identificador único del cliente.
       * @param {string} data.client_secret - Secreto del cliente para autenticación.
       * @returns {Promise<any>} Resultado de la operación de autenticación del servicio.
       */
  serviceToken: (data: {
    client_id: string;
    client_secret: string;
    email: string;
  }) => authAxios.post(`/users/auth/service-token`, data),
  /**
   * Como administrador crea un usuario en el sistema.
   * @param {ExternalUser} data - Información de autenticación del servicio.
   * @returns {Promise<any>} Resultado de la operación de autenticación del servicio.
   */
  createUserByAdmin: (data: ExternalUser) =>
    authPrivateAxios.post(`/users/users/admin/create-agrofusion`, data),

  /**
   * Como usuario activar mi cuenta
   * @param {string} activation_token- Token de activación de cuenta
   * @returns {Promise<any>} Resultado de la operación de autenticación del servicio.
   */
  accountActivation: (activation_token: string) =>
    authAxios.get(`users/users/activate-account/${activation_token}`),

    /**
   *  Buscar usuario por email
   * @param {string} email- Email del usuario que se quiere buscar
   * @returns {Promise<any>} Resultado de la operación de autenticación del servicio.
   */
    getUserByEmail: (email: string) =>
    authPrivateAxios.post(`users/users/get-user-by-email/${email}`),

    /**
   *  Cambiar el estado de un usuario
   * @param {number} user_id
   * @param {number} new_status
   * @returns {Promise<any>} Resultado de la operación de cambiar el estado del usuario.
   */
    changeUserStatus: (user_id: number, new_user: number) =>
    authPrivateAxios.post(`users/users/change-user-status/`,{user_id, new_user}),


};
