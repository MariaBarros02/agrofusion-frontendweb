import type { LoginDto, MfaDto } from "../../dto/request/login-request.dto";
import type { LoginResponse } from "../../dto/response/login-response.dto";
import type { SsoResponse } from "../../dto/response/sso-response.dto";
import type { ExternalProject } from "../../dto/shared/external-project.dto";
import type { ResetTokenMap } from "../../services/auth/authOrchestrator.service";
import { authAgrofusionAxios } from "./axios";

/**
 * Servicio encargado de las operaciones de autenticación y gestión de usuarios.
 */
export const authApi = {
    /**
     * Obtiene la lista de proyectos externos vinculados.
     * @returns {Promise<ExternalProject[]>} Lista de proyectos.
     */
    getExternalProjects: () => authAgrofusionAxios.get<ExternalProject[]>("auth/external-projects"),
    /**
     * Realiza el inicio de sesión primario del usuario.
     * @param {LoginDto} data - Credenciales del usuario (email y password).
     * @returns {Promise<LoginResponse>} Respuesta con datos de sesión o estado de MFA.
     */
    login: (data: LoginDto) => authAgrofusionAxios.post<LoginResponse>("auth/login", data),
    /**
     * Finaliza la sesión actual del usuario.
     */
    logout: () => authAgrofusionAxios.post('auth/logout'),
    /**
     * Obtiene un token SSO para un proyecto específico.
     * @param {Object} data - Datos del proyecto.
     * @param {string} data.project_code - Código identificador del proyecto destino.
     * @returns {Promise<SsoResponse>} Token de acceso para el proyecto externo.
     */
    ssoLogin: (data: {project_code: string}) => authAgrofusionAxios.post<SsoResponse>("auth/sso-token", data),
    /**
     * Verifica el código de autenticación de doble factor (OTP).
     * @param {MfaDto} data - Código OTP y datos de sesión previa.
     * @returns {Promise<LoginResponse>} Sesión autenticada.
     */
    verifyMfa: (data: MfaDto) => authAgrofusionAxios.post<LoginResponse>("auth/verify-otp", data),
    /**
     * Solicita el envío de un correo para restablecer la contraseña.
     * @param {Object} data - Payload de recuperación.
     * @param {string} data.email - Correo electrónico del usuario.
     * @param {ResetTokenMap} data.tokens - Mapeo de tokens requeridos por el servicio.
     */
    reqResetPassword: (data: { email: string, tokens: ResetTokenMap }) => authAgrofusionAxios.post("auth/request-reset-password", data),
    /**
     * Establece una nueva contraseña utilizando un token de validación.
     * @param {Object} data - Datos de actualización.
     * @param {string} data.token - Token recibido por correo.
     * @param {string} data.newPassword - Nueva contraseña.
     * @param {string} data.confirmPassword - Confirmación de la contraseña.
     */
    resetPassword: (data: { token: string; newPassword: string, confirmPassword: string }) => authAgrofusionAxios.post(`auth/reset-password/${data.token}`, {new_password: data.newPassword, confirm_password: data.confirmPassword,}),
    /**
     * Registra errores específicos ocurridos en proyectos externos.
     * @param {Object} data - Detalle del error.
     * @param {string} data.project - Nombre del proyecto origen.
     * @param {string} data.detail - Descripción técnica del error.
     */
    logErrorPE: (data: { project: string,  detail: string }) => authAgrofusionAxios.post('auth/log-error-EP', data)
}
