// Cloudflare Worker：签发七牛云上传凭证
// -------------------------------------------------------------
// 部署：Cloudflare Dashboard → Workers & Pages → Create → 粘贴本文件
//       然后 Settings → Variables → 添加 QINIU_AK / QINIU_SK（Secret 类型）
// 前端通过 GET /?key=xxx&bucket=yyy 获取短期（1 小时）上传 token。
// SecretKey 只在 Worker 内使用，绝不暴露给前端。
// -------------------------------------------------------------

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    const url = new URL(request.url)
    const key = url.searchParams.get('key') || ''
    const bucket = url.searchParams.get('bucket') || ''
    if (!bucket) {
      return new Response(JSON.stringify({ error: 'bucket missing' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const token = await makeUploadToken(env.QINIU_AK, env.QINIU_SK, bucket, key)
    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  },
}

function urlSafeBase64(bytes) {
  let binary = ''
  const arr = new Uint8Array(bytes)
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_')
}

async function hmacSha1(key, msg) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  )
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(msg))
}

// 七牛 upload token = AK:encodedSign:encodedPutPolicy
async function makeUploadToken(ak, sk, bucket, key) {
  const putPolicy = {
    scope: key ? `${bucket}:${key}` : bucket,
    deadline: Math.floor(Date.now() / 1000) + 3600,
    fsizeLimit: 15 * 1024 * 1024, // 单文件上限 15MB
  }
  const encodedPutPolicy = urlSafeBase64(new TextEncoder().encode(JSON.stringify(putPolicy)))
  const sign = await hmacSha1(sk, encodedPutPolicy)
  const encodedSign = urlSafeBase64(sign)
  return `${ak}:${encodedSign}:${encodedPutPolicy}`
}
