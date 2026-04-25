/**
 * Variables de entorno disponibles para el frontend de AgroFusion.
 */
 type EnvVars = {
  VITE_API_AUTH_AF_URL?: string;
  VITE_API_AUDIT_AF_URL?: string;
  VITE_API_INT_AF_URL?: string;
  VITE_API_SIGMA_URL?: string;
  VITE_API_DISRIEGO_URL?: string;
};

/**
 * Obtiene una variable de entorno desde Vite.
 * Si la ejecución ocurre en un entorno distinto, intenta leerla desde process.env.
 */
const getEnv = (name: string): string | undefined => {
  try {
    if (import.meta && import.meta.env) {
      return import.meta.env[name];
    }
  } catch (error) {
    // Ignora el error cuando import.meta.env no está disponible.
  }

  return process.env[name];
};

/**
 * Objeto centralizado con las variables de entorno usadas por el frontend.
 */
export const env: EnvVars = {
  VITE_API_AUTH_AF_URL: getEnv("VITE_API_AUTH_AF_URL"),
  VITE_API_AUDIT_AF_URL: getEnv("VITE_API_AUDIT_AF_URL"),
  VITE_API_INT_AF_URL: getEnv("VITE_API_INT_AF_URL"),
  VITE_API_SIGMA_URL: getEnv("VITE_API_SIGMA_URL"),
  VITE_API_DISRIEGO_URL: getEnv("VITE_API_DISRIEGO_URL"),
};