/**
 * Payload requerido para activar una cuenta de usuario.
 * 
 * Este objeto se envía al backend cuando el usuario desea activar su cuenta
 * mediante un token de activación previamente generado (por ejemplo, enviado por email).
 * 
 * También permite establecer una nueva contraseña validando la contraseña actual.
 * 
 * @interface AccountActivateRequest
 */
export interface AccountActivateRequest {

    /**
     * Token de activación de cuenta.
     * 
     * Generalmente enviado al correo del usuario y usado para verificar
     * que la solicitud de activación es válida y no ha expirado.
     */
    token: string;

    /**
     * Contraseña actual del usuario.
     * 
     * Se utiliza como verificación de seguridad antes de permitir
     * el cambio de contraseña durante la activación.
     */
    old_password: string;

    /**
     * Nueva contraseña que el usuario desea establecer.
     * 
     * Debe cumplir con la política de seguridad definida por el sistema.
     */
    new_password: string;

    /**
     * Confirmación de la nueva contraseña.
     * 
     * Debe coincidir exactamente con `new_password`.
     */
    confirm_password: string;
}