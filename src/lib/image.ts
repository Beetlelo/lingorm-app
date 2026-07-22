// 选择本地图片 -> 压缩为 JPEG dataURL（避免大图/HEIC 撑爆 localStorage 5MB 上限）
// 优先用 createImageBitmap 解码（现代浏览器可解 HEIC/AVIF），失败再回退 <img>。
type Drawable = CanvasImageSource & {
  width?: number
  height?: number
  naturalWidth?: number
  naturalHeight?: number
}

function drawToJpeg(src: Drawable, maxSize = 1280): string {
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
  return canvas.toDataURL('image/jpeg', 0.85)
}

export function fileToDataURL(file: File, maxSize = 1280): Promise<string> {
  return new Promise((resolve, reject) => {
    const win = window as any
    // 首选：createImageBitmap 能解 HEIC/AVIF 等现代格式
    if (typeof win.createImageBitmap === 'function') {
      win
        .createImageBitmap(file)
        .then((bmp: Drawable) => {
          try {
            const url = drawToJpeg(bmp, maxSize)
            ;(bmp as any).close?.()
            resolve(url)
          } catch (e) {
            reject(e)
          }
        })
        .catch(() => {
          // 回退：FileReader + <img>
          const reader = new FileReader()
          reader.onload = () => {
            const img = new Image()
            img.onload = () => {
              try {
                resolve(drawToJpeg(img, maxSize))
              } catch (e) {
                reject(e)
              }
            }
            img.onerror = () => reject(new Error('图片格式不支持或已损坏'))
            img.src = reader.result as string
          }
          reader.onerror = () => reject(new Error('文件读取失败'))
          reader.readAsDataURL(file)
        })
      return
    }
    // 无 createImageBitmap 的旧环境
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        try {
          resolve(drawToJpeg(img, maxSize))
        } catch (e) {
          reject(e)
        }
      }
      img.onerror = () => reject(new Error('图片格式不支持或已损坏'))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}
