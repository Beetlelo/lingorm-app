import { ReactNode } from 'react'

export default function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-medium text-glass-strong bg-transparent border border-white/40 px-2.5 py-1 rounded-full whitespace-nowrap">
      {children}
    </span>
  )
}
