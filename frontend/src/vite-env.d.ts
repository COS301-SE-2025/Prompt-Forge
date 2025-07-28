/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_DEBUG: string
  readonly VITE_ENABLE_CONSOLE_LOGS: string
  readonly VITE_BUILD_MODE: string
  readonly VITE_PUBLIC_PATH: string
  readonly VITE_ENABLE_PWA: string
  readonly VITE_ENABLE_SERVICE_WORKER: string
  readonly VITE_ENABLE_SENTRY: string
  readonly VITE_ENABLE_HOTJAR: string
  readonly MODE: string
  readonly BASE_URL: string
  readonly PROD: boolean
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
