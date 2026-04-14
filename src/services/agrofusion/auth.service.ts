/* eslint-disable @typescript-eslint/no-explicit-any */
import { authApi } from "./api/auth.api";
import { useModuleAccessStore } from "../../store/moduleAccess.store";
import { useSubmoduleAccessStore } from "../../store/submoduleAccess.store";
import type { createUserRequest } from "../../dto/request/createUser-request.dto";
import type { EditUserRequest, EditProfileRequest, ChangeUserStatusRequest } from "../../dto/request/editUser-request.dto";
import type { AccountActivateRequest } from "../../dto/request/accountActivate-request.dto";
import type { listUsersRequest } from "../../dto/request/listUsers-request.dto";
import type { ChangePasswordRequest } from "../../dto/request/changePassword-request.dto";
import type { listPermissionsRequest } from "../../dto/request/listPermissions-request.dto";
import type { EditPermissionRequest } from "../../dto/request/editPermission-request.dto";
import type { ModuleListResponse } from "../../dto/response/moduleList-response.dto";
import type { SubmoduleListResponse } from "../../dto/response/submoduleList-response.dto";
import type { listRolesRequest } from "../../dto/request/listRoles-request.dto";
import type { EditRoleRequest } from "../../dto/request/editRole-request.dto";
import type { CreateRoleRequest } from "../../dto/request/createRole-request-dto";
import type { CreateProjectRequest } from "../../dto/request/createProject-request.dto";
import type { ProjectAccountingEndpointsRequest } from "../../dto/request/projectAccountingEndpoints-request.dto";
import type { CreateProjectAccountingInfoEndpointRequest } from "../../dto/request/createProjectAccountingInfoEndpoint-request.dto";


/**
 * Obtiene módulos activos y rol del usuario y actualiza el store.
 * Debe llamarse cuando el usuario ya está autenticado (p. ej. al entrar a rutas protegidas).
 */
export const fetchActiveModulesService = async () => {
  const { data } = await authApi.getActiveModules();
  useModuleAccessStore.getState().setModuleAccess(
    data.active_modules ?? [],
    data.role_code ?? null
  );
};

/**
 * Obtiene la lista de proyectos externos vinculados al usuario actual.
 */
export const getExternalProjects = async () => {
  const { data } = await authApi.getExternalProjects();
  return data;
};

/**
 * Obtiene los roles disponibles de todos los proyectos externos activos.
 * El backend orquesta las llamadas en paralelo a SIGMA, DISRIEGO, etc.
 */
export const getExternalProjectRolesService = async () => {
  const { data } = await authApi.getExternalProjectRoles();
  return data;
};

/**
 * Obtiene los tipos de documento de todos los proyectos externos activos.
 */
export const getExternalProjectTypeDocsService = async () => {
  const { data } = await authApi.getExternalProjectTypeDocs();
  return data;
};

/**
 * Obtiene los datos del usuario en proyectos externos por email.
 * @param email - Email del usuario a consultar
 */
export const getExternalProjectUsersService = async (email: string) => {
  const { data } = await authApi.getExternalProjectUsers(email);
  return data;
};

/**
 * Obtiene el listado paginado de proyectos externos (RF-GES-01).
 * Parámetros: page_index, page_size, search?, state?
 */
export const listProjectsService = async (params?: {
  page_index?: number;
  page_size?: number;
  search?: string;
  state?: string;
}) => {
  const { data } = await authApi.getExternalProjectsList(params);
  return data;
};

/**
 * Actualiza el estado de un proyecto externo (ACTIVE/INACTIVE).
 */
export const updateProjectStatusService = async (
  projectId: string,
  status: string
) => {
  const { data } = await authApi.updateProjectStatus(projectId, status);
  return data;
};

/**
 * Crea un nuevo proyecto externo con sus módulos y endpoints.
 */
export const createProjectService = async (payload: CreateProjectRequest) => {
  const { data } = await authApi.createProject(payload);
  return data;
};

/**
 * Obtiene los datos de un proyecto en formato de formulario (para el edit).
 */
export const getProjectFormDataService = async (projectId: string) => {
  const { data } = await authApi.getProjectFormData(projectId);
  return data;
};

/**
 * Actualiza un proyecto externo existente.
 */
export const updateProjectService = async (projectId: string, payload: CreateProjectRequest) => {
  const { data } = await authApi.updateProject(projectId, payload);
  return data;
};

/**
 * Obtiene el listado paginado de módulos.
 */
export const listModulesService = async (params?: {
  page_index?: number;
  page_size?: number;
  search?: string;
  state?: string;
  project_id?: string;
}) => {
  const { data } = await authApi.getModulesList(params);
  return data;
};

export const getModuleProjectOptionsService = async () => {
  const { data } = await authApi.getModuleProjectOptions();
  return data;
};

/**
 * Actualiza el estado de un módulo (ACTIVE/INACTIVE).
 */
export const updateModuleStatusService = async (
  moduleId: string,
  status: string
) => {
  const { data } = await authApi.updateModuleStatus(moduleId, status);
  return data;
};

/**
 * Obtiene el listado paginado de submódulos.
 */
export const listSubmodulesService = async (params?: {
  page_index?: number;
  page_size?: number;
  search?: string;
  state?: string;
  module_id?: string;
}) => {
  const { data } = await authApi.getSubmodulesList(params);
  return data;
};

export const getSubmoduleModuleOptionsService = async () => {
  const { data } = await authApi.getSubmoduleModuleOptions();
  return data;
};

/**
 * Actualiza el estado de un submódulo (ACTIVE/INACTIVE).
 */
export const updateSubmoduleStatusService = async (
  submoduleId: string,
  status: string
) => {
  const { data } = await authApi.updateSubmoduleStatus(submoduleId, status);
  return data;
};

/**
 * Obtiene los submódulos activos y actualiza el store de acceso por submódulo.
 * Debe llamarse cuando el usuario ya está autenticado (p. ej. en ProtectedRoute o layout).
 */
export const fetchActiveSubmodulesService = async () => {
  const { data } = await authApi.getActiveSubmodules();
  useSubmoduleAccessStore.getState().setActiveSubmodules({
    active_submodules: data.active_submodules ?? [],
    role_code: data.role_code ?? null,
  });
};

/**
 * Inicia el proceso de autenticación estándar.
 * @param email Correo electrónico del usuario.
 * @param password Contraseña.
 * @returns Datos del usuario o respuesta de desafío MFA si está activo.
 */
export const loginService = async (
  email: string,
  password: string
) => {
  const { data } = await authApi.login({ email, password });
  return data;
};

/**
 * Genera una sesión mediante Single Sign-On (SSO) para un proyecto específico.
 * @param project_code Identificador del proyecto destino.
 */
export const ssoLoginService = async (
  project_code: string
) => {
  const { data } = await authApi.ssoLogin({project_code});
  return data;
};
/**
 * Finaliza la sesión del usuario en el servidor.
 */
export const logoutService = async () => {
  const {data} = await authApi.logout();
  return data;

}

/**
 * Verifica el código de un solo uso (OTP) enviado al usuario.
 * @param email Correo del usuario intentando acceder.
 * @param otp_code Código de 6 dígitos.
 */
export const verifyMfaService = async (
  email: string,
  otp_code: string
) => {
  const { data } = await authApi.verifyMfa({ email, otp_code });
  return data;
}
/**
 * Solicita el enlace de recuperación de contraseña.
 * Envía el mapa de tokens recolectados de otros servicios para sincronizar el proceso.
 * @param email Correo del solicitante.
 * @param tokens Mapa de tokens de proyectos externos (ResetTokenMap).
 */
export const reqResetPasswordService = async (
  email: string
) => {
  const { data } = await authApi.reqResetPassword({ email});
  return data;
}
/**
 * Establece la nueva contraseña utilizando el token de validación.
 * @param token Token recibido por correo.
 * @param newPassword Nueva contraseña elegida.
 * @param confirmPassword Confirmación de la contraseña.
 */
export const resetPasswordService = async (
  token: string,
  newPassword: string,
  confirmPassword: string
) => {
  const { data } = await authApi.resetPassword({ token, newPassword, confirmPassword });
  return data;
}

/**
 * Consultar si existe un usuario por su correo electrónico o numero de identificación.
 * @param email Correo electrónico del usuario.
 * @param numIdent Número de identificación.
 * @returns Datos del usuario o respuesta si el usuario no existe.
 */

export const userExistsService = async (
  email: string,
  numIdent: string
): Promise<boolean> => {
  try {
  const { data } = await authApi.userExists({ email, numDoc: numIdent });
  

    // Si responde OK → existe
    return Boolean(data);
  } catch (error: any) {
    // 404 = no existe → seguimos
    if (error.response?.status === 404) {
      return false;
    }

    // cualquier otro error sí es real
    throw error;
  }
};

/**
 * Crear usuario.
 * @param user Datos del usuario a crear.
 */
export const createUserService = async (
  user: createUserRequest
) => {
  const { data } = await authApi.createUser(user);
  return data;
} 

/*
 *Activar cuenta y cambiar contraseña anterior
 *
 */
export const accountActivateService = async (
  payload: AccountActivateRequest
)=>{
  const {data} = await authApi.accountActivation(payload);
  return data;
}

/*
 * Listar usuarios del sistema
 *
 */
export const listUsersService = async (
  payload: listUsersRequest
)=>{
  const {data} = await authApi.listUsers(payload);
  return data;
}

/*
 * Listar detalles de usuario por id
 *
 */
export const getUserDetailsService = async (
  userId: string
)=>{
  const {data} = await authApi.getDetailsUser(userId);
  return data;
}

/*
 * Listar detalles de usuario por id
 *
 */
export const getProfileService = async (
  userId: string
)=>{
  const {data} = await authApi.getProfile(userId);
  return data;
}

/*
 * Listar detalles de usuario por id
 *
 */
export const deleteUserService = async (
  userId: string
)=>{
  
  const {data} = await authApi.deleteSoftUser(userId);
  return data;
}

/*
 * Actualizar perfil propio del usuario autenticado.
 * El backend orquesta la actualización en proyectos externos.
 */
export const editProfileService = async (
  userId: string,
  payload: EditProfileRequest
) => {
  const { data } = await authApi.editProfile(userId, payload);
  return data;
};

/*
 * Actualizar usuario por admin.
 * El backend orquesta UPDATE_USER en proyectos externos usando external_data.
 */
export const editUserService = async (
  userId: string,
  payload: EditUserRequest
) => {
  const { data } = await authApi.editUser(userId, payload);
  return data;
};

/*
 * Cambiar estado activo/inactivo de un usuario.
 * El backend orquesta CHANGE_USER_STATUS en proyectos externos.
 */
export const changeUserStatusService = async (
  payload: ChangeUserStatusRequest
) => {
  const { data } = await authApi.changeUserStatus(payload);
  return data;
};


/*
 * Cambiar contraseña desde mi perfil
 *
 */
export const changePasswordService = async (
  userId: string,
  payload: ChangePasswordRequest
)=>{
  
  const {data} = await authApi.changePassword(userId, payload);
  return data;
}

/*
 * Listar permisos del sistema
 *
 */
export const listPermissionsService = async (
  payload: listPermissionsRequest
)=>{
  const {data} = await authApi.listPemissions(payload);
  return data;
}

/*
 * Listar un permiso del sistema
 *
 */
export const getDetailsPermissionService = async (
  permId: string
)=>{

  const {data} = await authApi.getPemission(permId);
  return data;
}


/*
 * Listar un permiso del sistema
 *
 */
export const editPermissionService = async (
  permId: string,
  payload:EditPermissionRequest
)=>{

  const {data} = await authApi.editPemission(permId, payload);
  return data;
}

/*
 * Listar roles del sistema
 *
 */
export const listRolesService = async (
  payload: listRolesRequest
)=>{
  const {data} = await authApi.listRoles(payload);
  return data;
}

/*
 * Eliminar un rol del sistema
 *
 */
export const deleteRoleService = async (
  roleId: string
)=>{
  const {data} = await authApi.deleteRole(roleId);
  return data;
}


/*
 * Listar un role del sistema
 *
 */
export const getDetailsRoleService = async (
  roleId: string
)=>{

  const {data} = await authApi.getRole(roleId);
  return data;
}

/*
 * Listar un role del sistema
 *
 */
export const editRoleService = async (
  roleId: string,
  payload: EditRoleRequest
)=>{

  const {data} = await authApi.editRole(roleId, payload);
  return data;
}

/*
 * Listar un permisos (basic) del sistema
 *
 */
export const getPermissionsBasicService = async (

)=>{

  const {data} = await authApi.listPemissionsBasic();
  return data;
}


/*
 * Crear un rol
 *
 */
export const createRoleService = async (
  payload: CreateRoleRequest
)=>{

  const {data} = await authApi.createRole(payload);
  return data;
}

/*
 * Lista basica de roles
 *
 */
export const getBasicListRolesService = async (
 
)=>{

  const {data} = await authApi.getBasicListRoles();
  return data;
}

/*
 * Cambiar el f2a de usuario
 */
/**
 * Obtiene el detalle completo de un proyecto externo (URLs, endpoints, etc.).
 */
export const getProjectDetailsService = async (projectId: string) => {
  const { data } = await authApi.getProjectDetail(projectId);
  return data;
};

/**
 * Obtiene el listado paginado de endpoints contables de un proyecto externo.
 */
export const listProjectAccountingEndpointsService = async (
  projectId: string,
  params?: ProjectAccountingEndpointsRequest,
) => {
  const { data } = await authApi.getProjectAccountingEndpoints(projectId, params);
  return data;
};

export const getExternalRequestTemplatesService = async () => {
  const { data } = await authApi.getExternalRequestTemplates();
  return data;
};

export const createProjectAccountingEndpointService = async (
  projectId: string,
  payload: CreateProjectAccountingInfoEndpointRequest,
) => {
  const { data } = await authApi.createProjectAccountingEndpoint(projectId, payload);
  return data;
};

export const getProjectAccountingEndpointDetailService = async (
  projectId: string,
  endpointId: string,
) => {
  const { data } = await authApi.getProjectAccountingEndpointDetail(
    projectId,
    endpointId,
  );
  return data;
};

export const updateProjectAccountingEndpointService = async (
  projectId: string,
  endpointId: string,
  payload: CreateProjectAccountingInfoEndpointRequest,
) => {
  const { data } = await authApi.updateProjectAccountingEndpoint(
    projectId,
    endpointId,
    payload,
  );
  return data;
};

export const deleteProjectAccountingEndpointService = async (
  projectId: string,
  endpointId: string,
) => {
  const { data } = await authApi.deleteProjectAccountingEndpoint(projectId, endpointId);
  return data;
};

export const validateAccountingTransferConnectionService = async () => {
  const { data } = await authApi.validateAccountingTransferConnection();
  return data;
};

export const changeFDoubleAService = async (
 userId: string,
 mfaActive: boolean
)=>{

  const {data} = await authApi.changeF2AUser(userId, mfaActive);
  return data;
}

