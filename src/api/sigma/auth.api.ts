import { authAxios } from "./axios";

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
    reqResetPassword: (data: { email: string }) => authAxios.post("/users/auth/request-reset-password", data),
    /**
     * Completa el cambio de contraseña utilizando el token de verificación recibido.
     * @param {Object} data - Información necesaria para el cambio.
     * @param {string} data.token - Identificador único de recuperación.
     * @param {string} data.newPassword - Nueva contraseña a establecer.
     * @param {string} data.confirmPassword - Confirmación de la nueva contraseña.
     * @returns {Promise<any>} Promesa con el estado de la actualización.
     */
    resetPassword: (data: { token: string; newPassword: string, confirmPassword: string }) => authAxios.post(`/users/auth/reset-password/${data.token}`, {new_password: data.newPassword, confirm_password: data.confirmPassword,}),   
}
