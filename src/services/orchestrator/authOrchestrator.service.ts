/* eslint-disable @typescript-eslint/no-explicit-any */
import { registerErrorPEService } from "../agrofusion/audit.service";
import { ssoLoginService } from "../agrofusion/auth.service";

/** Error específico para el flujo de Single Sign-On */
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
): Promise<{ sso_token: string } | { errors: SSOLoginEPError[] }> => {
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
