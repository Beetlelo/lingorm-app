import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  getPhotos,
  getPhotoStory,
  setPhotoStory,
  isFavorite,
  toggleFavorite,
  deletePhoto,
  getPhotoMeta,
  updatePhotoMeta,
  type Photo,
} from '../lib/photos'

const thumbs = [
  'linear-gradient(135deg,#7C6CF0,#FF6FB5)',
  'linear-gradient(135deg,#4d80f2,#7C6CF0)',
  'linear-gradient(135deg,#FF6FB5,#ff8fc7)',
  'linear-gradient(135deg,#33ccb3,#4d80f2)',
  'linear-gradient(135deg,#f2a833,#FF6FB5)',
]

export default function Browse() {
  const nav = useNavigate()
  const location = useLocation()
  const incoming = (location.state as { photos?: Photo[]; index?: number } | null) || {}

  const [photos, setPhotos] = useState<Photo[]>(incoming.photos?.length ? incoming.photos : getPhotos())
  const [idx, setIdx] = useState(incoming.index ?? 2)
  const [fav, setFav] = useState(false)
  const [shared, setShared] = useState(false)
  const [story, setStory] = useState('')
  const [savedStory, setSavedStory] = useState('')
  const [confirmDel, setConfirmDel] = useState(false)
  // 人物 / 活动 / 地点 标记（可编辑，写入 meta 覆盖层）
  const [peopleStr, setPeopleStr] = useState('')
  const [eventStr, setEventStr] = useState('')
  const [placeStr, setPlaceStr] = useState('')
  const [metaSaved, setMetaSaved] = useState(false)

  const total = photos.length
  const photo = photos[idx]

  // 左右滑动手势（仅在图片区触发，不会误触下面的功能）
  const touchStartX = useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return
    const dx = touchStartX.current - e.changedTouches[0].screenX
    touchStartX.current = null
    if (Math.abs(dx) < 40) return
    if (dx > 0) next()
    else prev()
  }

  // Load the saved story, favorite state and editable meta whenever the photo changes.
  useEffect(() => {
    if (!photo) return
    const s = getPhotoStory(photo.id)
    setStory(s)
    setSavedStory(s)
    setFav(isFavorite(photo.id))
    const m = getPhotoMeta(photo.id)
    setPeopleStr((m.people || []).join('、'))
    setEventStr(m.event || '')
    setPlaceStr(m.place || '')
    setMetaSaved(false)
  }, [idx, photo?.id])

  const prev = () => setIdx((i) => (i - 1 + total) % total)
  const next = () => setIdx((i) => (i + 1) % total)

  const handleDelete = () => {
    if (!photo) return
    const id = photo.id
    deletePhoto(id)
    const remaining = photos.filter((p) => p.id !== id)
    if (remaining.length === 0) {
      setConfirmDel(false)
      nav('/album')
      return
    }
    setPhotos(remaining)
    setIdx((i) => Math.min(i, remaining.length - 1))
    setConfirmDel(false)
  }

  const imageUrl = photo?.src || photo?.dataUrl

  return (
    <div className="relative -mx-4 -mb-24">
      {/* ① 顶部工具栏：页面的一部分，不浮在照片上 */}
      <div className="relative z-20 shrink-0 flex items-center justify-between px-4 pt-3 pb-2">
        <button
          onClick={() => nav(-1)}
          aria-label="返回"
          className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white text-[20px] active:scale-95 transition"
        >
          ‹
        </button>
        <span className="text-[14px] font-mono text-glass-strong drop-shadow">{idx + 1} / {total}</span>
        <button
          aria-label="更多"
          className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white text-[18px] active:scale-95 transition"
        >
          ⋯
        </button>
      </div>

      {/* ② 上部：图片区域（按图片原比例自然撑高，不裁剪、不叠 UI） */}
      <div
        className="relative z-10 flex items-center justify-center bg-[rgba(7,6,15,0.55)]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {imageUrl ? (
          <img
            key={photo.id}
            src={imageUrl}
            alt={photo.title}
            className="max-w-full h-auto object-contain"
            draggable={false}
          />
        ) : (
          <span className="block w-full h-full" style={{ background: thumbs[idx % thumbs.length] }} />
        )}

        {/* 左右切换按钮：落在图片区两侧，半透明，不框住/不遮挡照片 */}
        <button
          onClick={prev}
          aria-label="上一张"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center text-white text-[22px] active:scale-95 transition"
        >
          ‹
        </button>
        <button
          onClick={next}
          aria-label="下一张"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center text-white text-[22px] active:scale-95 transition"
        >
          ›
        </button>
      </div>

      {/* ③ 下部：功能面板（透明无卡片，与页面自然连通） */}
      <div className="relative z-20 px-4 pt-4 pb-8 space-y-3">
        {/* 日期与标签 */}
        <div>
          <p className="text-[13px] text-glass-strong">
            {photo?.date || '2026.07.19'} <span className="opacity-50 mx-1">·</span>{' '}
            <span className="text-glass opacity-80">{photo?.title || '深圳湾体育中心'}</span>
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {(photo?.tag ? [photo.tag] : ['演唱会', '返场', '约会']).map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-[10px] text-[12px] text-glass-strong"
                style={{ background: 'rgba(124,108,240,0.28)' }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* 横向缩略图条 —— 无框、透明、可完整横向滚动 */}
        <div className="-mx-4 px-4 flex gap-2 overflow-x-auto py-1" style={{ scrollbarWidth: 'none' }}>
          {photos.map((p, i) => {
            const url = p.src || p.dataUrl
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setIdx(i)}
                className={`shrink-0 w-12 h-12 rounded-[10px] overflow-hidden transition ${
                  i === idx ? 'ring-2 ring-[var(--color-accent-primary)] scale-105' : 'opacity-80 hover:opacity-100'
                }`}
              >
                {url ? (
                  <img src={url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="block w-full h-full" style={{ background: thumbs[i % thumbs.length] }} />
                )}
              </button>
            )
          })}
        </div>

        {/* 操作栏：无卡片背景，按钮直接铺在页面上 */}
        <div className="flex items-center justify-between px-1 py-1">
          <div className="flex gap-5 px-3">
            <button
              onClick={() => photo && setFav(toggleFavorite(photo.id))}
              className="flex flex-col items-center active:scale-95 transition"
              style={{ color: fav ? 'var(--color-accent-pink)' : 'var(--text-glass)', opacity: fav ? 1 : 0.8 }}
              aria-pressed={fav}
              aria-label={fav ? '取消收藏' : '收藏'}
            >
              <span className="text-[17px]">{fav ? '♥' : '♡'}</span>
              <span className="text-[11px] mt-0.5">{fav ? '已收藏' : '收藏'}</span>
            </button>
            <button
              onClick={() => setShared(true)}
              className="flex flex-col items-center text-glass opacity-80 active:scale-95 transition"
            >
              <span className="text-[17px]">↗</span>
              <span className="text-[11px] mt-0.5">{shared ? '已分享' : '分享'}</span>
            </button>
            <button
              onClick={() => setConfirmDel(true)}
              className="flex flex-col items-center text-glass opacity-80 active:scale-95 transition"
              aria-label="删除"
            >
              <span className="text-[17px]">🗑</span>
              <span className="text-[11px] mt-0.5">删除</span>
            </button>
          </div>
          <button
            onClick={() => nav('/categorize')}
            className="px-4 py-2 rounded-[14px] text-white text-[13px] font-medium active:scale-95 transition"
            style={{ background: 'var(--color-accent-primary)' }}
          >
            快速归类
          </button>
        </div>

        {/* 删除确认 */}
        {confirmDel && (
          <div className="bg-black/45 rounded-[16px] p-3 flex items-center justify-between gap-3">
            <span className="text-[13px] text-glass-strong">删除这张照片？将移入最近删除</span>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmDel(false)}
                className="px-3 py-2 rounded-[12px] text-[13px] text-glass active:scale-95 transition"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-[12px] text-[13px] text-white font-medium active:scale-95 transition"
                style={{ background: '#ef4444' }}
              >
                删除
              </button>
            </div>
          </div>
        )}

        {/* 故事卡片：Browse 专用透明 + 白边框；左右撑满与上方图片齐平 */}
        <div className="-mx-4 rounded-card overflow-hidden glass-browse">
          <div className="flex items-center justify-between px-3 pt-3 pb-2">
            <p className="text-[13px] font-medium text-glass-strong">📖 这张照片的故事</p>
            <span className="text-[11px] text-glass opacity-50">{story.length}/300</span>
          </div>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            maxLength={300}
            placeholder="写下这张照片背后的故事，留给未来的自己…"
            className="w-full min-h-[84px] px-3 pb-3 text-[13px] text-glass-strong bg-transparent border-0 outline-none resize-none placeholder:text-glass/50 focus:ring-0"
          />
          <div className="flex items-center justify-between px-3 py-2 border-t border-white/10">
            {savedStory && savedStory !== story ? (
              <span className="text-[11px] text-accent">● 有未保存的修改</span>
            ) : savedStory ? (
              <span className="text-[11px] text-glass opacity-50">已保存</span>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => {
                setPhotoStory(photo.id, story)
                setSavedStory(story)
              }}
              className="px-4 py-2 rounded-[14px] text-white text-[13px] font-medium active:scale-95 transition"
              style={{ background: 'var(--color-accent-primary)' }}
            >
              保存故事
            </button>
          </div>
          {savedStory && (
            <div className="px-3 pb-3 pt-2 border-t border-white/10">
              <p className="text-[12px] text-glass opacity-90 whitespace-pre-wrap leading-relaxed">{savedStory}</p>
            </div>
          )}
        </div>

        {/* 标记：Browse 专用透明 + 白边框；左右撑满与上方图片齐平 */}
        <div className="-mx-4 rounded-card p-3 space-y-2.5 glass-browse">
          <p className="text-[13px] font-medium text-glass-strong">🏷 标记（便于日后搜索）</p>
          <MetaField
            label="人物"
            placeholder="如 Lingling、Orm（顿号或逗号分隔）"
            value={peopleStr}
            onChange={setPeopleStr}
          />
          <MetaField label="活动场次" placeholder="如 深圳湾演唱会 2024" value={eventStr} onChange={setEventStr} />
          <MetaField label="地点" placeholder="如 深圳 / 曼谷 / 某店铺" value={placeStr} onChange={setPlaceStr} />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!photo) return
                const people = peopleStr
                  .split(/[、,，\s]+/)
                  .map((s) => s.trim())
                  .filter(Boolean)
                updatePhotoMeta(photo.id, {
                  people: people.length ? people : undefined,
                  event: eventStr.trim() || undefined,
                  place: placeStr.trim() || undefined,
                })
                setMetaSaved(true)
              }}
              className="px-4 py-2 rounded-[14px] text-white text-[13px] font-medium active:scale-95 transition"
              style={{ background: 'var(--color-accent-primary)' }}
            >
              保存标记
            </button>
          </div>
          {metaSaved && <p className="text-[11px] text-accent">● 标记已保存，可在相册搜索（如 Orm / 深圳 / 演唱会）</p>}
        </div>
      </div>
    </div>
  )
}

function MetaField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <span className="text-[11px] text-glass opacity-70">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full mt-1 px-3 py-2.5 rounded-[12px] text-[13px] text-glass-strong bg-transparent border border-white/40 outline-none placeholder:text-glass/40 focus:border-[var(--color-accent-primary)] transition"
      />
    </label>
  )
}
