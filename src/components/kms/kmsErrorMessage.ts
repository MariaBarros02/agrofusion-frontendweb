import type { TFunction } from "i18next";

/**
 * Traduce códigos de error del API de auditoría/KMS o devuelve un mensaje genérico.
 */
export function resolveKmsErrorMessage(t: TFunction, err: unknown): string {
  const ax = err as {
    response?: {
      status?: number;
      data?: {
        detail?:
          | string
          | { code?: string; msg?: string }
          | Array<{ loc?: Array<string | number>; msg?: string }>;
      };
    };
    message?: string;
    code?: string;
  };

  if (!ax.response) {
    return t("kms.networkError");
  }

  const detail = ax.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    const loc = first.loc?.join(".") ?? "";
    if (loc.includes("project_id")) {
      return "El backend exige project_id en este endpoint. Hay que ajustar el backend para usar proyecto por defecto o volver a enviarlo desde frontend.";
    }
    return first.msg ?? t("kms.genericError");
  }

  const code = !Array.isArray(detail) ? detail?.code : undefined;
  if (code) {
    const key = `errors.${code}`;
    const msg = t(key);
    if (msg !== key) return msg;
    return key;
  }

  if (!Array.isArray(detail) && detail?.msg) {
    return detail.msg;
  }

  if (ax.response?.status === 422) {
    return "Datos inválidos para esta operación (422).";
  }
  if (ax.response?.status === 401) {
    return t("kms.unauthorizedError");
  }
  if (ax.response?.status === 403) {
    return t("kms.forbiddenError");
  }
  return t("kms.genericError");
}
