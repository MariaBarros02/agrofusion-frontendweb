import type { ExternalOrchestrationError } from "../../dto/shared/orchestration.dto";

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

export type GetEPError = {
  project: string;
  messageKey: string;
  messageParams?: Record<string, string>;
  type?: "error" | "warning";
  to?: string;
  linkText?: string;
};

/**
 * Convierte los errores de orquestación devueltos por el backend
 * al formato GetEPError usado por la UI (toasts, alertas).
 */
export const mapBackendErrors = (
  errors: ExternalOrchestrationError[],
  messageKeyPrefix: string
): GetEPError[] =>
  errors.map((e) => ({
    project: e.instance_code,
    messageKey: `${messageKeyPrefix}.${e.error_code}`,
    messageParams: { service: e.instance_code },
    type: "warning" as const,
    to: projectsLinks[e.instance_code]?.to,
    linkText: projectsLinks[e.instance_code]?.linkText ?? "",
  }));
