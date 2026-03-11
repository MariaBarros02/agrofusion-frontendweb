/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ExternalProject } from "../../dto/shared/external-project.dto";
import { registerErrorPEService } from "../agrofusion/audit.service";
import type { RegisterErrorPEPayload } from "../agrofusion/audit.service";
import { ssoLoginService } from "../agrofusion/auth.service";

// Aliasing de servicios externos para evitar colisiones de nombres
import {
  reqResetPasswordService as reqResPassSigmaSer,
  resetPasswordService as resPassSigmaSer,
} from "../sigma/auth.service";
import {

  reqResetPasswordService as reqResPassDisSer,
  resetPasswordService as resPassDisSer,
} from "../disriegos/auth.service";

/** Mapeo de tokens de reseteo para cada instancia externa */
export type ResetTokenMap = Record<string, string>;

type TokenResponse = {
  key: string;
  token: string;
};
/** Error estructurado para ser mostrado en la UI mediante Toasts/Alertas */
export type ResetPasswordEPError = {
  messageKey: string;
  messageParams?: Record<string, string>;
  project: string;
  to?: string;
};
/** Error específico para el flujo de Single Sign-On */
export type ResetPasswordAuditError = {
  project: string;
  message: string;
};

export type SSOLoginEPError = {
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


/**
 * Gestiona el inicio de sesión único (SSO) para un proyecto.
 * Si falla, registra el error en el sistema de auditoría antes de retornar el error a la UI.
 */
export const handleSSOLoginEP = async (
  project: string
): Promise<
  | { sso_token: string }
  | { errors: SSOLoginEPError[] }
> => {
  let response;

  try {
    response = await ssoLoginService(project);
  } catch (error: any) {
    return await handleSSOError(project, error);
  }

  if (!response?.sso_token) {
    return await handleSSOError(project, {
      message: "SSO_TOKEN_EMPTY",
      response: null,
    });
  }

  return { sso_token: response.sso_token };
};
const handleSSOError = async (
  project: string,
  error: any
): Promise<{ errors: SSOLoginEPError[] }> => {
  const message =
    error?.response?.data?.detail?.message ??
    "No se pudo generar el token de ingreso sso para el proyecto " + project;

  await registerErrorPEService([
    {
      context: "LOGIN_SSO_FAILED",
      project,
      message,
      severity: "HIGH",
      payload_excerpt: {
        status: error?.response?.status
          ? String(error.response.status)
          : "N/A",
        data: error?.response?.data
          ? JSON.stringify(error.response.data)
          : "N/A",
      },
      error_code: "EXT_SSO_LOGIN_FAILED",
      component: "Inicio sesión SSO",
    },
  ]);

  return {
    errors: [
      {
        project,
        messageKey: "login.errorSSOLogin",
        messageParams: { project },
        type: "error",
        ...(projectsLinks[project] ?? {}),
      },
    ],
  };
};


/**
 * Solicita tokens de reseteo de contraseña a todos los proyectos vinculados de forma paralela.
 * Utiliza Promise.allSettled para que el fallo de un proyecto no detenga a los demás.
 */
export const handleReqResPasswordEP = async (
  email: string,
  projects?: ExternalProject[],
): Promise<{
  tokens: ResetTokenMap;
  errors: ResetPasswordEPError[];
}> => {
  if (!projects || projects.length === 0) {
    return { tokens: {}, errors: [] };
  }

  const tasks: {
    service: string;
    promise: Promise<TokenResponse>;
  }[] = [];

  // Registro dinámico de tareas según los proyectos del usuario
  if (projects.some((p) => p.instance_code === "DISRIEGO")) {
    tasks.push({
      service: "DISRIEGO",
      promise: reqResPassDisSer(email),
    });
  }

  if (projects.some((p) => p.instance_code === "SIGMA")) {
    tasks.push({
      service: "SIGMA",
      promise: reqResPassSigmaSer(email),
    });
  }

  const results = await Promise.allSettled(tasks.map((t) => t.promise));

  const auditErrors: RegisterErrorPEPayload[] = [];
  const uiErrors: ResetPasswordEPError[] = [];
  const tokens: ResetTokenMap = {};

  results.forEach((result, index) => {
    const service = tasks[index].service;

    if (result.status === "fulfilled") {
      if (service === "DISRIEGO") tokens.tDisriego = result.value.token;
      if (service === "SIGMA") tokens.tSigma = result.value.token;
    } else {
      // Gestión de fallos y preparación de auditoría
      const error = result.reason;

      const message =
        error?.response?.data?.detail?.message ??
        "No se pudo solicitar el cambio de contraseña.";

      auditErrors.push({
        context: "REQUEST_RESET_PASSWORD",
        project: service,
        message,
        severity: "HIGH",
        payload_excerpt: {
          status: error?.response?.status
            ? String(error.response.status)
            : "N/A",
          data: error?.response?.data
            ? JSON.stringify(error.response.data)
            : "N/A",
        },
        error_code: "EXT_RESET_PASSWORD_FAILED",
        component: "Solicitar cambio de contraseña",
      });

      //  Error para UI
      uiErrors.push({
        project: service,
        messageKey: "reqResetPassword.errorExtPro",
        messageParams: {
          service,
        },
        to: projectsLinks[service]?.to,
      });
    }
  });

  if (auditErrors.length > 0) {
    await registerErrorPEService(auditErrors);
  }

  return { tokens, errors: uiErrors };
};

export const handleResPasswordEP = async (
  tDisriego: string,
  tSigma: string,
  newPassword: string,
  confirmPassword: string,
  projects?: ExternalProject[],
): Promise<{ errors: ResetPasswordEPError[]; }> => {
  if (!projects || projects.length === 0) return {errors:[]};

  const tasks: { service: string; promise: Promise<any> }[] = [];

  if (projects.some((p) => p.instance_code === "DISRIEGO")) {
    tasks.push({
      service: "DISRIEGO",
      promise: resPassDisSer(tDisriego, newPassword, confirmPassword),
    });
  }

  if (projects.some((p) => p.instance_code === "SIGMA")) {
    tasks.push({
      service: "SIGMA",
      promise: resPassSigmaSer(tSigma, newPassword, confirmPassword),
    });
  }

  const results = await Promise.allSettled(tasks.map((t) => t.promise));
  const auditErrors: RegisterErrorPEPayload[] = [];
  const uiErrors: ResetPasswordEPError[] = [];

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      const service = tasks[index].service;
      const error = result.reason;

      auditErrors.push({
        context: "RESET_PASSWORD",
        project: service,
        message:
          error?.response?.data?.detail?.message ?? "Error al cambiar contraseña",
        severity: "HIGH",
        payload_excerpt: {
          status: error?.response?.status
            ? String(error?.response?.status)
            : "N/A",
          data: error?.response?.data
            ? JSON.stringify(error?.response?.data)
            : "N/A",
        },
        error_code: "EXT_RESET_PASSWORD_FAILED",
        component: "Reestablecer contraseña",
      });
      uiErrors.push({
        project: service,
        messageKey: "No se pudo realizar el cambio de contraseña.",
        messageParams: {
          service,
        },
        to: projectsLinks[service]?.to,
      });
    }
  });
  if (auditErrors.length > 0) {
    await registerErrorPEService(auditErrors);
  }

  return {errors: uiErrors}
};
