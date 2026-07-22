import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getEvent } from '../lib/events'
import { getMaterials, toggleMaterial, progressOf, type MaterialItem } from '../lib/materials'

const CHECKIN_KEY = 'lingorm:checkin'

function loadCheckin(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(CHECKIN_KEY) || '{}')
  } catch {
    return {}
  }
}

export default function EventDetail() {
  const nav = useNavigate()
  const { id } = useParams<{ id: string }>()
  const event = id ? getEvent(id) : undefined

  if (!event) {
    return (
      <div className="-mt-1 text-center py-20">
        <p className="text-glass opacity-70">未找到该行程</p>
        <button
          type="button"
          onClick={() => nav('/calendar')}
          className="mt-4 px-4 py-2 rounded-[16px] text-white text-[14px] active:scale-95 transition"
          style={{ background: 'var(--color-accent-primary)' }}
        >
          返回日历
        </button>
      </div>
    )
  }

  const [materials, setMaterials] = useState<MaterialItem[]>(() =>
    getMaterials(event.id, event.materials),
  )
  const [checkedIn, setCheckedIn] = useState<boolean>(() => !!loadCheckin()[event.id])

  const { done, total } = progressOf(materials)
  const allDone = total > 0 && done === total

  function toggle(mid: string) {
    toggleMaterial(event!.id, mid)
    setMaterials(getMaterials(event!.id, event!.materials))
  }

  function checkIn() {
    const store = loadCheckin()
    store[event!.id] = !store[event!.id]
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(store))
    setCheckedIn(store[event!.id])
  }

  return (
    <div className="-mt-1">
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => nav(-1)}
          className="w-10 h-10 rounded-full glass flex items-center justify-center text-glass-strong active:scale-95 transition"
          aria-label="返回"
        >
          ‹
        </button>
        <h1 className="text-[18px] font-bold text-glass-strong">行程详情</h1>
        <button
          type="button"
          className="w-10 h-10 rounded-full glass flex items-center justify-center text-glass-strong active:scale-95 transition"
          aria-label="更多"
        >
          ⋯
        </button>
      </div>

      <div className="glass-strong rounded-card p-5 mb-4">
        <div
          className="w-full h-40 rounded-[16px] mb-4"
          style={{ background: `linear-gradient(135deg,${event.color},#FF6FB5)` }}
        />
        <h2 className="text-[20px] font-bold text-glass-strong mb-2">{event.summary}</h2>
        <p className="text-[14px] text-accent mb-1">{event.date.getFullYear()}.{String(event.date.getMonth() + 1).padStart(2, '0')}.{String(event.date.getDate()).padStart(2, '0')}</p>
        <p className="text-[13px] text-glass opacity-70">{event.location}</p>
        <p className="text-[14px] text-glass opacity-80 mt-4 leading-relaxed">{event.desc}</p>
      </div>

      {/* 物料视频打卡清单 */}
      <div className="glass rounded-card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-semibold text-glass-strong">物料清单</h3>
          <span className="text-[12px] text-glass opacity-70">
            已刷 {done}/{total}
          </span>
        </div>
        {/* 进度条 */}
        <div className="h-2 rounded-full mb-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: total ? `${(done / total) * 100}%` : '0%',
              background: 'var(--color-accent-primary)',
            }}
          />
        </div>

        {total === 0 ? (
          <p className="text-[13px] text-glass opacity-60 py-2">暂无关联物料</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {materials.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => toggle(m.id)}
                className="flex items-center gap-3 text-left active:scale-[0.99] transition"
              >
                <span
                  className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[12px] border-2 transition"
                  style={{
                    borderColor: m.done ? event.color : 'rgba(255,255,255,0.3)',
                    background: m.done ? event.color : 'transparent',
                    color: m.done ? '#fff' : 'transparent',
                  }}
                >
                  ✓
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[14px] truncate ${m.done ? 'text-glass opacity-60 line-through' : 'text-glass-strong'}`}>
                    {m.title}
                  </p>
                  <p className="text-[11px] text-glass opacity-60">{m.type} · {m.duration}</p>
                </div>
                <span
                  className="text-[11px] px-2 py-0.5 rounded-[8px] shrink-0"
                  style={{
                    background: m.done ? 'rgba(52,211,153,0.18)' : 'rgba(255,255,255,0.1)',
                    color: m.done ? 'var(--color-success)' : 'var(--text-on-glass-soft)',
                  }}
                >
                  {m.done ? '已看' : '未看'}
                </span>
              </button>
            ))}
          </div>
        )}

        {allDone && (
          <div className="mt-4 rounded-[14px] p-3 text-center" style={{ background: 'rgba(52,211,153,0.14)' }}>
            <p className="text-[13px] font-medium" style={{ color: 'var(--color-success)' }}>
              🎉 物料已刷完，打卡达成！
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={checkIn}
          className="py-3 rounded-[16px] font-medium text-[14px] active:scale-95 transition text-white"
          style={{ background: checkedIn ? 'rgba(52,211,153,0.85)' : 'var(--color-accent-primary)' }}
        >
          {checkedIn ? '已签到 ✓' : '打卡签到'}
        </button>
        <button
          type="button"
          onClick={() => nav('/categorize')}
          className="py-3 rounded-[16px] text-accent font-medium text-[14px] active:scale-95 transition glass"
        >
          上传现场照
        </button>
      </div>
    </div>
  )
}
