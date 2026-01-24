/**
 * Diccionario de ámbitos (scopes) de error de autenticación.
 * Se utiliza 'as const' para asegurar que los valores sean tratados como literales
 * y no como simples cadenas de texto (Strings), permitiendo inferencia de tipos estricta.
 */
export const AUTH_ERROR_SCOPE = {
  /** Errores que afectan a la cuenta de usuario completa o flujo general */
  GLOBAL: [
    "AUTH_USER_NOT_FOUND",          // Usuario no existe
    "AUTH_USER_DELETED",            // Cuenta borrada
    "AUTH_ACCOUNT_NOT_ACTIVATED",   // Requiere activación por correo
  ],
  /** Errores vinculados específicamente a las credenciales de acceso */
  PASSWORD: [
    "AUTH_INVALID_PASSWORD",        // Contraseña incorrecta
    "AUTH_USER_BLOCKED",            // Bloqueado por múltiples intentos (brute force)
    "AUTH_INVALID_RESET_TOKEN"      // Token de recuperación vencido o usado
  ],
  /** Errores del flujo de Segundo Factor de Autenticación (MFA) */
  OTP: [
    "AUTH_OTP_EXPIRED",             // El código de 6 dígitos ha caducado
    "AUTH_INVALID_OTP",             // Código incorrecto
    "AUTH_OTP_BLOCKED"              // Demasiados intentos de código fallidos
  ]
} as const;

/** * EXTRACCIÓN DINÁMICA DE TIPOS
 * Estos tipos permiten que TypeScript nos avise si intentamos usar un código
 * de error que no existe en el objeto AUTH_ERROR_SCOPE.
 */
export type GlobalAuthError = typeof AUTH_ERROR_SCOPE.GLOBAL[number];
export type PasswordAuthError = typeof AUTH_ERROR_SCOPE.PASSWORD[number];
export type OptAuthError = typeof AUTH_ERROR_SCOPE.OTP[number];

/** Union type que engloba todos los errores posibles + un fallback genérico */
export type AuthErrorCode =
  | GlobalAuthError
  | PasswordAuthError
  | OptAuthError
  | "AUTH_GENERIC";

/**
 * TYPE GUARDS (Predicados de tipo)
 * Estas funciones permiten comprobar en tiempo de ejecución de qué tipo es un error,
 * ayudando a la UI a decidir dónde renderizar el mensaje (ej: error en input vs Toast).
 */

/** Determina si el error debe mostrarse de forma general en el formulario */
export const isGlobalAuthError = (
  code: AuthErrorCode
): code is GlobalAuthError =>
  AUTH_ERROR_SCOPE.GLOBAL.includes(code as GlobalAuthError);

/** Determina si el error debe resaltar el campo de contraseña */
export const isPasswordAuthError = (
  code: AuthErrorCode
): code is PasswordAuthError =>
  AUTH_ERROR_SCOPE.PASSWORD.includes(code as PasswordAuthError);

/** Determina si el error pertenece a la validación del código OTP */
export const isOtpAuthError = (
  code: AuthErrorCode
): code is OptAuthError =>
  AUTH_ERROR_SCOPE.OTP.includes(code as OptAuthError);