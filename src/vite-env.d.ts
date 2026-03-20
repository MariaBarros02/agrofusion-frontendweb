/// <reference types="vite/client" />

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_AUTH_AF_URL: string
  readonly VITE_API_AUDIT_AF_URL: string
  readonly VITE_API_DISRIEGO_URL: string
  readonly VITE_API_SIGMA_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_ENV: 'development' | 'production' | 'testing'
  readonly VITE_CLIENT_ID: string
  readonly VITE_CLIENT_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
