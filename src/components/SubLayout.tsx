import { Outlet, useNavigate } from 'react-router-dom'

export default function SubLayout() {
  const nav = useNavigate()
  return (
    <main className="screen">
      <button
        type="button"
        onClick={() => nav(-1)}
        className="glass-pill inline-flex items-center gap-1 px-4 py-2 mb-4 text-[14px] text-glass-strong active:scale-95 transition"
        style={{ borderRadius: 'var(--radius-pill)' }}
        aria-label="返回上一页"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        返回
      </button>
      <Outlet />
    </main>
  )
}
