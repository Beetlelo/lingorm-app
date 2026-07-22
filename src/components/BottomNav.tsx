import { NavLink, useNavigate } from 'react-router-dom'
import type { FC } from 'react'

type IconProps = { className?: string }

const HomeIcon: FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
  </svg>
)
const AlbumIcon: FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <circle cx="9" cy="10" r="1.8" />
    <path d="m4 17 5-4 4 3 3-2.5 4 3.5" />
  </svg>
)
const CalendarIcon: FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
    <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
  </svg>
)
const MeIcon: FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="3.6" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>
)

type Tab = { to: string; label: string; Icon: FC<IconProps> }

const tabs: Tab[] = [
  { to: '/', label: '首页', Icon: HomeIcon },
  { to: '/album', label: '相册', Icon: AlbumIcon },
  { to: '/calendar', label: '日历', Icon: CalendarIcon },
  { to: '/me', label: '我的', Icon: MeIcon },
]

function TabLink({ to, label, Icon }: Tab) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-[14px] transition active:scale-95 ${
          isActive ? 'text-accent font-semibold' : 'text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="w-[22px] h-[22px]" />
          <span className="text-[10px] font-medium">{label}</span>
          <span
            className="h-[3px] w-[3px] rounded-full transition"
            style={{ background: '#7C6CF0', opacity: isActive ? 1 : 0 }}
          />
        </>
      )}
    </NavLink>
  )
}

export default function BottomNav() {
  const nav = useNavigate()
  return (
    <nav
      className="glass-nav absolute bottom-[16px] left-1/2 -translate-x-1/2 flex items-center justify-around px-2 py-2"
      style={{ width: 'calc(100% - 32px)', borderRadius: 'var(--radius-pill)' }}
      aria-label="主导航"
    >
      <TabLink {...tabs[0]} />
      <TabLink {...tabs[1]} />

      <div className="flex-1 flex items-center justify-center">
        <button
          type="button"
          onClick={() => nav('/add-photo')}
          className="w-12 h-12 rounded-full bg-[#7C6CF0] text-white text-[26px] leading-none flex items-center justify-center active:scale-95 transition"
          style={{ boxShadow: '0 8px 24px rgba(124,108,240,0.45)' }}
          aria-label="添加照片"
        >
          +
        </button>
      </div>

      <TabLink {...tabs[2]} />
      <TabLink {...tabs[3]} />
    </nav>
  )
}
