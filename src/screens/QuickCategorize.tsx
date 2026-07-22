import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const cats = [
  { name: '演唱会', bg: 'rgba(124,108,240,0.2)' },
  { name: '旅行', bg: 'rgba(77,128,242,0.2)' },
  { name: '周边', bg: 'rgba(255,111,181,0.2)' },
  { name: '美食', bg: 'rgba(249,168,51,0.2)' },
  { name: '日常', bg: 'rgba(51,204,179,0.2)' },
  { name: '未分类', bg: 'rgba(153,153,166,0.2)' },
]

// Screen 11 in the original Ardot design is the Quick Sort flow (no tab bar).
export default function QuickCategorize() {
  const nav = useNavigate()
  const [categorized, setCategorized] = useState(12)
  const total = 28
  const remaining = total - categorized
  const pct = Math.round((categorized / total) * 100)

  const pick = () => {
    if (categorized < total) setCategorized((c) => c + 1)
  }
  const undo = () => {
    if (categorized > 0) setCategorized((c) => c - 1)
  }

  return (
    <div className="flex flex-col h-full -mx-4 -mb-24 px-4 pb-6">
      <div className="flex items-center justify-between py-1">
        <button onClick={() => nav(-1)} aria-label="返回" className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center text-glass-strong text-[20px]">
          ‹
        </button>
        <span className="text-[16px] font-semibold text-glass-strong">快速归类</span>
        <button onClick={() => nav('/browse')} aria-label="关闭" className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center text-glass-strong text-[16px]">
          ✕
        </button>
      </div>

      <div className="mb-4 mt-2">
        <div className="flex justify-between text-[12px] mb-2">
          <span className="text-glass opacity-70">已归类 {categorized} / {total}</span>
          <span className="text-accent-pink">剩余 {remaining} 张</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-accent-primary to-accent-pink" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {categorized >= total ? (
        <div className="flex-1 min-h-0 my-1 rounded-[20px] glass flex flex-col items-center justify-center gap-3">
          <span className="text-[40px]">🎉</span>
          <p className="text-[15px] font-medium text-glass-strong">全部归类完成</p>
          <button
            type="button"
            onClick={() => nav('/album')}
            className="px-6 py-2.5 rounded-[20px] text-white font-medium text-[14px] active:scale-95 transition"
            style={{ background: 'var(--color-accent-primary)' }}
          >
            查看相册
          </button>
        </div>
      ) : (
        <div className="flex-1 min-h-0 my-1 rounded-[20px]" style={{ background: 'linear-gradient(135deg,#7C6CF0,#FF6FB5)' }} />
      )}

      <div className="bg-black/30 rounded-card py-2.5 text-center my-3">
        <p className="text-[13px] text-glass opacity-60">
          {categorized >= total ? '归类完成，可以去相册查看啦' : '选择分类归档此照片'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {cats.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={pick}
            disabled={categorized >= total}
            className="rounded-[14px] py-4 text-[13px] text-glass-strong font-medium active:scale-95 transition disabled:opacity-50"
            style={{ background: c.bg }}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={undo}
          disabled={categorized <= 0}
          className="glass flex-1 py-3 rounded-card text-[14px] text-glass opacity-80 active:scale-95 transition disabled:opacity-40"
        >
          撤销
        </button>
        <button
          type="button"
          onClick={() => nav('/browse')}
          className="flex-1 py-3 rounded-[20px] text-white font-medium text-[14px] active:scale-95 transition"
          style={{ background: 'var(--color-accent-primary)' }}
        >
          跳过
        </button>
      </div>
    </div>
  )
}
