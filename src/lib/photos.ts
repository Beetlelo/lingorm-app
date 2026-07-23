// Shared photo data source — used by Album, Home and Browse so the
// "心动收藏" (favorites) is a single source of truth across the app.

export type Photo = {
  id: number
  title: string
  date: string
  tag: string
  h?: number
  dataUrl?: string
  src?: string
  // 扩展标记维度：供"按人物 / 按活动场次 / 按地点"搜索
  people?: string[] // 人物标签，如 ['Lingling','Orm']
  event?: string // 关联的活动场次名，如 '深圳湾演唱会 2024'
  place?: string // 地点 / 店铺 / 城市，如 '深圳' / '曼谷'
}

export type RecentlyDeletedItem = {
  photo: Photo
  deletedAt: number
  isUpload: boolean
}

export const folders = [
  { name: '全部照片', emoji: '📷' },
  { name: '活动', emoji: '🎤' },
  { name: '亲亲', emoji: '💋' },
  { name: '抱抱', emoji: '🤗' },
  { name: '合照', emoji: '📸' },
  { name: '收藏', emoji: '⭐' },
]

// Demo set: 15 screenshots pulled from the user's weibo folder, grouped by category.
// Two photos are seeded on 07.21 of past years so the "去年今日" feature has
// content to show on July 21 (today). Replace with real upload dates over time.
export const initialPhotos: Photo[] = [
  { id: 1, title: '深圳湾演唱会', date: '2024.07.21', tag: '活动', src: import.meta.env.BASE_URL + 'demo/weibo/weibo-01.jpg', people: ['Lingling', 'Orm'], event: '深圳湾演唱会 2024', place: '深圳' },
  { id: 2, title: '返场安可', date: '2026.07.18', tag: '活动', src: import.meta.env.BASE_URL + 'demo/weibo/weibo-02.jpg', people: ['Lingling', 'Orm'], event: '2026 巡演·深圳', place: '深圳' },
  { id: 3, title: '签售现场', date: '2026.07.17', tag: '活动', src: import.meta.env.BASE_URL + 'demo/weibo/weibo-03.jpg', people: ['Lingling', 'Orm'], event: '签售会 2026', place: '北京' },
  { id: 4, title: '应援海洋', date: '2026.07.16', tag: '活动', src: import.meta.env.BASE_URL + 'demo/weibo/weibo-04.jpg', people: ['Lingling', 'Orm'], place: '深圳' },
  { id: 5, title: '甜蜜同框', date: '2026.07.15', tag: '亲亲', src: import.meta.env.BASE_URL + 'demo/weibo/weibo-05.jpg', people: ['Lingling', 'Orm'], place: '曼谷' },
  { id: 6, title: '后台比心', date: '2026.07.14', tag: '亲亲', src: import.meta.env.BASE_URL + 'demo/weibo/weibo-06.jpg', people: ['Lingling', 'Orm'] },
  { id: 7, title: '对视瞬间', date: '2025.07.21', tag: '亲亲', src: import.meta.env.BASE_URL + 'demo/weibo/weibo-07.jpg', people: ['Lingling', 'Orm'], event: '曼谷粉丝见面会', place: '曼谷' },
  { id: 8, title: '机场抱抱', date: '2026.07.12', tag: '抱抱', src: import.meta.env.BASE_URL + 'demo/weibo/weibo-08.jpg', people: ['Lingling', 'Orm'] },
  { id: 9, title: '庆功拥抱', date: '2026.07.11', tag: '抱抱', src: import.meta.env.BASE_URL + 'demo/weibo/weibo-09.jpg', people: ['Lingling', 'Orm'] },
  { id: 10, title: '温暖相拥', date: '2026.07.10', tag: '抱抱', src: import.meta.env.BASE_URL + 'demo/weibo/weibo-10.jpg', people: ['Lingling', 'Orm'] },
  { id: 11, title: '珍藏票根', date: '2026.07.09', tag: '收藏', src: import.meta.env.BASE_URL + 'demo/weibo/weibo-11.jpg', place: '曼谷' },
  { id: 12, title: '纪念合照', date: '2026.07.08', tag: '收藏', src: import.meta.env.BASE_URL + 'demo/weibo/weibo-12.jpg', place: '曼谷' },
  { id: 13, title: '同框花絮', date: '2026.07.07', tag: '合照', src: import.meta.env.BASE_URL + 'demo/weibo/weibo-13.jpg', people: ['Lingling', 'Orm'], event: '见面会' },
  { id: 14, title: '蹦迪现场', date: '2026.07.06', tag: '合照', src: import.meta.env.BASE_URL + 'demo/weibo/weibo-14.jpg', place: '上海' },
  { id: 15, title: '比心合集', date: '2026.07.05', tag: '合照', src: import.meta.env.BASE_URL + 'demo/weibo/weibo-15.jpg', people: ['Lingling', 'Orm'] },
]

// User uploads are persisted to localStorage and layered on top of the demo set.
function getUploads(): Photo[] {
  try {
    const list = JSON.parse(localStorage.getItem('lingorm_photos') || '[]') as Photo[]
    // Drop uploads stored as raw HEIC/HEIF in older builds — browsers can't
    // render them, so they show as broken images. They're unrecoverable.
    return list.filter((p) => !/^data:image\/(heic|heif)/i.test(p.dataUrl || ''))
  } catch {
    return []
  }
}

// Deleted photo IDs — stored so BOTH demo and uploaded photos can be removed.
const DELETED_KEY = 'lingorm_deleted'
const deletedCache: number[] = (() => {
  try {
    return JSON.parse(localStorage.getItem(DELETED_KEY) || '[]') as number[]
  } catch {
    return []
  }
})()

// 照片元信息覆盖层：允许给任意照片（含写死的 demo 照）追加/修改
// people / event / place 标记，从而让"按人物/活动/地点"搜索可用于所有照片。
const META_KEY = 'lingorm_photo_meta'
const metaCache: Record<string, Partial<Photo>> = (() => {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) || '{}') as Record<string, Partial<Photo>>
  } catch {
    return {}
  }
})()

// ---- 最近删除（暂缓区）----
const RECENTLY_DELETED_KEY = 'lingorm_recently_deleted'
const recentlyDeletedCache: RecentlyDeletedItem[] = (() => {
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_DELETED_KEY) || '[]') as RecentlyDeletedItem[]
  } catch {
    return []
  }
})()

export function getPhotoMeta(id: number): Partial<Photo> {
  return metaCache[String(id)] || {}
}

export function updatePhotoMeta(id: number, patch: Partial<Photo>): void {
  const cur = metaCache[String(id)] || {}
  const next = { ...cur, ...patch }
  metaCache[String(id)] = next
  try {
    localStorage.setItem(META_KEY, JSON.stringify(metaCache))
  } catch {
    /* noop */
  }
}

// Full ordered list: latest uploads first, then the demo photos (minus deleted),
// with any edited meta merged on top.
export function getPhotos(): Photo[] {
  const del = new Set(deletedCache)
  return [...getUploads(), ...initialPhotos]
    .filter((p) => !del.has(p.id))
    .map((p) => {
      const m = metaCache[String(p.id)]
      return m ? { ...p, ...m } : p
    })
}

// ---- 心动收藏 (favorites) ----
// Persisted as a Set of photo IDs in localStorage, so ANY photo can be
// favorited (not just those pre-tagged). Seeded with the two demo photos
// that were originally tagged 收藏 so the first-run count stays at 2.
const FAV_KEY = 'lingorm_favorites'
const FAV_SEED = [11, 12]

const favCache: number[] = (() => {
  try {
    const raw = localStorage.getItem(FAV_KEY)
    if (raw === null) {
      localStorage.setItem(FAV_KEY, JSON.stringify(FAV_SEED))
      return [...FAV_SEED]
    }
    return JSON.parse(raw) as number[]
  } catch {
    return [...FAV_SEED]
  }
})()

export function isFavorite(id: number): boolean {
  return favCache.includes(id)
}

export function getFavoriteIds(): number[] {
  return [...favCache]
}

// Toggle and return the new state. Persists to localStorage.
export function toggleFavorite(id: number): boolean {
  const next = favCache.includes(id)
    ? favCache.filter((x) => x !== id)
    : [...favCache, id]
  favCache.length = 0
  favCache.push(...next)
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(favCache))
  } catch {
    /* noop */
  }
  return favCache.includes(id)
}

// The actual "心动收藏" — photos whose id is in the favorites set.
export function getFavorites(): Photo[] {
  return getPhotos().filter((p) => favCache.includes(p.id))
}

// Recent favorites for the home "最近心动" rail: favorites first, then pad
// with the newest non-favorite photos up to `n` items, newest first.
export function getRecentFavorites(n = 3): Photo[] {
  const byDateDesc = (a: Photo, b: Photo) => b.date.localeCompare(a.date)
  const favs = getFavorites().sort(byDateDesc)
  if (favs.length >= n) return favs.slice(0, n)
  const others = getPhotos()
    .filter((p) => !favCache.includes(p.id))
    .sort(byDateDesc)
  return [...favs, ...others].slice(0, n)
}

// "去年今日" / on-this-day: photos sharing the same month-day (any year).
function monthDayOf(dateStr: string): string {
  const parts = dateStr.split('.')
  if (parts.length < 3) return ''
  return `${parts[1]}-${parts[2]}`
}

function todayMonthDay(): string {
  const d = new Date()
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getOnThisDayPhotos(md?: string): Photo[] {
  const key = md || todayMonthDay()
  return getPhotos().filter((p) => monthDayOf(p.date) === key)
}

// Photo stories — user-written emotional notes attached to a photo, keyed by id.
const STORY_KEY = 'lingorm_stories'

export function getPhotoStory(id: number): string {
  try {
    const map = JSON.parse(localStorage.getItem(STORY_KEY) || '{}') as Record<string, string>
    return map[String(id)] || ''
  } catch {
    return ''
  }
}

export function setPhotoStory(id: number, text: string): void {
  try {
    const map = JSON.parse(localStorage.getItem(STORY_KEY) || '{}') as Record<string, string>
    if (text.trim()) map[String(id)] = text.trim()
    else delete map[String(id)]
    localStorage.setItem(STORY_KEY, JSON.stringify(map))
  } catch {
    /* noop */
  }
}

// Move a photo to the recently-deleted buffer instead of wiping it immediately.
// Works for both demo and uploaded photos:
// 1) snapshot the photo (with merged meta) into recentlyDeletedCache
// 2) mark the id as deleted so it disappears from getPhotos()
// 3) if it was an upload, drop it from the uploads list to free storage
// 4) clean up its favorite flag and story note
export function deletePhoto(id: number): void {
  const photo = getPhotos().find((p) => p.id === id)
  const isUpload = getUploads().some((p) => p.id === id)
  if (photo && !recentlyDeletedCache.some((d) => d.photo.id === id)) {
    recentlyDeletedCache.unshift({ photo, deletedAt: Date.now(), isUpload })
    try {
      localStorage.setItem(RECENTLY_DELETED_KEY, JSON.stringify(recentlyDeletedCache))
    } catch {
      /* noop */
    }
  }
  if (!deletedCache.includes(id)) {
    deletedCache.push(id)
    try {
      localStorage.setItem(DELETED_KEY, JSON.stringify(deletedCache))
    } catch {
      /* noop */
    }
  }
  try {
    const uploads = JSON.parse(localStorage.getItem('lingorm_photos') || '[]') as Photo[]
    const filtered = uploads.filter((p) => p.id !== id)
    localStorage.setItem('lingorm_photos', JSON.stringify(filtered))
  } catch {
    /* noop */
  }
  if (favCache.includes(id)) toggleFavorite(id)
  try {
    const map = JSON.parse(localStorage.getItem(STORY_KEY) || '{}') as Record<string, string>
    if (map[String(id)]) {
      delete map[String(id)]
      localStorage.setItem(STORY_KEY, JSON.stringify(map))
    }
  } catch {
    /* noop */
  }
}

export function getRecentlyDeleted(): RecentlyDeletedItem[] {
  return [...recentlyDeletedCache]
}

export function restorePhoto(id: number): boolean {
  const i = recentlyDeletedCache.findIndex((d) => d.photo.id === id)
  if (i < 0) return false
  const item = recentlyDeletedCache[i]
  if (item.isUpload) {
    try {
      const uploads = JSON.parse(localStorage.getItem('lingorm_photos') || '[]') as Photo[]
      uploads.unshift(item.photo)
      localStorage.setItem('lingorm_photos', JSON.stringify(uploads))
    } catch {
      /* noop */
    }
  }
  const di = deletedCache.indexOf(id)
  if (di >= 0) {
    deletedCache.splice(di, 1)
    try {
      localStorage.setItem(DELETED_KEY, JSON.stringify(deletedCache))
    } catch {
      /* noop */
    }
  }
  recentlyDeletedCache.splice(i, 1)
  try {
    localStorage.setItem(RECENTLY_DELETED_KEY, JSON.stringify(recentlyDeletedCache))
  } catch {
    /* noop */
  }
  return true
}

export function permanentlyDeletePhoto(id: number): void {
  const i = recentlyDeletedCache.findIndex((d) => d.photo.id === id)
  if (i >= 0) {
    recentlyDeletedCache.splice(i, 1)
    try {
      localStorage.setItem(RECENTLY_DELETED_KEY, JSON.stringify(recentlyDeletedCache))
    } catch {
      /* noop */
    }
  }
  // keep the id in deletedCache so it stays hidden; uploads are already removed.
}

// ---- 已同步的 Google 日历事件名（供"按活动场次"搜索关联）----
// Calendar 页 OAuth 同步后把事件摘要写入这里，Album 搜索时即可把
// 照片的 event 字段与真实日历里的场次名关联起来。
const CAL_EVENTS_KEY = 'lingorm_gcal_events'

export function saveCalendarEvents(names: string[]): void {
  try {
    localStorage.setItem(CAL_EVENTS_KEY, JSON.stringify([...new Set(names.filter(Boolean))]))
  } catch {
    /* noop */
  }
}

export function getCalendarEventNames(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CAL_EVENTS_KEY) || '[]') as string[]
  } catch {
    return []
  }
}
