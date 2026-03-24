import type { TFunction } from "i18next";

/**
 * Traduce códigos de error del API de auditoría/KMS o devuelve un mensaje genérico.
 */
export function resolveKmsErrorMessage(t: TFunction, err: unknown): string {
  const ax = err as {
    response?: { data?: { detail?: { code?: string } } };
    message?: string;
  };
  const code = ax.response?.data?.detail?.code;
  if (code) {
    const key = `errors.${code}`;
    const msg = t(key);
    if (msg !== key) return msg;
    return code;
  }
  return t("kms.genericError");
}
