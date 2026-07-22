import { ReactNode } from 'react'

type Props = {
  children: ReactNode
  active?: boolean
  onClick?: () => void
}

export default function Chip({ children, active, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`glass-strong px-4 py-2 text-[13px] font-medium rounded-chip transition duration-fast active:scale-95 ${
        active ? 'text-glass-strong' : 'text-glass-soft'
      }`}
      style={
        active
          ? {
              background: 'rgba(124,108,240,0.32)',
              boxShadow: 'inset 0 0 0 1px rgba(124,108,240,0.6)',
            }
          : undefined
      }
    >
      {children}
    </button>
  )
}
