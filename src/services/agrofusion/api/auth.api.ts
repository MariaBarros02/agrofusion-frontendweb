import type { AccountActivateRequest } from "../../../dto/request/accountActivate-request.dto";
import type { ChangePasswordRequest } from "../../../dto/request/changePassword-request.dto";
import type { createUserRequest } from "../../../dto/request/createUser-request.dto";
import type { EditPermissionRequest } from "../../../dto/request/editPermission-request.dto";
import type { listPermissionsRequest } from "../../../dto/request/listPermissions-request.dto";
import type { listUsersRequest } from "../../../dto/request/listUsers-request.dto";
import type { LoginDto, MfaDto } from "../../../dto/request/login-request.dto";
import type { ListPermissionsResponse, PaginatedPermissionsResponse, PermissionBasicResponse } from "../../../dto/response/listPermissions-response.dto";
import type { ListUserResponse, PaginatedUsersResponse } from "../../../dto/response/listUsers-response.dto";
import type { LoginResponse } from "../../../dto/response/login-response.dto";
import type { SsoResponse } from "../../../dto/response/sso-response.dto";
import type { ExternalProject } from "../../../dto/shared/external-project.dto";
import type { ProjectListResponse } from "../../../dto/response/projectList-response.dto";
import type { User } from "../../../dto/shared/users.dto";
import type { ResetTokenMap } from "../../orchestrator/authOrchestrator.service";
import { authAgrofusionAxios } from "./axios";
import type { listRolesRequest } from "../../../dto/request/listRoles-request.dto";
import type { ListRolesResponse, PaginatedRolesResponse } from "../../../dto/response/listRoles-response.dto";
import type { EditRoleRequest } from "../../../dto/request/editRole-request.dto";
import type { CreateRoleRequest } from "../../../dto/request/createRole-request-dto";
import type { ListBasicRole } from "../../../dto/response/listBasicRoles-response.dto";

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
   * Obtiene el listado de todos los proyectos externos (RF-GES-01).
   * Atributos: identificador, nombre, cliente, descripción, estado, fecha de creación.
   */
  getExternalProjectsList: () =>
    authAgrofusionAxios.get<ProjectListResponse[]>("/external-projects/list"),

  /**
   * Actualiza el estado de un proyecto externo (ACTIVE/INACTIVE).
   */
  updateProjectStatus: (projectId: string, status: string) =>
    authAgrofusionAxios.patch<{ message: string; status: string }>(
      `/external-projects/${projectId}/status`,
      { status }
    ),
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
 * Listar usuario del sistema por su id.
 * @param {string} user_id - id del usuario por buscar
 * @returns {ListUserResponse} Respuesta con datos de usuarios y paginación.
 */
  getProfile: (user_id:string) =>
    authAgrofusionAxios.get<ListUserResponse>("users/get-profile", {params: {user_id}}),



  /**
 * Eliminar (soft delete) de usuario en el sistema.
 * @param {string} user_id - id del usuario por buscar
 * @returns {Promise} Respuesta de borrado exitoso
 */
  deleteSoftUser: (user_id:string) =>
    authAgrofusionAxios.delete("users/delete-user", {params: { user_id: user_id} }),


/**
 * Actualizar mi perfil de usuario
 *  @param {string} user_id - id del usuario por buscar
 * @param {string} name - nombre para actualizar el registro
 * @param {string} identity_number - Número de identificación para actualizar el registro
 * @returns {Promise} Actualización exitosa
 */
  editProfile: (user_id:string, name: string, identity_number: string) =>
    authAgrofusionAxios.put("users/edit-profile", {name, identity_number}, {params: { user_id: user_id} }),


  /**
 * Actualizar mi perfil de usuario
 *  @param {string} user_id - id del usuario por buscar
 * @param {string} name - nombre para actualizar el registro
 * @param {string} identity_number - Número de identificación para actualizar el registro
 * @returns {Promise} Actualización exitosa
 */
  editUser: (user_id:string, name: string, identity_number: string, state: string, rol? : string) =>
    authAgrofusionAxios.put("users/edit-user", {name, identity_number, state, rol}, {params: { user_id: user_id} }),
/**
 * Cambiar mi contraseña desde mi perfil de usuario
 * @param {string} user_id - id del usuario por buscar
 * @param {ChangePasswordRequest} payload - payload para cambiar contraseña de usuario
 * @returns {Promise} Actualización exitosa
 */
  changePassword: (user_id:string, payload:ChangePasswordRequest) =>
    authAgrofusionAxios.put("users/change-password", payload, {params: { user_id: user_id} }),

  /**
 * Solicita la lista de permisos
 * @param {listPermissionsRequest} payload - payload para listar permisos
  * @returns {PaginatedPermissionsResponse} Respuesta con datos de pemisos y paginación.
 */
  listPemissions: (payload:listPermissionsRequest) =>
    authAgrofusionAxios.get<PaginatedPermissionsResponse>("permissions?", {params: payload}),

  /**
 * Solicita los detalles de un permiso
 * @param {string} permId - Id del permiso
  * @returns {ListPermissionsResponse} Respuesta con datos de pemisos y paginación.
 */
  getPemission: (perm_id: string) =>
    authAgrofusionAxios.get<ListPermissionsResponse>("permissions/get-permission", {params: {perm_id}}),

    /**
 * Actualiza los detalles de un permiso
 * @param {string} permId - Id del permiso
 * @param {EditPermissionRequest} payload - Atributos para actualizar
  * @returns {any} Respuesta con datos de pemisos y paginación.
 */
  editPemission: (perm_id: string, payload:EditPermissionRequest) =>
    authAgrofusionAxios.put("permissions/edit-permission", payload, {params: {perm_id}}),

  /**
 * Solicita la lista de roles
 * @param {listRolesRequest} payload - payload para listar roles
  * @returns {PaginatedRolesResponse} Respuesta con datos de roles y paginación.
 */
  listRoles: (payload:listRolesRequest) =>
    authAgrofusionAxios.get<PaginatedRolesResponse>("roles?", {params: payload}),

  /**
 * Solicita la lista de permisos
  * @returns {PermissionBasicResponse[]} Respuesta con datos de pemisos 
 */
  listPemissionsBasic: () =>
    authAgrofusionAxios.get<PermissionBasicResponse[]>("permissions/list-basic-permissions"),
  /**
 * Eliminar un rol
 * @param {string} roleId - payload para listar roles
  * @returns {any} Respuesta.
 */
  deleteRole: (role_id:string) =>
    authAgrofusionAxios.delete("roles/delete-role", {params: {role_id}}),

  /**
 * Solicita los detalles de un role
 * @param {string} roleId - Id del role
  * @returns {ListRolesResponse} Respuesta con datos de roles.
 */
  getRole: (role_id: string) =>
    authAgrofusionAxios.get<ListRolesResponse>("roles/get-role", {params: {role_id}}),


  /**
 * Actualiza los detalles de un rol
 * @param {string} roleId - Id del rol
 * @param {EditRoleRequest} payload - Atributos para actualizar
  * @returns {any} Respuesta con datos de rol.
 */
  editRole: (role_id: string, payload:EditRoleRequest) =>
    authAgrofusionAxios.put("roles/edit-role", payload, {params: {role_id}}),

  /**
 * Crear un rol
 * @param {CreateRoleRequest} payload - Atributos para crear un rol
  * @returns {any} Respuesta del operación de crear rol.
 */
  createRole: (payload:CreateRoleRequest) =>
    authAgrofusionAxios.post("roles/create-role", payload),

  /**
 * Lista basica de erroes
  * @returns {ListBasicRole[]} Respuesta de lista basica de errores.
 */
  getBasicListRoles: () =>
    authAgrofusionAxios.get<ListBasicRole[]>("roles/get-list-basic-roles"),
};

