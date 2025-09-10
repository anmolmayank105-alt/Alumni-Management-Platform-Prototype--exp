/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MONGODB_CONNECTION_STRING: string;
  readonly VITE_MONGODB_DATABASE_NAME: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
