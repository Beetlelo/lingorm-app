// 七牛云 Kodo 存储适配层（双模式）
// -------------------------------------------------------------
// 配置了 VITE_QINIU_* 时：照片压缩为 Blob 后直传七牛，本地只存 CDN URL
// 未配置时：调用方回退为 base64 存 localStorage（保持原有行为）
// 上传凭证由 Cloudflare Worker 签发（secretKey 绝不进前端），见 qiniu-worker/
// -------------------------------------------------------------

const BUCKET = import.meta.env.VITE_QINIU_BUCKET ?? ''
const DOMAIN = import.meta.env.VITE_QINIU_DOMAIN ?? ''
const TOKEN_URL = import.meta.env.VITE_QINIU_TOKEN_URL ?? ''

// 七牛智能上传域名，自动按区域路由（华东/华北/华南/北美都走这一个）
const UPLOAD_HOST = 'https://upload.qiniup.com'

// 是否已启用七牛云（三项齐全才启用，否则整体回退本地）
export function isQiniuEnabled(): boolean {
  return Boolean(BUCKET && DOMAIN && TOKEN_URL)
}

export type QiniuUploadResult = { url: string; key: string }

function randomKey(ext = 'jpg'): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return `lingorm/${ts}-${rand}.${ext}`
}

// 向 Worker 申请针对单个 key 的短期（1 小时）上传凭证
async function fetchUploadToken(key: string): Promise<string> {
  const url = `${TOKEN_URL}?key=${encodeURIComponent(key)}&bucket=${encodeURIComponent(BUCKET)}`
  const res = await fetch(url, { method: 'GET' })
  if (!res.ok) throw new Error(`获取上传凭证失败 (${res.status})`)
  const data = (await res.json()) as { token?: string; error?: string }
  if (!data.token) throw new Error(data.error || '凭证返回格式异常')
  return data.token
}

// 直传七牛，返回可访问的 CDN URL。失败向上抛出，由调用方决定是否回退本地。
export async function uploadToQiniu(blob: Blob): Promise<QiniuUploadResult> {
  const key = randomKey('jpg')
  const token = await fetchUploadToken(key)
  const form = new FormData()
  form.append('token', token)
  form.append('key', key)
  form.append('file', blob, key)

  const res = await fetch(UPLOAD_HOST, { method: 'POST', body: form })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`七牛上传失败 (${res.status}) ${detail}`)
  }
  const data = (await res.json()) as { key?: string; error?: string }
  if (!data.key) throw new Error(data.error || '上传响应缺少 key')
  const base = DOMAIN!.replace(/\/$/, '')
  return { url: `${base}/${data.key}`, key: data.key }
}
