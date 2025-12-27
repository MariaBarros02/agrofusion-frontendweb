/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_AUTH_URL: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_ENV: "development" | "production" | "staging";
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  