type EnvVars = {
  VITE_API_AUTH_AF_URL?: string;
  VITE_API_AUDIT_AF_URL?: string;
  VITE_API_SIGMA_URL?: string;
  VITE_API_DISRIEGO_URL?: string;
};

export const env: EnvVars = {
  VITE_API_AUTH_AF_URL: process.env.VITE_API_AUTH_AF_URL,
  VITE_API_AUDIT_AF_URL: process.env.VITE_API_AUDIT_AF_URL,
  VITE_API_SIGMA_URL: process.env.VITE_API_SIGMA_URL,
  VITE_API_DISRIEGO_URL: process.env.VITE_API_DISRIEGO_URL
};

