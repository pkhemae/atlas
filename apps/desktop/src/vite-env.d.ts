/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin; falls back to the local dev API when unset. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
