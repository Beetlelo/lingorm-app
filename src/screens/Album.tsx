import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { folders, getPhotos, isFavorite, getCalendarEventNames, getRecentlyDeleted, restorePhoto, permanentlyDeletePhoto, type Photo, type RecentlyDeletedItem } from '../lib/photos'
import { getMoods } from '../lib/moods'
import { getSavedSearches, saveSearch, deleteSavedSearch, type SavedSearch } from '../lib/savedSearches'

const grads = [
  'linear-gradient(135deg,#7C6CF0,#FF6FB5)',
  'linear-gradient(135deg,#9b8bfb,#7C6CF0)',
  'linear-gradient(135deg,#FF6FB5,#ff8fc7)',
  'linear-gradient(135deg,#7C6CF0,#9b8bfb)',
]

// 可搜索的分类标签
const TAGS = ['活动', '亲亲', '抱抱', '合照', '收藏']

// 快捷筛选（设为查询词，由解析器识别语义）
const QUICK = [
  { label: '全部', value: '' },
  { label: '本月', value: '本月' },
  { label: '今年', value: '今年' },
  { label: '有心情', value: '有心情' },
  { label: '收藏', value: '收藏' },
]

function parsePhotoDate(d?: string) {
  if (!d) return null
  const m = d.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/)
  return m ? { y: +m[1], m: +m[2], d: +m[3] } : null
}
function photoDateKey(d?: string) {
  const p = parsePhotoDate(d)
  if (!p) return ''
  return `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`
}

type ViewMode = 'list' | 'block' | 'waterfall'
const viewIcons: Record<ViewMode, string> = {
  list: 'M4 6h16M4 12h16M4 18h16',
  block: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  waterfall: 'M4 4h6v8H4zM12 4h8v5h-8zM4 14h6v6H4zM12 11h8v9h-8z',
}

const Thumb = ({ p, i, natural }: { p: Photo; i: number; natural?: boolean }) => {
  const cls = natural ? 'w-full h-auto block' : 'w-full h-full object-cover'
  const [err, setErr] = useState(false)
  if ((!p.src && !p.dataUrl) || err) {
    return <span className="w-full h-full block" style={{ background: grads[i % grads.length] }} />
  }
  const src = p.src || p.dataUrl
  return <img src={src} alt={p.title} loading="lazy" className={cls} onError={() => setErr(true)} />
}

const HeartBadge = ({ small }: { small?: boolean }) => (
  <span
    className={`absolute flex items-center justify-center rounded-full text-white shadow-md pointer-events-none ${
      small ? 'top-1 right-1 w-4 h-4 text-[8px]' : 'top-1.5 right-1.5 w-5 h-5 text-[10px]'
    }`}
    style={{ background: 'linear-gradient(135deg,#7C6CF0,#FF6FB5)' }}
    aria-label="已收藏"
  >
      ♥
  </span>
)

// 关键词高亮：把 query 中的 token 在文本里高亮（大小写不敏感）
function Highlight({ text, query }: { text: string; query: string }) {
  const tokens = query.trim().split(/\s+/).filter(Boolean).map((t) => t.toLowerCase())
  if (!text || tokens.length === 0) return <>{text}</>
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(${tokens.map(esc).join('|')})`, 'gi')
  const parts = text.split(re)
  return (
    <>
      {parts.map((part, i) =>
        tokens.includes(part.toLowerCase()) ? (
          <mark key={i} className="bg-[var(--color-accent-primary)] text-white rounded-[4px] px-0.5 font-semibold">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

export default function Album() {
  const nav = useNavigate()
  const location = useLocation()
  const incoming = (location.state as { filter?: string; query?: string } | null) || {}
  const [active, setActive] = useState(incoming.filter || '全部')
  const [view, setView] = useState<ViewMode>('block')
  const [query, setQuery] = useState(incoming.query || '')
  const [saved, setSaved] = useState<SavedSearch[]>(() => getSavedSearches())
  const [photos, setPhotos] = useState<Photo[]>(() => getPhotos())
  const [deleted, setDeleted] = useState<RecentlyDeletedItem[]>(() => getRecentlyDeleted())
  const [showDeleted, setShowDeleted] = useState(false)
  const moods = getMoods()
  const calNames = getCalendarEventNames() // 已同步的 Google 场次名，供按活动搜索关联
  const galleryRef = useRef<HTMLDivElement>(null)

  // Re-sync when returning from another screen (e.g. after an upload or restore).
  useEffect(() => {
    setPhotos(getPhotos())
    setDeleted(getRecentlyDeleted())
  }, [])

  const match = (p: Photo) => {
    if (active === '全部') return true
    if (active === '收藏') return isFavorite(p.id)
    return p.tag === active
  }

  // ---- 强大搜索：模糊 + 精准，覆盖 时间 / 分类 / 心情 / 收藏 / 关键词 ----
  const now = new Date()
  const moodMatches = (token: string) =>
    moods.filter((m) => m.emoji.includes(token) || (m.text || '').toLowerCase().includes(token.toLowerCase()))

  const matchToken = (p: Photo, token: string): boolean => {
    const t = token.trim().toLowerCase()
    if (!t) return true
    // 收藏
    if (t === '收藏' || t === '♥' || t === 'fav' || t === 'favorite') return isFavorite(p.id)
    // 心情记录（emoji 或文字匹配）
    if (t === '有心情' || t === '心情') {
      const dk = photoDateKey(p.date)
      return moods.some((m) => m.photoId === p.id || m.date === dk)
    }
    // 相对时间
    if (t === '今年') return parsePhotoDate(p.date)?.y === now.getFullYear()
    if (t === '本月' || t === '这个月') {
      const d = parsePhotoDate(p.date)
      return !!d && d.y === now.getFullYear() && d.m === now.getMonth() + 1
    }
    if (t === '今天' || t === '今日') {
      const d = parsePhotoDate(p.date)
      return !!d && d.y === now.getFullYear() && d.m === now.getMonth() + 1 && d.d === now.getDate()
    }
    // 精准：4 位年份
    const ym = t.match(/^(\d{4})$/)
    if (ym) return parsePhotoDate(p.date)?.y === +ym[1]
    // 精准：X月
    const mm = t.match(/^(\d{1,2})月$/)
    if (mm) return parsePhotoDate(p.date)?.m === +mm[1]
    // 精准：X日
    const dm = t.match(/^(\d{1,2})日$/)
    if (dm) return parsePhotoDate(p.date)?.d === +dm[1]
    // 精准：分类标签
    if ((TAGS as string[]).includes(token)) return p.tag === token
    // 人物：任一人物名包含该词（如 Lingling / Orm）
    if ((p.people || []).some((n) => n.toLowerCase().includes(t))) return true
    // 活动场次：照片 event 字段命中，或与已同步 Google 日历事件名关联
    if (p.event && p.event.toLowerCase().includes(t)) return true
    if (calNames.some((n) => n.toLowerCase().includes(t) && p.event && (p.event === n || n.includes(p.event)))) return true
    // 地点：店铺 / 城市
    if (p.place && p.place.toLowerCase().includes(t)) return true
    // 模糊：心情（emoji/文字）命中后，关联到该心情的照片（按关联或同日期）
    const hits = moodMatches(token)
    if (hits.length) {
      const dk = photoDateKey(p.date)
      return hits.some((m) => m.photoId === p.id || m.date === dk)
    }
    // 模糊：标题 + 标签 + 人物 + 活动 + 地点 子串
    const hay = `${p.title} ${p.tag} ${(p.people || []).join(' ')} ${p.event || ''} ${p.place || ''}`.toLowerCase()
    return hay.includes(t)
  }

  const matchQuery = (p: Photo): boolean =>
    query.trim().split(/\s+/).filter(Boolean).every((tok) => matchToken(p, tok))

  const list = photos.filter((p) => match(p) && matchQuery(p))

  // 搜索命中原因的提示（地点/人物/活动/分类/时间），用于在列表中解释为何出现
  const matchedHints = (p: Photo): { label: string; value: string }[] => {
    const tokens = query.trim().split(/\s+/).filter(Boolean)
    if (!tokens.length) return []
    const hit = (s?: string) => !!s && tokens.some((t) => s.toLowerCase().includes(t.toLowerCase()))
    const out: { label: string; value: string }[] = []
    if (hit(p.place)) out.push({ label: '地点', value: p.place! })
    const peopleHit = (p.people || []).filter((n) => hit(n))
    if (peopleHit.length) out.push({ label: '人物', value: peopleHit.join('、') })
    if (hit(p.event)) out.push({ label: '活动', value: p.event! })
    if (p.tag && tokens.includes(p.tag)) out.push({ label: '分类', value: p.tag })
    const d = parsePhotoDate(p.date)
    if (d && tokens.some((t) => t === String(d.y) || t === `${d.m}月` || t === `${d.d}日`))
      out.push({ label: '时间', value: p.date! })
    return out
  }

  // 当前搜索结果中出现的分类，用于"结果内筛选"chips
  const resultTags = query.trim()
    ? Array.from(new Set(list.map((p) => p.tag).filter(Boolean) as string[]))
    : []

  const goCategory = (name: string) => {
    const key = name === '全部照片' ? '全部' : name
    setActive(key)
    setShowDeleted(false)
    galleryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const openBrowse = (index: number) => {
    nav('/browse', { state: { photos: list, index } })
  }

  // ---- 保存的搜索 / 智能相册 ----
  const persistSaved = () => {
    const name = query.trim() || active
    if (!name) return
    setSaved(saveSearch({ name, query: query.trim(), cat: active }))
  }
  const applySaved = (s: SavedSearch) => {
    setQuery(s.query)
    setActive(s.cat)
    galleryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const removeSaved = (name: string) => setSaved(deleteSavedSearch(name))

  return (
    <div className="-mt-1">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-[24px] font-bold text-glass-strong leading-tight">相册分类</h1>
      </div>

      {!showDeleted && (
        <>
          {/* Search + Filter */}
          <div className="glass-strong flex items-center gap-2 px-4 py-3 rounded-[12px] mb-2">
        <svg className="w-[18px] h-[18px] text-glass-soft shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索：时间 / 分类 / 心情 / 关键词…"
          className="flex-1 min-w-0 bg-transparent outline-none text-[14px] text-glass-strong placeholder:text-glass-soft"
          aria-label="搜索"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-glass opacity-60 text-[14px] active:scale-90 transition shrink-0"
            aria-label="清除搜索"
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick filter chips */}
      <div className="flex gap-2 mb-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {QUICK.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => setQuery(q.value)}
            className={`shrink-0 px-3 py-1.5 rounded-[12px] text-[12px] transition active:scale-95 ${
              query === q.value ? 'text-white font-medium' : 'text-glass-soft'
            }`}
            style={query === q.value ? { background: 'var(--color-accent-primary)' } : { background: 'rgba(255,255,255,0.08)' }}
          >
            {q.label}
          </button>
        ))}
        <button
          type="button"
          onClick={persistSaved}
          disabled={!query.trim() && active === '全部'}
          className="shrink-0 px-3 py-1.5 rounded-[12px] text-[12px] text-accent border border-[var(--color-accent-primary)]/40 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ＋ 存为相册
        </button>
        <button
          type="button"
          onClick={() => setShowDeleted(true)}
          className={`shrink-0 px-3 py-1.5 rounded-[12px] text-[12px] active:scale-95 transition ${
            showDeleted ? 'text-white' : 'text-glass-soft'
          }`}
          style={showDeleted ? { background: 'var(--color-accent-primary)' } : { background: 'rgba(255,255,255,0.08)' }}
        >
          🗑 回收站 ({deleted.length})
        </button>
      </div>
      <p className="text-[11px] text-glass opacity-50 mb-3 -mt-0.5">
        模糊+精准：年份(2024) · 月份(7月) · 分类(合照) · 人物(Lingling/Orm) · 活动场次 · 地点(深圳/曼谷) · 心情(emoji或文字) · 收藏 · 多词空格组合
      </p>

      {/* 保存的搜索 / 智能相册 */}
      {saved.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {saved.map((s) => (
            <span key={s.name} className="shrink-0 flex items-center gap-1 pl-3 pr-1.5 py-1.5 rounded-[12px] text-[12px] text-glass-strong" style={{ background: 'rgba(124,108,240,0.14)' }}>
              <button type="button" onClick={() => applySaved(s)} className="active:scale-95 transition text-left">
                ★ {s.name}
              </button>
              <button
                type="button"
                onClick={() => removeSaved(s.name)}
                className="text-glass opacity-60 hover:opacity-100 active:scale-90 transition"
                aria-label={`删除智能相册 ${s.name}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
          </>
      )}

      {showDeleted ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[16px] font-semibold text-glass-strong">
              回收站 <span className="text-[12px] text-glass opacity-50 font-normal">({deleted.length})</span>
            </h2>
            <button
              type="button"
              onClick={() => setShowDeleted(false)}
              className="text-[12px] text-glass opacity-80 hover:text-glass-strong active:scale-95 transition"
            >
              返回相册
            </button>
          </div>
          {deleted.length === 0 && (
            <div className="glass rounded-card p-8 text-center text-glass opacity-70">回收站是空的</div>
          )}
          <div className="space-y-2.5">
            {deleted.map((item, i) => (
              <div
                key={item.photo.id}
                className="glass rounded-card p-2.5 flex items-center gap-3"
              >
                <span className="relative w-16 h-16 rounded-[12px] overflow-hidden shrink-0">
                  <Thumb p={item.photo} i={i} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] font-medium text-glass-strong truncate">
                    {item.photo.title || item.photo.tag}
                  </span>
                  <span className="block text-[11px] text-glass opacity-60 font-mono">{item.photo.date}</span>
                  <span className="block text-[11px] text-glass opacity-50 mt-0.5">
                    删除于 {new Date(item.deletedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </span>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      restorePhoto(item.photo.id)
                      setPhotos(getPhotos())
                      setDeleted(getRecentlyDeleted())
                    }}
                    className="px-3 py-1.5 rounded-[10px] text-[12px] text-white font-medium active:scale-95 transition"
                    style={{ background: 'var(--color-success)' }}
                  >
                    恢复
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      permanentlyDeletePhoto(item.photo.id)
                      setDeleted(getRecentlyDeleted())
                    }}
                    className="px-3 py-1.5 rounded-[10px] text-[12px] text-white font-medium active:scale-95 transition"
                    style={{ background: 'var(--color-error)' }}
                  >
                    彻底删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Folders (3-col grid) — tap to filter gallery */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {folders.map((f) => (
              <button
                key={f.name}
                type="button"
                onClick={() => goCategory(f.name)}
                className="glass-strong flex flex-col items-center justify-center gap-1.5 p-3 rounded-card text-center card-lift active:scale-[0.98] transition"
              >
                <span className="w-9 h-9 rounded-xl flex items-center justify-center text-[18px] glass shrink-0">
                  {f.emoji}
                </span>
                <span className="text-[12px] font-medium text-glass-strong leading-tight">{f.name}</span>
              </button>
            ))}
          </div>

          {/* Gallery with view switcher */}
          <div ref={galleryRef} className="scroll-mt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[16px] font-semibold text-glass-strong">照片陈列 <span className="text-[12px] text-glass opacity-50 font-normal">({list.length})</span></h2>
              {/* View mode segmented */}
              <div className="glass-pill flex items-center p-1 rounded-full">
                {(['list', 'block', 'waterfall'] as ViewMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-label={m}
                    aria-pressed={view === m}
                    onClick={() => setView(m)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition active:scale-90 ${
                      view === m ? 'text-white' : 'text-glass-soft'
                    }`}
                    style={view === m ? { background: 'var(--color-accent-primary)' } : undefined}
                  >
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={viewIcons[m]} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* 结果内筛选 chips：搜索后按分类二次过滤 */}
            {query.trim() && resultTags.length > 1 && (
              <div className="flex items-center gap-2 mb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                <span className="shrink-0 text-[12px] text-glass opacity-60">结果中：</span>
                {resultTags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActive(active === t ? '全部' : t)}
                    className={`shrink-0 px-3 py-1.5 rounded-[12px] text-[12px] transition active:scale-95 ${
                      active === t ? 'text-white font-medium' : 'text-glass-soft'
                    }`}
                    style={active === t ? { background: 'var(--color-accent-primary)' } : { background: 'rgba(255,255,255,0.08)' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            {list.length === 0 && (
              <div className="glass rounded-card p-8 text-center">
                {query.trim() ? (
                  <>
                    <div className="text-[32px] mb-2 opacity-80">🔍</div>
                    <p className="text-glass-strong font-medium">没有找到「{query.trim()}」相关的照片</p>
                    <p className="text-[12px] text-glass opacity-60 mt-1">换个关键词，或清除搜索看看全部照片</p>
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="mt-3 px-4 py-2 rounded-[12px] text-[13px] text-white font-medium active:scale-95 transition"
                      style={{ background: 'var(--color-accent-primary)' }}
                    >
                      清除搜索
                    </button>
                  </>
                ) : (
                  <p className="text-glass opacity-70">该分类下还没有照片</p>
                )}
              </div>
            )}

            {/* LIST */}
            {view === 'list' && list.length > 0 && (
              <div className="space-y-2.5">
                {list.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => openBrowse(i)}
                    className="glass w-full flex items-center gap-3 p-2.5 rounded-card text-left card-lift active:scale-[0.99] transition"
                  >
                    <span className="relative w-16 h-16 rounded-[12px] overflow-hidden shrink-0">
                      <Thumb p={p} i={i} />
                      {isFavorite(p.id) && <HeartBadge small />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[15px] font-medium text-glass-strong truncate"><Highlight text={p.title || p.tag} query={query} /></span>
                      <span className="block text-[12px] text-glass opacity-70 font-mono mt-0.5">{p.date}</span>
                      {query.trim() && matchedHints(p).length > 0 && (
                        <span className="block text-[11px] text-glass opacity-70 mt-0.5">
                          {matchedHints(p).map((h, hi) => (
                            <span key={hi} className="mr-2">
                              {h.label}·<Highlight text={h.value} query={query} />
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <span className="glass px-2 py-0.5 rounded-[8px] text-[11px] text-glass-strong"><Highlight text={p.tag} query={query} /></span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* BLOCK (square grid) */}
            {view === 'block' && list.length > 0 && (
              <div className="grid grid-cols-3 gap-2.5">
                {list.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => openBrowse(i)}
                    className="glass rounded-card overflow-hidden text-left card-lift active:scale-95 transition"
                  >
                    <span className="relative aspect-square block w-full overflow-hidden">
                      <Thumb p={p} i={i} />
                      {isFavorite(p.id) && <HeartBadge />}
                    </span>
                    <span className="block px-2 py-1.5 text-[12px] text-glass-strong truncate"><Highlight text={p.title || p.tag} query={query} /></span>
                  </button>
                ))}
              </div>
            )}

            {/* WATERFALL (masonry) — uses each image's natural aspect ratio */}
            {view === 'waterfall' && list.length > 0 && (
              <div className="columns-2 gap-2.5" style={{ columnFill: 'balance' }}>
                {list.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => openBrowse(i)}
                    className="glass rounded-card overflow-hidden text-left card-lift active:scale-95 transition block w-full mb-2.5 break-inside-avoid"
                  >
                    <span className="relative block w-full overflow-hidden bg-white/5">
                      <Thumb p={p} i={i} natural />
                      {isFavorite(p.id) && <HeartBadge />}
                    </span>
                    <span className="block px-2 py-1.5 text-[12px] text-glass-strong truncate"><Highlight text={p.title || p.tag} query={query} /></span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
