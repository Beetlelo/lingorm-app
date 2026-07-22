import { HTMLAttributes, ReactNode } from 'react'

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  strong?: boolean
  clickable?: boolean
}

export default function GlassCard({ children, strong, clickable, className = '', ...rest }: Props) {
  return (
    <div
      className={`${strong ? 'glass-strong' : 'glass'} rounded-card p-4 ${
        clickable ? 'card-lift cursor-pointer' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
