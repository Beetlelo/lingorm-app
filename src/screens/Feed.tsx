import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const filters = ['全部', '微博', 'Instagram', '官方']

const initialPosts = [
  {
    avatar: 'linear-gradient(135deg,#7C6CF0,#9b8bfb)',
    name: 'Lingorm Official',
    time: '2 小时前',
    text: '曼谷见面会后台花絮来啦～ 谢谢大家今天的应援，爱你们！',
    likes: 1200,
    comments: 320,
    shares: 88,
    liked: false,
  },
  {
    avatar: 'linear-gradient(135deg,#C4A1FE,#a78bfa)',
    name: 'Orm Kornnaphat',
    time: '5 小时前',
    text: '今天拍完最后一场，下一站清迈见！记得带好应援物～',
    likes: 980,
    comments: 210,
    shares: 64,
    liked: false,
  },
  {
    avatar: 'linear-gradient(135deg,#FF6FB5,#ff8fc7)',
    name: 'LingOrm Update',
    time: '昨天',
    text: '新剧预告片今晚 8 点准时上线，记得来蹲守首播！',
    likes: 2400,
    comments: 560,
    shares: 190,
    liked: false,
  },
]

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${n}`
}

export default function Feed() {
  const nav = useNavigate()
  const [activeFilter, setActiveFilter] = useState('全部')
  const [posts, setPosts] = useState(initialPosts)
  const [showFilter, setShowFilter] = useState(false)

  const toggleLike = (i: number) => {
    setPosts((prev) => {
      const next = [...prev]
      next[i] = { ...next[i], likes: next[i].likes + (next[i].liked ? -1 : 1), liked: !next[i].liked }
      return next
    })
  }

  return (
    <div className="-mt-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[24px] font-bold text-glass-strong">动态</h1>
        <button
          type="button"
          onClick={() => setShowFilter((s) => !s)}
          className="glass-strong flex items-center gap-1.5 px-3.5 py-2 rounded-[19px] text-[13px] text-glass-strong active:scale-95 transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5h18M6 12h12M10 19h4" />
          </svg>
          筛选
        </button>
      </div>

      {showFilter && (
        <div className="flex gap-2 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 rounded-[14px] text-[13px] shrink-0 transition active:scale-95 ${
                activeFilter === f ? 'text-white font-medium' : 'glass text-glass'
              }`}
              style={activeFilter === f ? { background: 'var(--color-accent-primary)' } : undefined}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {posts.map((p, i) => (
          <div key={i} className="glass-strong rounded-card p-3.5">
            {/* Top */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[18px] shrink-0" style={{ background: p.avatar }} />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-glass-strong truncate">{p.name}</p>
                <p className="text-[11px] text-glass opacity-60">{p.time}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleLike(i)}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-[14px] shrink-0 active:scale-90 transition"
                style={{ background: p.liked ? 'rgba(255,111,181,0.18)' : 'transparent', color: p.liked ? 'var(--color-accent-pink)' : 'var(--text-glass)' }}
              >
                ♥
              </button>
            </div>
            {/* Text */}
            <p className="text-[14px] text-glass mt-2.5 leading-relaxed">{p.text}</p>
            {/* Image placeholder */}
            <button
              type="button"
              onClick={() => nav('/browse')}
              className="block w-full h-40 rounded-[12px] mt-3 active:scale-[0.99] transition"
              style={{ background: 'linear-gradient(135deg,rgba(124,108,240,0.35),rgba(255,111,181,0.35))' }}
            />
            {/* Actions */}
            <div className="flex items-center gap-5 mt-3">
              <button
                type="button"
                onClick={() => toggleLike(i)}
                className={`text-[12px] font-medium active:scale-95 transition ${p.liked ? 'text-accent-pink' : 'text-accent'}`}
              >
                喜欢 {fmt(p.likes)}
              </button>
              <button type="button" className="text-[12px] text-accent font-medium active:scale-95 transition">
                评论 {fmt(p.comments)}
              </button>
              <button type="button" className="text-[12px] text-accent font-medium active:scale-95 transition">
                分享 {fmt(p.shares)}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
