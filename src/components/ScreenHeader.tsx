import { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  action?: ReactNode
}

export default function ScreenHeader({ title, subtitle, action }: Props) {
  return (
    <header className="mb-5 mt-1 flex items-end justify-between gap-3">
      <div>
        <h1 className="text-[26px] font-semibold text-glass-strong leading-tight">{title}</h1>
        {subtitle && <p className="text-[13px] text-glass-soft mt-1">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}
