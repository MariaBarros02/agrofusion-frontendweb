import { authAxios } from "./axios";

/**
 * API Service para la gestión de autenticación de Disriego.
 * Proporciona métodos para el control de acceso y recuperación de cuentas.
 */
export const authApiDisriego = {
    /**
     * Solicita el restablecimiento de contraseña enviando un correo al usuario.
     * @param {Object} data - Datos de la solicitud.
     * @param {string} data.email - Correo electrónico de la cuenta a recuperar.
     * @returns {Promise<any>} Respuesta del servidor sobre el envío del correo.
     */
    reqResetPassword: (data: { email: string }) => authAxios.post("/base/auth/request-reset-password", data),
    /**
     * Establece una nueva contraseña de usuario mediante un token de validación.
     * @param {Object} data - Información de actualización de contraseña.
     * @param {string} data.token - Identificador único de recuperación enviado por email.
     * @param {string} data.newPassword - La nueva clave elegida por el usuario.
     * @param {string} data.confirmPassword - Confirmación de la nueva clave.
     * @returns {Promise<any>} Resultado de la operación de cambio de contraseña.
     */
    resetPassword: (data: { token: string; newPassword: string, confirmPassword: string }) => authAxios.post(`/base/auth/reset-password/${data.token}`, {new_password: data.newPassword, confirm_password: data.confirmPassword,}),
    /**
     * Solicita los roles del sistema.
     * @returns {Promise<any>} Respuesta del servidor sobre los roles.
     */
    getRoles: () => authAxios.get("/base/roles/"),
    
}
