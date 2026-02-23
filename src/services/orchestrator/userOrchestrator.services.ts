/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ExternalProject } from "../../dto/shared/external-project.dto";
import { registerErrorPEService } from "../agrofusion/audit.service";
import type { RegisterErrorPEPayload } from "../agrofusion/audit.service";

// Aliasing de servicios externos para evitar colisiones de nombres
import {
  createUserByAdminService as createUserByAdminServiceDisriego,
  getRolesService as getRolesServiceDisriego,
  getTypeDocumentsService as getTypeDocumentsServiceDisriego,
  accountActivationService as accountActivationServiceDisriego,
  getUserByEmailService as getUserByEmailServiceDisriego,
  changeStateUserService as changeStateUserServiceDisriego,
} from "../disriegos/auth.service";
import {
  createUserByAdminService as createUserByAdminServiceSigma,
  getRolesService as getRolesServiceSigma,
  getTypeDocumentsService as getTypeDocumentsServiceSigma,
  accountActivationService as accountActivationServiceSigma,
  changeStateUserService as changeStateUserServiceSigma,
  getUserByEmailService as getUserByEmailServiceSigma,
} from "../sigma/auth.service";
import type { ExternalUser } from "../../dto/request/externalUser-request.dto";
import { handleReqResPasswordEP, handleResPasswordEP } from "./authOrchestrator.service";

export interface ProjectRole {
  role_id: number;
  role_name: string;
}

export interface ProjectTypeDocument {
  id: number;
  name: string;

}
const safePromise = <T>(fn: () => Promise<T>): Promise<T> =>
  fn().catch((error) => Promise.reject(error));

export type ProjectRolesMap = Record<string, ProjectRole[]>;
export type ProjectTypeDocumentMap = Record<string, ProjectTypeDocument[]>;

export type GetEPError = {
  project: string;
  messageKey: string;
  messageParams?: Record<string, string>;
  type?: "error" | "warning";
  to?: string;
  linkText?: string;
};

/** Enlaces directos a los proyectos externos para recuperación manual */
export const projectsLinks: Record<string, { to: string; linkText: string }> = {
  DISRIEGO: {
    to: "https://www.inmero.co/disriego/login",
    linkText: "common.goToDisriego",
  },
  SIGMA: {
    to: "https://inmero.co/sigma/login",
    linkText: "common.goToSigma",
  },
};

export const handleGetRolesEP = async (
  projects?: ExternalProject[],
): Promise<{
  roles: ProjectRolesMap;
  errors: GetEPError[];
}> => {
  if (!projects || projects.length === 0) {
    return { roles: {}, errors: [] };
  }

  const tasks: {
    service: string;
    promise: Promise<ProjectRole[]>;
  }[] = [];

  /** Registro dinámico de tareas */
  if (projects.some((p) => p.instance_code === "DISRIEGO")) {
    tasks.push({
      service: "DISRIEGO",
      promise: safePromise(() => getRolesServiceDisriego()),
    });
  }

  if (projects.some((p) => p.instance_code === "SIGMA")) {
    tasks.push({
      service: "SIGMA",
      promise: safePromise(() => getRolesServiceSigma()),
    });
  }

  const results = await Promise.allSettled(tasks.map((t) => t.promise));

  const auditErrors: RegisterErrorPEPayload[] = [];
  const uiErrors: GetEPError[] = [];
  const roles: ProjectRolesMap = {};

  results.forEach((result, index) => {
    const service = tasks[index].service;

    if (result.status === "fulfilled") {
      roles[service] = result.value;
    } else {
      const error = result.reason;

      const message =
        error?.response?.data?.detail?.message ??
        "No se pudieron cargar los roles.";

      /** Auditoría */
      auditErrors.push({
        context: "GET_ROLES",
        project: service,
        message,
        severity: "MEDIUM",
        payload_excerpt: {
          status: error?.response?.status
            ? String(error.response.status)
            : "N/A",
          data: error?.response?.data
            ? JSON.stringify(error.response.data)
            : "N/A",
        },
        error_code: "EXT_GET_ROLES_FAILED",
        component: "Obtención de roles",
      });

      /** Error para UI */
      uiErrors.push({
        project: service,
        messageKey: "createUser.errorLoadingRoles",
        messageParams: { service },
        type: "warning",
        to: "",
        linkText: "",
      });
    }
  });

  if (auditErrors.length > 0) {
    await registerErrorPEService(auditErrors);
  }

  return { roles, errors: uiErrors };
};

export const handleGetTypeDocumentsEP = async (
  projects?: ExternalProject[],
): Promise<{
  typeDocuments: ProjectTypeDocumentMap;
  errors: GetEPError[];
}> => {
  if (!projects || projects.length === 0) {
    return { typeDocuments: {}, errors: [] };
  }

  const tasks: {
    service: string;
    promise: Promise<ProjectTypeDocument[]>;
  }[] = [];

  /** Registro dinámico de tareas */
  if (projects.some((p) => p.instance_code === "DISRIEGO")) {
    tasks.push({
      service: "DISRIEGO",
      promise: safePromise(() => getTypeDocumentsServiceDisriego()),
    });
  }

  if (projects.some((p) => p.instance_code === "SIGMA")) {
    tasks.push({
      service: "SIGMA",
      promise: safePromise(() => getTypeDocumentsServiceSigma()),
    });
  }

  const results = await Promise.allSettled(tasks.map((t) => t.promise));

  const auditErrors: RegisterErrorPEPayload[] = [];
  const uiErrors: GetEPError[] = [];
  const typeDocuments: ProjectTypeDocumentMap = {};

  results.forEach((result, index) => {
    const service = tasks[index].service;

    if (result.status === "fulfilled") {
      typeDocuments[service] = result.value;
    } else {
      const error = result.reason;

      const message =
        error?.response?.data?.detail?.message ??
        "No se pudieron cargar los tipos de documentos.";

      /** Auditoría */
      auditErrors.push({
        context: "GET_TYPE_DOCUMENTS",
        project: service,
        message,
        severity: "MEDIUM",
        payload_excerpt: {
          status: error?.response?.status
            ? String(error.response.status)
            : "N/A",
          data: error?.response?.data
            ? JSON.stringify(error.response.data)
            : "N/A",
        },
        error_code: "EXT_GET_TYPE_DOCUMENTS_FAILED",
        component: "Obtención de tipos de documentos",
      });

      /** Error para UI */
      uiErrors.push({
        project: service,
        messageKey: "createUser.errorLoadingTypeDocuments",
        messageParams: { service },
        type: "warning",
        to: "",
        linkText: "",
      });
    }
  });

  if (auditErrors.length > 0) {
    await registerErrorPEService(auditErrors);
  }

  return { typeDocuments, errors: uiErrors };
};

export const handleCreateUserEP = async (
  users: {
    SIGMA?: ExternalUser;
    DISRIEGO?: ExternalUser;
  },

  projects?: ExternalProject[],
): Promise<{
  response: any;
  errors: GetEPError[];
  tokens: Record<string, string>;
}> => {
  if (!projects || projects.length === 0) {
    return { errors: [], response: null, tokens: {} };
  }

  const tasks: {
    service: string;
    promise: Promise<any>;
  }[] = [];

  /** Registro dinámico de tareas */
  if (projects.some((p) => p.instance_code === "DISRIEGO")) {
    tasks.push({
      service: "DISRIEGO",
      promise: safePromise(() =>
        createUserByAdminServiceDisriego(users.DISRIEGO!),
      ),
    });
  }

  if (projects.some((p) => p.instance_code === "SIGMA")) {
    tasks.push({
      service: "SIGMA",
      promise: safePromise(() => createUserByAdminServiceSigma(users.SIGMA!)),
    });
  }

  const results = await Promise.allSettled(tasks.map((t) => t.promise));

  const auditErrors: RegisterErrorPEPayload[] = [];
  const uiErrors: GetEPError[] = [];

  const tokensByService: Record<string, string> = {};

  results.forEach((result, index) => {
    const service = tasks[index].service;

    if (result.status === "fulfilled") {
      console.log(`Usuario creado exitosamente en ${service}`);

      const data = result.value;

      if (data?.token) {
        tokensByService[service] = data.token;
      }
    } else {
      const error = result.reason;

      const message =
        error?.response?.data?.detail?.message ??
        "No se pudo crear el usuario.";

      auditErrors.push({
        context: "CREATE_USER",
        project: service,
        message,
        severity: "MEDIUM",
        payload_excerpt: {
          status: error?.response?.status
            ? String(error.response.status)
            : "N/A",
          data: error?.response?.data
            ? JSON.stringify(error.response.data)
            : "N/A",
        },
        error_code: "EXT_CREATE_USER_FAILED",
        component: "Creación de usuarios",
      });

      uiErrors.push({
        project: service,
        messageKey: "createUser.errorRegisteringUser",
        messageParams: { service },
        type: "warning",
        to:  projectsLinks[service]?.to,
        linkText: "",
      });
    }
  });

  if (auditErrors.length > 0) {
    try {
      await registerErrorPEService(auditErrors);
    } catch (auditError) {
      console.error("Error registrando auditoría externa:", auditError);
    }
  }

  console.log("Resultados de creación de usuario:", results);

  return { errors: uiErrors, response: results, tokens: tokensByService };
};

export const handleAccountActivationEP = async (
  payload: {
    activationTokens: Record<string, string>;
    email: string;
    newPassword: string;
    confirmPassword: string;
  },
  projects?: ExternalProject[]
): Promise<{
  results: any;
  errors: GetEPError[];
}> => {

  if (!projects || projects.length === 0) {
    return { results: null, errors: [] };
  }

  const activationTasks: {
    service: string;
    promise: Promise<any>;
  }[] = [];

  /* ======================================
     ACTIVAR CUENTAS EXTERNAS
  ====================================== */

  if (
    projects.some(p => p.instance_code === "DISRIEGO") &&
    payload.activationTokens.DISRIEGO
  ) {
    activationTasks.push({
      service: "DISRIEGO",
      promise: accountActivationServiceDisriego(
        payload.activationTokens.DISRIEGO
      )
    });
  }

  if (
    projects.some(p => p.instance_code === "SIGMA") &&
    payload.activationTokens.SIGMA
  ) {
    activationTasks.push({
      service: "SIGMA",
      promise: accountActivationServiceSigma(
        payload.activationTokens.SIGMA
      )
    });
  }

  const activationResults = await Promise.allSettled(
    activationTasks.map(t => t.promise)
  );

  const errors: GetEPError[] = [];

  activationResults.forEach((result, index) => {
    if (result.status === "rejected") {
      const service = activationTasks[index].service;
      const link = projectsLinks[service];

      errors.push({
        project: service,
        messageKey: "accountActivation.externalActivationFailed",
        messageParams: { service },
        type: "warning", // literal correcto
        to: link?.to,
        linkText: link?.linkText ?? ""
      });
    }
  });

  /* ======================================
     SOLICITAR TOKENS RESET PASSWORD
  ====================================== */

  const { tokens, errors: reqErrors } =
    await handleReqResPasswordEP(payload.email, projects);

  errors.push(
    ...reqErrors.map(err => {
      const link = projectsLinks[err.project];

      return {
        ...err,
        type: "warning" as const,
        to: err.to ?? link?.to,
        linkText: link?.linkText ?? ""
      };
    })
  );

  /* ======================================
     RESET PASSWORD EXTERNO
  ====================================== */

  const { errors: resetErrors } = await handleResPasswordEP(
    tokens.tDisriego ?? "",
    tokens.tSigma ?? "",
    payload.newPassword,
    payload.confirmPassword,
    projects
  );

  errors.push(
    ...resetErrors.map(err => {
      const link = projectsLinks[err.project];

      return {
        ...err,
        type: "warning" as const,
        to: err.to ?? link?.to,
        linkText: link?.linkText ?? ""
      };
    })
  );

  return {
    results: {
      activationResults,
      tokens
    },
    errors
  };
};

export const handleGetUserByEmailEP = async (
  email: string,
  projects?: ExternalProject[]
): Promise<{
  users: Record<string, any>;
  errors: GetEPError[];
}> => {
  if (!projects || projects.length === 0) {
    return { users: {}, errors: [] };
  }

  const tasks: {
    service: string;
    promise: Promise<any>;
  }[] = [];

  /* ================================
     REGISTRO DINÁMICO
  ================================= */

  if (projects.some(p => p.instance_code === "DISRIEGO")) {
    tasks.push({
      service: "DISRIEGO",
      promise: safePromise(() =>
        getUserByEmailServiceDisriego(email)
      )
    });
  }

  if (projects.some(p => p.instance_code === "SIGMA")) {
    tasks.push({
      service: "SIGMA",
      promise: safePromise(() =>
        getUserByEmailServiceSigma(email)
      )
    });
  }

  const results = await Promise.allSettled(tasks.map(t => t.promise));

  const auditErrors: RegisterErrorPEPayload[] = [];
  const uiErrors: GetEPError[] = [];
  const users: Record<string, any> = {};

  results.forEach((result, index) => {
    const service = tasks[index].service;

    if (result.status === "fulfilled") {
      users[service] = result.value;
    } else {
      const error = result.reason;

      const message =
        error?.response?.data?.detail?.message ??
        "No se pudo consultar el usuario por email.";

      auditErrors.push({
        context: "GET_USER_BY_EMAIL",
        project: service,
        message,
        severity: "MEDIUM",
        payload_excerpt: {
          status: error?.response?.status
            ? String(error.response.status)
            : "N/A",
          data: error?.response?.data
            ? JSON.stringify(error.response.data)
            : "N/A"
        },
        error_code: "EXT_GET_USER_BY_EMAIL_FAILED",
        component: "Consulta usuario por email"
      });

      uiErrors.push({
        project: service,
        messageKey: "editUser.externalUserLookupFailed",
        messageParams: { service },
        type: "warning",
        to: projectsLinks[service]?.to,
        linkText: projectsLinks[service]?.linkText ?? ""
      });
    }
  });

  if (auditErrors.length > 0) {
    await registerErrorPEService(auditErrors);
  }

  return { users, errors: uiErrors };
};
export const handleChangeUserStatusEP = async (
  payload: {
    user_id: number;
    new_status: number;
  },
  projects?: ExternalProject[]
): Promise<{
  results: Record<string, any>;
  errors: GetEPError[];
}> => {
  if (!projects || projects.length === 0) {
    return { results: {}, errors: [] };
  }

  const tasks: {
    service: string;
    promise: Promise<any>;
  }[] = [];

  /* ================================
     REGISTRO DINÁMICO
  ================================= */

  if (projects.some(p => p.instance_code === "DISRIEGO")) {
    tasks.push({
      service: "DISRIEGO",
      promise: safePromise(() =>
        changeStateUserServiceDisriego(
          payload.user_id,
          payload.new_status
        )
      )
    });
  }

  if (projects.some(p => p.instance_code === "SIGMA")) {
    tasks.push({
      service: "SIGMA",
      promise: safePromise(() =>
        changeStateUserServiceSigma(
          payload.user_id,
          payload.new_status
        )
      )
    });
  }

  const resultsSettled = await Promise.allSettled(
    tasks.map(t => t.promise)
  );

  const auditErrors: RegisterErrorPEPayload[] = [];
  const uiErrors: GetEPError[] = [];
  const results: Record<string, any> = {};

  resultsSettled.forEach((result, index) => {
    const service = tasks[index].service;

    if (result.status === "fulfilled") {
      results[service] = result.value;
    } else {
      const error = result.reason;

      const message =
        error?.response?.data?.detail?.message ??
        "No se pudo cambiar el estado del usuario.";

      /* ================================
         AUDITORÍA
      ================================= */

      auditErrors.push({
        context: "CHANGE_USER_STATUS",
        project: service,
        message,
        severity: "MEDIUM",
        payload_excerpt: {
          status: error?.response?.status
            ? String(error.response.status)
            : "N/A",
          data: error?.response?.data
            ? JSON.stringify(error.response.data)
            : "N/A"
        },
        error_code: "EXT_CHANGE_USER_STATUS_FAILED",
        component: "Cambio estado usuario"
      });

      /* ================================
         ERROR PARA UI
      ================================= */

      uiErrors.push({
        project: service,
        messageKey: "common.externalStatusChangeFailed",
        messageParams: { service },
        type: "warning",
        to: projectsLinks[service]?.to,
        linkText: projectsLinks[service]?.linkText ?? ""
      });
    }
  });

  /* ================================
     REGISTRAR ERRORES EN AUDITORÍA
  ================================= */

  if (auditErrors.length > 0) {
    await registerErrorPEService(auditErrors);
  }

  return { results, errors: uiErrors };
};