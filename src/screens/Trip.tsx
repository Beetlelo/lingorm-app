import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const timeline = [
  { day: '18', name: 'Dara Daily 娱乐访谈', loc: 'YouTube 频道', thumb: 'linear-gradient(135deg,#C4A1FE,#7C6CF0)' },
  { day: '17', name: 'Dara Daily 娱乐访谈', loc: '直播 · 泰国', thumb: 'linear-gradient(135deg,#FF6FB5,#ff8fc7)' },
]

export default function Trip() {
  const nav = useNavigate()
  const [tab, setTab] = useState<'时间线' | '行程'>('时间线')

  return (
    <div className="-mt-1">
      {/* Header + Segmented */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-[14px] text-glass opacity-80">沿着时间线回忆</p>
          <h1 className="text-[24px] font-bold text-glass-strong leading-tight">时间线</h1>
        </div>
        <div className="glass-strong flex p-1 rounded-[12px]">
          {(['时间线', '行程'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 rounded-[14px] text-[13px] transition active:scale-95 ${
                tab === t ? 'text-white font-medium' : 'text-glass-soft'
              }`}
              style={tab === t ? { background: 'var(--color-accent-primary)' } : undefined}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline list */}
      <div className="relative pl-5">
        <div className="absolute left-[7px] top-3 bottom-3 w-px bg-white/15" aria-hidden="true" />
        <div className="flex flex-col gap-5">
          {timeline.map((t, i) => (
            <div key={i} className="relative">
              <span
                className="absolute -left-[19px] top-6 w-2.5 h-2.5 rounded-full"
                style={{ background: 'var(--color-accent-primary)' }}
                aria-hidden="true"
              />
              <div className="glass rounded-card p-3 flex gap-3 card-lift">
                <div className="w-16 h-16 rounded-[12px] shrink-0" style={{ background: t.thumb }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-glass-strong truncate">{t.name}</p>
                  <p className="text-[12px] text-glass opacity-70 truncate mt-0.5">{t.loc}</p>
                  <span
                    className="inline-block mt-2 px-2 py-0.5 rounded-[8px] text-[11px] text-glass-strong"
                    style={{ background: 'rgba(237,229,255,0.25)' }}
                  >
                    2026.07
                  </span>
                </div>
                <div className="flex flex-col items-end justify-between shrink-0">
                  <span className="text-[18px] font-bold font-mono text-accent">{t.day}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
