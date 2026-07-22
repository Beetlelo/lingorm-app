import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile } from '../lib/profile'
import { getRecentFavorites } from '../lib/photos'
import { getStats } from '../lib/stats'

const schedule = [
  { start: '14:00', end: '15:00', name: 'Dara Daily 娱乐访谈', loc: 'YouTube 频道 · 泰国', done: true },
  { start: '21:30', end: '22:30', name: '绘梦婚约 EP7', loc: 'Thai TV3 · 追剧打卡', done: false },
]

export default function Home() {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const profile = getProfile()
  const avatar = profile.avatar
  const name = profile.name || '星酱'
  // 统一统计来源：所有数字都从 getStats() 取真实数据，跨页面口径一致
  const stats = getStats()
  const heroStats = [
    { n: String(stats.photos), l: '全部照片', to: '/album', filter: '全部' },
    { n: String(stats.events), l: '活动场次', to: '/calendar' },
    { n: String(stats.favorites), l: '收藏心动', to: '/album', filter: '收藏' },
  ]
  const recent = getRecentFavorites(3)
  return (
    <div className="-mt-1 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[14px] text-glass opacity-80">Good evening, {name} ✨</p>
          <h1 className="text-[24px] font-bold text-glass-strong mt-0.5 leading-tight">Lingorm星球</h1>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => nav('/notifications')}
            aria-label="通知"
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-[16px] text-glass-strong active:scale-95 transition"
          >
            🔔
          </button>
          <button
            type="button"
            onClick={() => nav('/me')}
            aria-label="个人资料"
            className="w-10 h-10 rounded-full ring-2 ring-white/30 overflow-hidden active:scale-95 transition"
            style={
              avatar
                ? undefined
                : { background: 'linear-gradient(135deg,#7C6CF0,#FF6FB5)' }
            }
          >
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-white text-[15px] font-semibold">
                {name.slice(0, 1)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const t = q.trim()
          nav('/album', t ? { state: { filter: '全部', query: t } } : undefined)
        }}
        className="glass-strong flex items-center gap-2 px-4 py-3 rounded-[12px]"
      >
        <button type="submit" aria-label="搜索" className="shrink-0 active:scale-90 transition">
          <svg className="w-[18px] h-[18px] text-glass-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索照片、地点、回忆…"
          className="flex-1 min-w-0 bg-transparent outline-none text-[14px] text-glass-strong placeholder:text-glass-soft"
          aria-label="搜索"
        />
      </form>

      {/* Hero Stats */}
      <div
        className="rounded-[24px] p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(124, 108, 240, 0.72), rgba(255, 111, 181, 0.48))' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[18px] font-semibold">我的珍藏</span>
          <span className="text-[13px] opacity-80 font-mono">2026.07.18</span>
        </div>
        <div className="flex justify-between mt-4">
          {heroStats.map((s) => (
            <button
              key={s.l}
              type="button"
              onClick={() => nav(s.to, s.filter ? { state: { filter: s.filter } } : undefined)}
              className="text-center px-1 active:scale-95 transition"
            >
              <p className="text-[22px] font-bold font-mono leading-none">{s.n}</p>
              <p className="text-[12px] opacity-80 mt-1.5">{s.l}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Feed Entry */}
      <button onClick={() => nav('/feed')} className="glass w-full flex items-center gap-3 p-4 rounded-card text-left active:scale-[0.99] transition">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px]" style={{ background: 'linear-gradient(135deg,#7C6CF0,#FF6FB5)' }}>
          📸
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-glass-strong">最新动态</p>
          <p className="text-[12px] text-glass opacity-70 truncate">看看大家分享了什么</p>
        </div>
        <span className="text-glass opacity-50 text-[20px]">›</span>
      </button>

      {/* Schedule */}
      <div className="glass rounded-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-semibold text-glass-strong">今日行程</h2>
          <button onClick={() => nav('/calendar')} className="text-[12px] text-glass opacity-80 hover:text-glass-strong active:scale-95 transition">
            查看全部
          </button>
        </div>
        <div className="space-y-3">
          {schedule.map((s, i) => (
            <div key={i} className="flex gap-3">
              <div className="text-right w-11 shrink-0">
                <p className="text-[13px] font-mono text-glass-strong leading-tight">{s.start}</p>
                <p className="text-[11px] font-mono text-glass opacity-50 leading-tight">{s.end}</p>
              </div>
              <div className={`w-0.5 rounded-full shrink-0 my-1 ${s.done ? 'bg-accent-primary' : 'bg-white/20'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-glass-strong truncate">{s.name}</p>
                <p className="text-[12px] text-glass opacity-70 truncate">{s.loc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full shrink-0 my-auto flex items-center justify-center text-[11px] text-white ${s.done ? 'bg-accent-pink' : 'bg-white/20'}`}>
                {s.done ? '✓' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-semibold text-glass-strong">最近心动</h2>
          <button onClick={() => nav('/album')} className="text-[12px] text-glass opacity-80 hover:text-glass-strong active:scale-95 transition">
            全部
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {recent.map((r, i) => (
            <button
              key={r.id}
              type="button"
              onClick={() => nav('/browse', { state: { photos: recent, index: i } })}
              className="glass rounded-card overflow-hidden text-left card-lift active:scale-95 transition"
            >
              <div className="aspect-square rounded-[16px] m-1.5 relative overflow-hidden bg-white/5">
                {r.src || r.dataUrl ? (
                  <img src={r.src || r.dataUrl} alt={r.title} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full block" style={{ background: 'linear-gradient(135deg,#7C6CF0,#FF6FB5)' }} />
                )}
                <span className="absolute top-1.5 right-1.5 text-[12px]">💗</span>
              </div>
              <div className="px-2 pb-2">
                <span className="glass px-2 py-0.5 rounded-[8px] text-[11px] text-glass-strong inline-block">{r.tag}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
