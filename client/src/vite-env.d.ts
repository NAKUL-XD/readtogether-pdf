/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_SOCKET_URL: string
  readonly VITE_STORAGE_TYPE?: string
  readonly VITE_S3_BUCKET?: string
  readonly VITE_S3_REGION?: string
  readonly VITE_S3_ACCESS_KEY?: string
  readonly VITE_S3_SECRET_KEY?: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_KEY?: string
  readonly VITE_SUPABASE_BUCKET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
