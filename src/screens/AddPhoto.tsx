import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fileToDataURL } from '../lib/image'

type PendingFile = {
  file: File
  dataUrl: string
  tag: string
  people: string
  event: string
  place: string
}

const tags = ['活动', '亲亲', '抱抱', '合照', '收藏']

const LS_KEY = 'lingorm_photos'

export default function AddPhoto() {
  const nav = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<PendingFile[]>([])
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showMore, setShowMore] = useState(false)

  const handleFiles = async (selected: FileList | null) => {
    if (!selected) return
    for (const file of Array.from(selected)) {
      if (!file.type.startsWith('image/')) continue
      try {
        // 压缩并转成 JPEG，HEIC/大图都不会再裂
        const dataUrl = await fileToDataURL(file)
        setItems((prev) => [
          ...prev,
          {
            file,
            dataUrl,
            tag: '活动',
            people: '',
            event: '',
            place: '',
          },
        ])
      } catch {
        // 不支持的格式（如部分 HEIC）静默跳过，避免存进裂图
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const updateTag = (idx: number, tag: string) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, tag } : it)))
  }

  const updateField = (idx: number, key: 'people' | 'event' | 'place', value: string) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: value } : it)))
  }

  const remove = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const save = () => {
    if (items.length === 0) return
    const newPhotos = items.map((it, i) => {
      const people = it.people
        .split(/[、,，\s]+/)
        .map((s) => s.trim())
        .filter(Boolean)
      return {
        id: Date.now() + i,
        title: '',
        date: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.'),
        tag: it.tag === '全部' ? '收藏' : it.tag,
        dataUrl: it.dataUrl,
        h: 160 + Math.floor(Math.random() * 60),
        people: people.length ? people : undefined,
        event: it.event.trim() || undefined,
        place: it.place.trim() || undefined,
      }
    })
    try {
      const existing = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
      localStorage.setItem(LS_KEY, JSON.stringify([...newPhotos, ...existing]))
    } catch {
      setSaveError('保存失败：本地存储空间不足，请删除部分旧照片后再试')
      return
    }
    setSaved(true)
    setTimeout(() => nav('/album'), 800)
  }

  return (
    <div className="-mt-1">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-bold text-glass-strong">添加照片</h1>
        <button
          type="button"
          onClick={() => nav(-1)}
          className="w-10 h-10 rounded-full glass flex items-center justify-center text-glass-strong active:scale-95 transition"
          aria-label="关闭"
        >
          ✕
        </button>
      </div>

      {saved ? (
        <div className="glass-strong rounded-card p-8 text-center">
          <p className="text-[40px] mb-2">🎉</p>
          <p className="text-[15px] font-medium text-glass-strong">已保存 {items.length} 张照片</p>
          <p className="text-[12px] text-glass opacity-70 mt-1">即将跳转回相册…</p>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full glass-strong rounded-card p-6 flex flex-col items-center justify-center gap-3 active:scale-[0.99] transition"
          >
            <span className="text-[40px]">📤</span>
            <p className="text-[15px] font-medium text-glass-strong">点击选择照片</p>
            <p className="text-[12px] text-glass opacity-60">支持 JPG / PNG / HEIC（自动压缩为清晰小图）</p>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {items.length > 0 && (
            <div className="mt-5 space-y-3">
              <p className="text-[14px] text-glass-strong">已选 {items.length} 张</p>
              {items.map((it, idx) => (
                <div key={idx} className="glass rounded-card p-3 flex gap-3">
                  <img
                    src={it.dataUrl}
                    alt=""
                    className="w-16 h-16 rounded-[12px] object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-[12px] text-glass opacity-60">选择分类标签，方便日后查找</p>
                    <div className="flex gap-2 flex-wrap">
                      {tags.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => updateTag(idx, t)}
                          className={`px-2.5 py-1 rounded-[10px] text-[11px] transition active:scale-95 ${
                            it.tag === t ? 'text-white' : 'glass text-glass-strong'
                          }`}
                          style={it.tag === t ? { background: 'var(--color-accent-primary)' } : undefined}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMore((v) => !v)}
                      className="text-[11px] text-accent active:scale-95 transition"
                    >
                      {showMore ? '▴ 收起更多标记' : '▾ 更多标记（人物 / 活动 / 地点）'}
                    </button>
                    {showMore && (
                      <div className="space-y-1.5 pt-0.5">
                        <input
                          value={it.people}
                          onChange={(e) => updateField(idx, 'people', e.target.value)}
                          placeholder="人物：Lingling、Orm（顿号/逗号分隔）"
                          className="w-full px-2.5 py-1.5 rounded-[10px] text-[12px] text-glass-strong bg-transparent border-white/40 outline-none placeholder:text-glass/40 focus:border-[var(--color-accent-primary)] transition"
                        />
                        <input
                          value={it.event}
                          onChange={(e) => updateField(idx, 'event', e.target.value)}
                          placeholder="活动场次：如 深圳湾演唱会 2024"
                          className="w-full px-2.5 py-1.5 rounded-[10px] text-[12px] text-glass-strong bg-transparent border-white/40 outline-none placeholder:text-glass/40 focus:border-[var(--color-accent-primary)] transition"
                        />
                        <input
                          value={it.place}
                          onChange={(e) => updateField(idx, 'place', e.target.value)}
                          placeholder="地点：城市 或 店铺"
                          className="w-full px-2.5 py-1.5 rounded-[10px] text-[12px] text-glass-strong bg-transparent border-white/40 outline-none placeholder:text-glass/40 focus:border-[var(--color-accent-primary)] transition"
                        />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-glass opacity-60 hover:opacity-100 active:scale-95 transition"
                    aria-label="删除"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {saveError && (
            <p className="mt-4 text-[12px] text-[#ff9aa9] bg-transparent border border-white/40 rounded-[12px] p-3">{saveError}</p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => nav('/categorize')}
              className="py-3 rounded-[16px] text-white font-medium text-[14px] active:scale-95 transition"
              style={{ background: 'var(--color-accent-primary)' }}
            >
              快速归类
            </button>
            <button
              type="button"
              onClick={save}
              disabled={items.length === 0}
              className="py-3 rounded-[16px] text-accent font-medium text-[14px] active:scale-95 transition glass disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存到相册
            </button>
          </div>
        </>
      )}
    </div>
  )
}
