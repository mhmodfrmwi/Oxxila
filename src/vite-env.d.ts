/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Injected from `BASE_URL` in `.env` via vite.config.ts */
  readonly APP_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
