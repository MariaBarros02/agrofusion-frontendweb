/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ExternalProject } from "../../dto/shared/external-project.dto";
import { registerErrorPEService } from "../agrofusion/audit.service";
import type { RegisterErrorPEPayload } from "../agrofusion/audit.service";

// Aliasing de servicios externos para evitar colisiones de nombres
import { getRolesService as getRolesServiceDisriego } from "../disriegos/auth.service";
import { getRolesService as getRolesServiceSigma } from "../sigma/auth.service";


export interface ProjectRole {
  role_id: number;
  role_name: string;
}


export type ProjectRolesMap = Record<string, ProjectRole[]>;

export type GetRolesEPError = {
  project: string;
  messageKey: string;
  messageParams?: Record<string, string>;
  type?: "error" | "warning";
  to: string;
  linkText: string;
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
  errors: GetRolesEPError[];
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
      promise: getRolesServiceDisriego(),
    });
  }

  if (projects.some((p) => p.instance_code === "SIGMA")) {
    tasks.push({
      service: "SIGMA",
      promise: getRolesServiceSigma(),
    });
  }

  const results = await Promise.allSettled(tasks.map((t) => t.promise));

  const auditErrors: RegisterErrorPEPayload[] = [];
  const uiErrors: GetRolesEPError[] = [];
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
        to:"",
        linkText:""
      });
    }
  });

  if (auditErrors.length > 0) {
    await registerErrorPEService(auditErrors);
  }

  return { roles, errors: uiErrors };
};
