import type { AccountActivateRequest } from "../../../dto/request/accountActivate-request.dto";
import type { createUserRequest } from "../../../dto/request/createUser-request.dto";
import type { listUsersRequest } from "../../../dto/request/listUsers-request.dto";
import type { LoginDto, MfaDto } from "../../../dto/request/login-request.dto";
import type { ListUserResponse, PaginatedUsersResponse } from "../../../dto/response/listUsers-response.dto";
import type { LoginResponse } from "../../../dto/response/login-response.dto";
import type { SsoResponse } from "../../../dto/response/sso-response.dto";
import type { ExternalProject } from "../../../dto/shared/external-project.dto";
import type { User } from "../../../dto/shared/users.dto";
import type { ResetTokenMap } from "../../orchestrator/authOrchestrator.service";
import { authAgrofusionAxios } from "./axios";

/**
 * Servicio encargado de las operaciones de autenticación y gestión de usuarios.
 */
export const authApi = {
  /**
   * Obtiene la lista de proyectos externos vinculados.
   * @returns {Promise<ExternalProject[]>} Lista de proyectos.
   */
  getExternalProjects: () =>
    authAgrofusionAxios.get<ExternalProject[]>("/external-projects"),
  /**
   * Realiza el inicio de sesión primario del usuario.
   * @param {LoginDto} data - Credenciales del usuario (email y password).
   * @returns {Promise<LoginResponse>} Respuesta con datos de sesión o estado de MFA.
   */
  login: (data: LoginDto) =>
    authAgrofusionAxios.post<LoginResponse>("auth/login", data),
  /**
   * Finaliza la sesión actual del usuario.
   */
  logout: () => authAgrofusionAxios.post("auth/logout"),
  /**
   * Obtiene un token SSO para un proyecto específico.
   * @param {Object} data - Datos del proyecto.
   * @param {string} data.project_code - Código identificador del proyecto destino.
   * @returns {Promise<SsoResponse>} Token de acceso para el proyecto externo.
   */
  ssoLogin: (data: { project_code: string }) =>
    authAgrofusionAxios.post<SsoResponse>("auth/sso-token", data),
  /**
   * Verifica el código de autenticación de doble factor (OTP).
   * @param {MfaDto} data - Código OTP y datos de sesión previa.
   * @returns {Promise<LoginResponse>} Sesión autenticada.
   */
  verifyMfa: (data: MfaDto) =>
    authAgrofusionAxios.post<LoginResponse>("auth/verify-otp", data),
  /**
   * Solicita el envío de un correo para restablecer la contraseña.
   * @param {Object} data - Payload de recuperación.
   * @param {string} data.email - Correo electrónico del usuario.
   * @param {ResetTokenMap} data.tokens - Mapeo de tokens requeridos por el servicio.
   */
  reqResetPassword: (data: { email: string; tokens: ResetTokenMap }) =>
    authAgrofusionAxios.post("auth/request-reset-password", data),
  /**
   * Establece una nueva contraseña utilizando un token de validación.
   * @param {Object} data - Datos de actualización.
   * @param {string} data.token - Token recibido por correo.
   * @param {string} data.newPassword - Nueva contraseña.
   * @param {string} data.confirmPassword - Confirmación de la contraseña.
   */
  resetPassword: (data: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }) =>
    authAgrofusionAxios.post(`auth/reset-password/${data.token}`, {
      new_password: data.newPassword,
      confirm_password: data.confirmPassword,
    }),
  /**
   * Registra errores específicos ocurridos en proyectos externos.
   * @param {Object} data - Detalle del error.
   * @param {string} data.project - Nombre del proyecto origen.
   * @param {string} data.detail - Descripción técnica del error.
   */
  logErrorPE: (data: { project: string; detail: string }) =>
    authAgrofusionAxios.post("auth/log-error-EP", data),

  /**
   * Consulta si existe un usuario por su correo o numero de identificación.
   * @param {string} email - Email del usuario
   * @param {string} numIdent - Número de identidad del usuario
   * @returns {User} Respuesta con datos de sesión o estado de MFA.
   */
  userExists: (data: { email: string; numDoc: string }) =>
    authAgrofusionAxios.post<User>("users/user-exists", null, {
      params: data,
    }),
  /**
   * Crear usuarios.
   * @param {createUserRequest} user - Datos del usuario a crear
   * @returns {User} Respuesta con datos de sesión o estado.
   */
  createUser: (data: createUserRequest) =>
    authAgrofusionAxios.post<User>("users/admin/create-user", data),

  /**
   * Activar usuario y cambiar constraseña temporal.
   * @param {AccountActivateRequest} payload - Token y contraseña nueva
   * @returns {any} Respuesta con datos de sesión o estado.
   */
  accountActivation: (data: AccountActivateRequest) =>
    authAgrofusionAxios.post("users/account-activation", data),

  /**
 * Listar usuarios del sistema.
 * @param {ListUsersRequest} data - Información de busqueda y paginación
 * @returns {PaginatedListUsers} Respuesta con datos de usuarios y paginación.
 */
  listUsers: (data: listUsersRequest) =>
    authAgrofusionAxios.get<PaginatedUsersResponse>("users/list-users?", {params: data}),

  /**
 * Listar usuario del sistema por su id.
 * @param {string} user_id - id del usuario por buscar
 * @returns {ListUserResponse} Respuesta con datos de usuarios y paginación.
 */
  getDetailsUser: (user_id:string) =>
    authAgrofusionAxios.get<ListUserResponse>("users/get-user-details", {params: {user_id}}),

  /**
 * Eliminar (soft delete) de usuario en el sistema.
 * @param {string} user_id - id del usuario por buscar
 * @returns {Promise} Respuesta de borrado exitoso
 */
  deleteSoftUser: (user_id:string) =>
    authAgrofusionAxios.delete("users/delete-user", {params: { user_id: user_id} }),
};
