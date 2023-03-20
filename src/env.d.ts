/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DELEGATE_DATABASE_URL?: string
  readonly VITE_LOG?: "DEBUG"
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}