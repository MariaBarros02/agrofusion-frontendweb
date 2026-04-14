import type { AccountActivateRequest } from "../../../dto/request/accountActivate-request.dto";
import type { ChangePasswordRequest } from "../../../dto/request/changePassword-request.dto";
import type { createUserRequest } from "../../../dto/request/createUser-request.dto";
import type { EditUserRequest, EditProfileRequest, ChangeUserStatusRequest } from "../../../dto/request/editUser-request.dto";
import type { EditPermissionRequest } from "../../../dto/request/editPermission-request.dto";
import type { listPermissionsRequest } from "../../../dto/request/listPermissions-request.dto";
import type { listUsersRequest } from "../../../dto/request/listUsers-request.dto";
import type { LoginDto, MfaDto } from "../../../dto/request/login-request.dto";
import type { ListPermissionsResponse, PaginatedPermissionsResponse, PermissionBasicResponse } from "../../../dto/response/listPermissions-response.dto";
import type { ListUserResponse, PaginatedUsersResponse } from "../../../dto/response/listUsers-response.dto";
import type { LoginResponse } from "../../../dto/response/login-response.dto";
import type { SsoResponse } from "../../../dto/response/sso-response.dto";
import type { ExternalProject } from "../../../dto/shared/external-project.dto";
import type { ExternalProjectRolesResponse } from "../../../dto/response/externalProjectRoles-response.dto";
import type { ExternalProjectTypeDocsResponse } from "../../../dto/response/externalProjectTypeDocs-response.dto";
import type { ExternalProjectUsersResponse } from "../../../dto/response/externalProjectUsers-response.dto";
import type { PaginatedProjectsResponse } from "../../../dto/response/projectList-response.dto";
import type { ModuleListResponse, PaginatedModulesResponse } from "../../../dto/response/moduleList-response.dto";
import type { PaginatedSubmodulesResponse, SubmoduleListResponse } from "../../../dto/response/submoduleList-response.dto";
import type { User } from "../../../dto/shared/users.dto";
import { authAgrofusionAxios } from "./axios";
import type { listRolesRequest } from "../../../dto/request/listRoles-request.dto";
import type { ListRolesResponse, PaginatedRolesResponse } from "../../../dto/response/listRoles-response.dto";
import type { EditRoleRequest } from "../../../dto/request/editRole-request.dto";
import type { CreateRoleRequest } from "../../../dto/request/createRole-request-dto";
import type { ListBasicRole } from "../../../dto/response/listBasicRoles-response.dto";
import type { ExternalProjectDetailResponse } from "../../../dto/response/externalProjectDetail-response.dto";
import type { ProjectAccountingEndpointsRequest } from "../../../dto/request/projectAccountingEndpoints-request.dto";
import type { CreateProjectAccountingInfoEndpointRequest } from "../../../dto/request/createProjectAccountingInfoEndpoint-request.dto";
import type { AccountingEndpointDetailResponse, PaginatedProjectAccountingEndpointsResponse } from "../../../dto/response/projectAccountingEndpoints-response.dto";
import type { ExternalRequestTemplateResponse } from "../../../dto/response/externalRequestTemplate-response.dto";

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
   * Obtiene los roles disponibles de todos los proyectos externos activos.
   * El backend orquesta las llamadas a SIGMA, DISRIEGO, etc. en paralelo.
   */
  getExternalProjectRoles: () =>
    authAgrofusionAxios.get<ExternalProjectRolesResponse>("/external-projects/roles"),

  /**
   * Obtiene los tipos de documento de todos los proyectos externos activos.
   */
  getExternalProjectTypeDocs: () =>
    authAgrofusionAxios.get<ExternalProjectTypeDocsResponse>("/external-projects/type-documents"),

  /**
   * Obtiene los datos del usuario en todos los proyectos externos activos.
   * @param email - Email del usuario a consultar
   */
  getExternalProjectUsers: (email: string) =>
    authAgrofusionAxios.get<ExternalProjectUsersResponse>(`/external-projects/users/${email}`),

  /**
   * Obtiene el listado paginado de proyectos externos (RF-GES-01).
   * Parámetros: page_index, page_size, search?, state?
   */
  getExternalProjectsList: (params?: {
    page_index?: number;
    page_size?: number;
    search?: string;
    state?: string;
  }) =>
    authAgrofusionAxios.get<PaginatedProjectsResponse>("/external-projects/list", { params: params ?? {} }),

  /**
   * Actualiza el estado de un proyecto externo (ACTIVE/INACTIVE).
   */
  updateProjectStatus: (projectId: string, status: string) =>
    authAgrofusionAxios.patch<{ message: string; status: string }>(
      `/external-projects/${projectId}/status`,
      { status }
    ),

  /**
   * Crea un proyecto externo con sus módulos y endpoints.
   */
  createProject: (data: import("../../../dto/request/createProject-request.dto").CreateProjectRequest) =>
    authAgrofusionAxios.post<{ external_project_id: string; instance_code: string; project_name: string; message: string }>(
      "/external-projects/setup",
      data
    ),

  /**
   * Obtiene los datos de un proyecto en formato de formulario (para pre-poblar el edit).
   */
  getProjectFormData: (projectId: string) =>
    authAgrofusionAxios.get<import("../../../dto/request/createProject-request.dto").CreateProjectRequest>(
      `/external-projects/${projectId}/form-data`
    ),

  /**
   * Actualiza un proyecto externo existente.
   */
  updateProject: (projectId: string, data: import("../../../dto/request/createProject-request.dto").CreateProjectRequest) =>
    authAgrofusionAxios.put<{ external_project_id: string; instance_code: string; project_name: string; message: string }>(
      `/external-projects/${projectId}/setup`,
      data
    ),

  /**
   * Obtiene el listado paginado de módulos.
   * Parámetros: page_index, page_size, search?, state?, project_id?
   */
  getModulesList: (params?: {
    page_index?: number;
    page_size?: number;
    search?: string;
    state?: string;
    project_id?: string;
  }) =>
    authAgrofusionAxios.get<PaginatedModulesResponse>("/modules/list", { params: params ?? {} }),

  /** Opciones de proyectos para el filtro del listado de módulos */
  getModuleProjectOptions: () =>
    authAgrofusionAxios.get<{ af_project_id: string; project_code: string | null; project_name: string | null }[]>("/modules/project-options"),

  /**
   * Actualiza el estado de un módulo (ACTIVE/INACTIVE).
   */
  updateModuleStatus: (moduleId: string, status: string) =>
    authAgrofusionAxios.patch<{ message: string; status: string }>(
      `/modules/${moduleId}/status`,
      { status }
    ),

  /**
   * Obtiene el listado paginado de submódulos.
   * Parámetros: page_index, page_size, search?, state?, module_id?
   */
  getSubmodulesList: (params?: {
    page_index?: number;
    page_size?: number;
    search?: string;
    state?: string;
    module_id?: string;
  }) =>
    authAgrofusionAxios.get<PaginatedSubmodulesResponse>("/submodules/list", { params: params ?? {} }),

  /** Opciones de módulos para el filtro del listado de submódulos */
  getSubmoduleModuleOptions: () =>
    authAgrofusionAxios.get<{ module_id: string; module_code: string | null; module_name: string | null }[]>("/submodules/module-options"),

  /**
   * Actualiza el estado de un submódulo (ACTIVE/INACTIVE).
   */
  updateSubmoduleStatus: (submoduleId: string, status: string) =>
    authAgrofusionAxios.patch<{ message: string; status: string }>(
      `/submodules/${submoduleId}/status`,
      { status }
    ),
  /**
   * Obtiene módulos activos y rol del usuario (para control de acceso a rutas).
   */
  getActiveModules: () =>
    authAgrofusionAxios.get<{
      active_modules: string[];
      role_code: string | null;
    }>("auth/active-modules"),

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
   * Obtiene los códigos de submódulos activos y el código del rol del usuario.
   * Usado para restringir contenido por submódulo inactivo (SUPERADMINISTRADOR tiene acceso a todos).
   */
  getActiveSubmodules: () =>
    authAgrofusionAxios.get<{ active_submodules: string[]; role_code: string | null }>("auth/active-submodules"),
  /**
   * Solicita el envío de un correo para restablecer la contraseña.
   * @param {Object} data - Payload de recuperación.
   * @param {string} data.email - Correo electrónico del usuario.
   * @param {ResetTokenMap} data.tokens - Mapeo de tokens requeridos por el servicio.
   */
  reqResetPassword: (data: { email: string }) =>
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
   * Actualizar perfil propio del usuario autenticado.
   * El backend orquesta la actualización en proyectos externos si hay `external_data`.
   * @param user_id - ID del usuario
   * @param payload - Datos a actualizar
   */
  editProfile: (user_id: string, payload: EditProfileRequest) =>
    authAgrofusionAxios.put("users/profile", payload, { params: { user_id } }),

  /**
   * Actualizar usuario por admin.
   * El backend orquesta UPDATE_USER en proyectos externos usando `external_data`.
   * @param user_id - ID del usuario a actualizar
   * @param payload - Datos a actualizar incluyendo external_data
   */
  editUser: (user_id: string, payload: EditUserRequest) =>
    authAgrofusionAxios.put("users/admin/update-user", payload, { params: { user_id } }),

  /**
   * Cambiar estado activo/inactivo de un usuario.
   * El backend orquesta CHANGE_USER_STATUS en proyectos externos.
   */
  changeUserStatus: (payload: ChangeUserStatusRequest) =>
    authAgrofusionAxios.patch("users/change-status", payload),
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

  
  /**
 * Cambia el estado de la doble
  * @returns any Respuesta de lista basica de errores.
 */
  changeF2AUser: (user_id: string, mfa_active: boolean) =>
    authAgrofusionAxios.post("users/change-fa2-user", null, {params: {user_id, mfa_active} }),

  /**
   * Obtiene el detalle completo de un proyecto externo con URLs y endpoints.
   * @param projectId - UUID del proyecto externo
   */
  getProjectDetail: (projectId: string) =>
    authAgrofusionAxios.get<ExternalProjectDetailResponse>(`/external-projects/${projectId}`),

  /**
   * Obtiene el listado paginado de endpoints contables para un proyecto externo.
   */
  getProjectAccountingEndpoints: (
    projectId: string,
    params?: ProjectAccountingEndpointsRequest,
  ) =>
    authAgrofusionAxios.get<PaginatedProjectAccountingEndpointsResponse>(
      `/external-projects/${projectId}/accounting-endpoints`,
      { params: params ?? {} },
    ),

  getExternalRequestTemplates: () =>
    authAgrofusionAxios.get<ExternalRequestTemplateResponse[]>(
      "/external-projects/request-templates",
    ),

  createProjectAccountingEndpoint: (
    projectId: string,
    payload: CreateProjectAccountingInfoEndpointRequest,
  ) =>
    authAgrofusionAxios.post<{ external_endpoint_id: string; message: string }>(
      `/external-projects/${projectId}/accounting-endpoints`,
      payload,
    ),

  getProjectAccountingEndpointDetail: (projectId: string, endpointId: string) =>
    authAgrofusionAxios.get<AccountingEndpointDetailResponse>(
      `/external-projects/${projectId}/accounting-endpoints/${endpointId}`,
    ),

  updateProjectAccountingEndpoint: (
    projectId: string,
    endpointId: string,
    payload: CreateProjectAccountingInfoEndpointRequest,
  ) =>
    authAgrofusionAxios.put<{ external_endpoint_id: string; message: string }>(
      `/external-projects/${projectId}/accounting-endpoints/${endpointId}`,
      payload,
    ),

  deleteProjectAccountingEndpoint: (projectId: string, endpointId: string) =>
    authAgrofusionAxios.delete<{ message: string }>(
      `/external-projects/${projectId}/accounting-endpoints/${endpointId}`,
    ),

  validateAccountingTransferConnection: () =>
    authAgrofusionAxios.get<{ exists: boolean; message: string }>(
      "/external-projects/accounting-transfer-connection",
    ),

};

