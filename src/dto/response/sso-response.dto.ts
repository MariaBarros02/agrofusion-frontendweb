/**
 * Respuesta obtenida al solicitar acceso a un proyecto externo.
 */
export interface SsoResponse {
    /** Token de un solo uso o sesión específica para el intercambio de SSO */
    sso_token: string;
}