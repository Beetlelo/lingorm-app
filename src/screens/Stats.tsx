import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPhotos, getFavorites } from '../lib/photos'
import { getMoods } from '../lib/moods'

// 真实分类色板（与品牌紫/粉家族一致）
const CAT_COLORS: Record<string, string> = {
  活动: '#7C6CF0',
  亲亲: '#FF6FB5',
  抱抱: '#FBB92E',
  收藏: '#EC4335',
  合照: '#C4A1FE',
}

export default function Stats() {
  const nav = useNavigate()
  const [period, setPeriod] = useState('本月')
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 60)
    return () => clearTimeout(t)
  }, [])

  const { total, favorites, moods, categories, trend } = useMemo(() => {
    const photos = getPhotos()
    const favs = getFavorites()
    const moodList = getMoods()

    // 分类占比：由真实 photo.tag 聚合
    const counts: Record<string, number> = {}
    photos.forEach((p) => {
      counts[p.tag] = (counts[p.tag] || 0) + 1
    })
    const catList = Object.entries(counts)
      .map(([label, n]) => ({
        label,
        n,
        pct: photos.length ? Math.round((n / photos.length) * 100) : 0,
        color: CAT_COLORS[label] || '#9CA3AF',
      }))
      .sort((a, b) => b.n - a.n)

    // 月度分布：由真实日期按月聚合（1-12 月）
    const byMonth = new Array(12).fill(0)
    photos.forEach((p) => {
      const mm = Number(p.date.split('.')[1])
      if (mm >= 1 && mm <= 12) byMonth[mm - 1] += 1
    })
    const maxM = Math.max(1, ...byMonth)
    const curMonth = new Date().getMonth() + 1
    const trendArr = byMonth.map((n, i) => ({
      m: String(i + 1),
      h: Math.round((n / maxM) * 100),
      pink: i + 1 === curMonth,
    }))

    return {
      total: photos.length,
      favorites: favs.length,
      moods: moodList.length,
      categories: catList,
      trend: trendArr,
    }
  }, [])

  const summary = [
    { n: total.toLocaleString('en-US'), l: '照片', color: 'var(--color-accent-primary)' },
    { n: favorites.toLocaleString('en-US'), l: '收藏', color: 'var(--color-accent-pink)' },
    { n: moods.toLocaleString('en-US'), l: '打卡', color: 'var(--text-on-glass-strong)' },
  ]

  // 空状态：没有任何照片时
  if (total === 0) {
    return (
      <div className="-mt-1">
        <h1 className="text-[24px] font-bold text-glass-strong mb-4">数据统计</h1>
        <div className="glass rounded-card p-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-[28px] mb-3">📊</div>
          <p className="text-[15px] text-glass-strong font-medium">还没有照片</p>
          <p className="text-[13px] text-glass opacity-70 mt-1 mb-4">上传第一张 Lingorm 照片，开启你的数据星球</p>
          <button
            type="button"
            onClick={() => nav('/add-photo')}
            className="px-5 py-2.5 rounded-[14px] text-white text-[14px] font-medium active:scale-95 transition"
            style={{ background: 'var(--color-accent-primary)' }}
          >
            去上传
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="-mt-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[24px] font-bold text-glass-strong">数据统计</h1>
        <button
          type="button"
          onClick={() => setPeriod((p) => (p === '本月' ? '本年' : '本月'))}
          className="glass-strong px-3.5 py-2 rounded-[14px] text-[13px] text-glass-strong active:scale-95 transition"
        >
          {period}
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {summary.map((s) => (
          <div key={s.l} className="glass-strong rounded-card py-4 text-center card-lift">
            <p className="text-[22px] font-bold font-mono leading-none" style={{ color: s.color }}>{s.n}</p>
            <p className="text-[12px] text-glass opacity-80 mt-1.5">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Category Section */}
      <div className="glass-strong rounded-card p-4 mb-5">
        <p className="text-[15px] font-semibold text-glass-strong mb-3">分类占比</p>
        <div className="flex flex-col gap-3">
          {categories.map((c) => (
            <div key={c.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] text-glass">{c.label}</span>
                <span className="text-[12px] text-glass opacity-80 font-mono">{c.n} · {c.pct}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(247,245,252,0.25)' }}>
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{ width: show ? `${c.pct}%` : '0%', background: c.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Section */}
      <div className="glass-strong rounded-card p-4">
        <p className="text-[15px] font-semibold text-glass-strong mb-4">照片月份分布</p>
        <div className="flex items-end justify-between gap-1.5 h-32">
          {trend.map((t) => (
            <div key={t.m} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className="w-full rounded-[3px] transition-[height] duration-700 ease-out"
                style={{
                  height: show ? `${t.h}%` : '0%',
                  background: t.pink ? 'var(--color-accent-pink)' : 'var(--color-accent-primary)',
                }}
              />
              <span className="text-[10px] text-glass opacity-60">{t.m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
