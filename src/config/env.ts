type EnvVars = {
  VITE_API_AUTH_AF_URL?: string;
  VITE_API_AUDIT_AF_URL?: string;
  VITE_API_SIGMA_URL?: string;
  VITE_API_DISRIEGO_URL?: string;
};

// Función auxiliar para obtener la variable sin que el compilador explote
const getEnv = (name: string): string | undefined => {
  try {
    // Intenta Vite primero
  
    if (import.meta && import.meta.env) {
      return import.meta.env[name];
    }
  } catch (e) {
    // Si falla, estamos en un entorno Node (Jest)
  }
  return process.env[name];
};

export const env: EnvVars = {
  VITE_API_AUTH_AF_URL: getEnv('VITE_API_AUTH_AF_URL'),
  VITE_API_AUDIT_AF_URL: getEnv('VITE_API_AUDIT_AF_URL'),
  VITE_API_SIGMA_URL: getEnv('VITE_API_SIGMA_URL'),
  VITE_API_DISRIEGO_URL: getEnv('VITE_API_DISRIEGO_URL')
};