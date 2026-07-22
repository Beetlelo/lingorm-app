import { useEffect, useState } from 'react'

type Wish = {
  name: string
  tag: '高' | '中' | '低'
  target: number
  saved: number
}

const tagMeta = {
  高: { color: '#FF6FB5', bg: 'rgba(255,111,181,0.15)' },
  中: { color: '#FBB92E', bg: 'rgba(251,185,46,0.18)' },
  低: { color: 'rgba(255,255,255,0.75)', bg: 'rgba(255,255,255,0.3)' },
}

const LS_KEY = 'lingorm_wishlist'

// 首次无数据时把示例心愿写入本地，之后完全以 localStorage 为准（真实录入）
const SEED: Wish[] = [
  { name: '演唱会 VIP 票', tag: '高', target: 1280, saved: 980 },
  { name: '签名周边套装', tag: '中', target: 599, saved: 420 },
  { name: '应援大屏广告', tag: '低', target: 888, saved: 120 },
  { name: '见面会旅行基金', tag: '高', target: 2000, saved: 760 },
]

function loadWishes(): Wish[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw === null) {
      localStorage.setItem(LS_KEY, JSON.stringify(SEED))
      return [...SEED]
    }
    return JSON.parse(raw) as Wish[]
  } catch {
    return [...SEED]
  }
}

const fmt = (n: number) => `¥${n.toLocaleString('en-US')}`

const parseMoney = (s: string) => {
  const n = Number(s.replace(/[^0-9.]/g, ''))
  return Number.isNaN(n) ? 0 : Math.round(n)
}

export default function Wishlist() {
  const [list, setList] = useState<Wish[]>(loadWishes)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Wish>({ name: '', tag: '中', target: 0, saved: 0 })
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  // 真实持久化：任何增删改都写回 localStorage，删光即空
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(list))
    } catch {
      /* noop */
    }
  }, [list])

  const totalTarget = list.reduce((sum, w) => sum + w.target, 0)
  const totalSaved = list.reduce((sum, w) => sum + w.saved, 0)
  const totalPct = totalTarget ? Math.round((totalSaved / totalTarget) * 100) : 0

  const submit = () => {
    if (!form.name || form.target <= 0) return
    const next = [form, ...list]
    setList(next)
    setForm({ name: '', tag: '中', target: 0, saved: 0 })
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setShowForm(false)
    }, 900)
  }

  return (
    <div className="-mt-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[24px] font-bold text-glass-strong">愿望清单</h1>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          aria-label="添加心愿"
          className="glass-strong w-10 h-10 rounded-[19px] flex items-center justify-center text-accent text-[22px] leading-none active:scale-95 transition"
        >
          +
        </button>
      </div>

      {/* Summary Card */}
      <div className="glass-strong rounded-card p-4 mb-4">
        <p className="text-[13px] text-glass opacity-90 mb-2">心愿总进度</p>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[15px] font-semibold text-accent font-mono">{fmt(totalSaved)}</span>
          <span className="text-[13px] text-glass opacity-90 font-mono">{fmt(totalTarget)}</span>
        </div>
        <div className="h-[6px] rounded-full overflow-hidden" style={{ background: 'rgba(247,245,252,0.25)' }}>
          <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: mounted ? `${totalPct}%` : '0%', background: 'var(--color-accent-primary)' }} />
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="glass-strong rounded-card p-4 mb-4 space-y-3">
          <p className="text-[14px] font-semibold text-glass-strong">添加心愿</p>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="心愿名称，如：演唱会 VIP 票"
            className="w-full bg-transparent border-b border-white/10 outline-none py-2 text-[14px] text-glass-strong placeholder:text-glass-soft"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-glass opacity-70 mb-1">目标金额</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="¥0"
                onChange={(e) => setForm((f) => ({ ...f, target: parseMoney(e.target.value) }))}
                className="w-full bg-transparent border-b border-white/10 outline-none py-2 text-[14px] text-glass-strong placeholder:text-glass-soft"
              />
            </div>
            <div>
              <label className="block text-[11px] text-glass opacity-70 mb-1">已存金额</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="¥0"
                onChange={(e) => setForm((f) => ({ ...f, saved: parseMoney(e.target.value) }))}
                className="w-full bg-transparent border-b border-white/10 outline-none py-2 text-[14px] text-glass-strong placeholder:text-glass-soft"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-glass opacity-70 mb-2">优先级</label>
            <div className="flex gap-2">
              {(['高', '中', '低'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, tag: t }))}
                  className={`px-3 py-1.5 rounded-[10px] text-[12px] transition active:scale-95 ${
                    form.tag === t ? 'text-white' : 'glass text-glass-strong'
                  }`}
                  style={form.tag === t ? { background: 'var(--color-accent-primary)' } : undefined}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="py-2.5 rounded-[14px] text-glass-strong text-[14px] glass active:scale-95 transition"
            >
              取消
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!form.name || form.target <= 0}
              className="py-2.5 rounded-[14px] text-white text-[14px] font-medium active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--color-accent-primary)' }}
            >
              {saved ? '已保存 ✓' : '保存心愿'}
            </button>
          </div>
        </div>
      )}

      {/* Wish Cards */}
      <div className="flex flex-col gap-3">
        {list.length === 0 ? (
          <div className="glass rounded-card p-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-[26px] mb-3">💡</div>
            <p className="text-[15px] text-glass-strong font-medium">还没有心愿</p>
            <p className="text-[13px] text-glass opacity-70 mt-1 mb-4">为想和 Lingorm 一起完成的事设个目标吧</p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 rounded-[14px] text-white text-[14px] font-medium active:scale-95 transition"
              style={{ background: 'var(--color-accent-primary)' }}
            >
              添加心愿
            </button>
          </div>
        ) : (
          list.map((w) => {
            const pct = w.target ? Math.round((w.saved / w.target) * 100) : 0
            const meta = tagMeta[w.tag]
            return (
              <div key={w.name} className="glass-strong rounded-card p-4 card-lift">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[15px] font-semibold text-glass-strong">{w.name}</span>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-[10px] font-medium"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {w.tag}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-glass opacity-90 font-mono">{fmt(w.target)}</span>
                  <span className="text-[12px] text-accent font-mono">{fmt(w.saved)}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(247,245,252,0.25)' }}>
                  <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: mounted ? `${pct}%` : '0%', background: 'var(--color-accent-primary)' }} />
                </div>
              </div>
            )
          })
        )}
        {list.length > 0 && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="glass w-full rounded-card py-3 text-[13px] text-glass-strong active:scale-[0.99] transition"
          >
            + 添加心愿
          </button>
        )}
      </div>
    </div>
  )
}
