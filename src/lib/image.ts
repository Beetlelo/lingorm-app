// 本地图片 -> 压缩为 JPEG。两种出口：
// - fileToDataURL：返回 base64（头像等小图 / 七牛不可用时的回退）
// - fileToJpegBlob：返回 Blob（供七牛云直传，体积更小、上传更快）
// 优先用 createImageBitmap 解码（现代浏览器可解 HEIC/AVIF），失败回退 <img>。

type Drawable = CanvasImageSource & {
  width?: number
  height?: number
  naturalWidth?: number
  naturalHeight?: number
}

// 把 File 解码成可绘制的源（统一 HEIC/AVIF/jpg/png 差异）
function decodeDrawable(file: File): Promise<Drawable> {
  const win = window as any
  return new Promise((resolve, reject) => {
    const fallback = () => {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('图片格式不支持或已损坏'))
        img.src = reader.result as string
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsDataURL(file)
    }
    if (typeof win.createImageBitmap === 'function') {
      win.createImageBitmap(file).then((bmp: Drawable) => resolve(bmp)).catch(fallback)
      return
    }
    fallback()
  })
}

// 等比缩放到 maxSize 以内，返回画布
function drawToCanvas(src: Drawable, maxSize: number): HTMLCanvasElement {
  const iw = (src as any).naturalWidth || (src as any).width || 0
  const ih = (src as any).naturalHeight || (src as any).height || 0
  const scale = Math.min(1, maxSize / Math.max(iw, ih || 1))
  const w = Math.max(1, Math.round(iw * scale))
  const h = Math.max(1, Math.round(ih * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法处理图片')
  ctx.drawImage(src as CanvasImageSource, 0, 0, w, h)
  return canvas
}

// base64 出口（头像、回退本地存储用）
export async function fileToDataURL(file: File, maxSize = 1280): Promise<string> {
  const drawable = await decodeDrawable(file)
  try {
    return drawToCanvas(drawable, maxSize).toDataURL('image/jpeg', 0.85)
  } finally {
    ;(drawable as any).close?.()
  }
}

// Blob 出口（七牛直传用）。默认 1280px / 0.75，单张约 150–300KB，兼顾清晰与速度。
export async function fileToJpegBlob(
  file: File,
  maxSize = 1280,
  quality = 0.75,
): Promise<Blob> {
  const drawable = await decodeDrawable(file)
  try {
    const canvas = drawToCanvas(drawable, maxSize)
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('图片压缩失败'))),
        'image/jpeg',
        quality,
      )
    })
  } finally {
    ;(drawable as any).close?.()
  }
}
