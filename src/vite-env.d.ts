/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string
  // 七牛云（可选；不配置则照片回退 localStorage）
  readonly VITE_QINIU_BUCKET?: string
  readonly VITE_QINIU_DOMAIN?: string
  readonly VITE_QINIU_TOKEN_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
