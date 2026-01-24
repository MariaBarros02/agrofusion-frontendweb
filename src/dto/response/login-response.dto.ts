import type { ExternalProject } from "../shared/external-project.dto";


/**
 * Respuesta del servidor tras un intento de login o verificación MFA.
 */
export interface LoginResponse {
    /** JWT para autenticar peticiones subsecuentes */
    access_token?: string;
    /** Tipo de esquema de autenticación (comúnmente 'Bearer') */
    token_type?: string;
    /** Token utilizado para renovar el access_token cuando este expire */
    refresh_token?: string;
    /** Tiempo de vida del token en segundos o string de fecha */
    expires_in?: number | string;
    /** * Indica si el usuario debe pasar por una verificación adicional.
     * Si es `true`, el frontend debe mostrar el formulario MFA.
     */
    mfa_required?: boolean;
    /** Propósito del código OTP enviado (ej: 'login', 'reset_password') */
    otp_purpose?: string;
    /** Lista de proyectos externos a los que el usuario tiene acceso vía SSO */
    external_projects?: ExternalProject[];
}

