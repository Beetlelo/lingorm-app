import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getPhotos } from '../lib/photos'
import { addMood, dateKey, type Mood } from '../lib/moods'

const MOODS = ['😍', '🥰', '😭', '🤩', '😌', '💪', '✨', '🥺']
const MOOD_LABELS: Record<string, string> = {
  '😍': '超爱', '🥰': '心动', '😭': '破防', '🤩': '上头', '😌': '治愈', '💪': '加油', '✨': '惊喜', '🥺': '心疼',
}

type Props = {
  date: Date
  initial?: Mood
  onClose: () => void
  onSaved: () => void
}

export default function MoodModal({ date, initial, onClose, onSaved }: Props) {
  const [emoji, setEmoji] = useState(initial?.emoji || '')
  const [text, setText] = useState(initial?.text || '')
  const [photoId, setPhotoId] = useState<number | undefined>(initial?.photoId)
  const [saved, setSaved] = useState(false)

  const photos = getPhotos().slice(0, 12)
  const label = `${date.getMonth() + 1}月${date.getDate()}日`

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function save() {
    if (!emoji && !text.trim()) {
      onClose()
      return
    }
    addMood({ date: dateKey(date), emoji, text: text.trim(), photoId })
    setSaved(true)
    setTimeout(() => {
      onSaved()
      onClose()
    }, 600)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="记录心情"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      <div
        className="relative w-full glass rounded-t-[28px] p-5 pb-8 border-t border-white/10"
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[17px] font-semibold text-glass-strong">记录 {label} 的心情</h3>
            {initial && <p className="text-[11px] text-accent opacity-80 mt-0.5">今天已记录 · 可修改</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="w-8 h-8 rounded-full bg-transparent border border-white/40 flex items-center justify-center text-glass-strong active:scale-95 transition"
          >
            ✕
          </button>
        </div>

        <p className="text-[13px] text-glass opacity-70 mb-2">今天看 Lingorm 是什么心情？</p>
        <div className="flex flex-wrap gap-2 mb-1">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setEmoji(m)}
              aria-label={`心情 ${m}`}
              className={`w-10 h-10 rounded-full text-[20px] flex items-center justify-center transition-transform duration-200 active:scale-90 ${
                emoji === m ? 'ring-2 ring-[var(--color-accent-primary)] bg-white/10 scale-110' : 'bg-transparent border border-white/40 hover:scale-105'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        {emoji && MOOD_LABELS[emoji] && (
          <p className="text-[13px] text-accent font-medium mb-3">{MOOD_LABELS[emoji]}</p>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={120}
          placeholder="写一句话，记录此刻的心情…"
          className="w-full h-20 rounded-[14px] p-3 text-[14px] text-glass-strong bg-transparent border-white/40 outline-none resize-none placeholder:text-glass/50 focus:border-[var(--color-accent-primary)] transition"
        />
        <div className="flex justify-end mt-1">
          <span className="text-[11px] text-glass opacity-50">{text.length}/120</span>
        </div>

        <p className="text-[12px] text-glass opacity-60 mt-3 mb-1.5">关联一张照片（可选）</p>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button
            type="button"
            onClick={() => setPhotoId(undefined)}
            className={`shrink-0 w-12 h-12 rounded-[8px] flex items-center justify-center text-[11px] text-glass opacity-70 border ${
              photoId === undefined ? 'border-[var(--color-accent-primary)]' : 'border-white/15'
            }`}
          >
            不关联
          </button>
          {photos.map((p) => {
            const url = p.src || p.dataUrl
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPhotoId(p.id)}
                className={`shrink-0 w-12 h-12 rounded-[8px] overflow-hidden ${photoId === p.id ? 'ring-2 ring-[var(--color-accent-primary)]' : ''}`}
              >
                {url ? (
                  <img src={url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="block w-full h-full bg-white/10 flex items-center justify-center text-[10px] text-glass opacity-60">无图</span>
                )}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saved}
          className="w-full mt-5 py-3 rounded-[16px] text-white text-[15px] font-medium active:scale-[0.99] transition disabled:opacity-90"
          style={{ background: 'var(--color-accent-primary)' }}
        >
          {saved ? '已保存 ✓' : '保存心情'}
        </button>
      </div>
    </div>,
    document.body,
  )
}
