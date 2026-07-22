import { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'glass' | 'accent' | 'pink'
  full?: boolean
}

export default function GlassButton({
  children,
  variant = 'glass',
  full,
  className = '',
  ...rest
}: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium transition duration-fast active:scale-95 disabled:opacity-60 disabled:pointer-events-none'
  const radius = 'rounded-pill'
  const size = 'px-5 py-3 text-[14px]'

  if (variant === 'accent' || variant === 'pink') {
    const bg = variant === 'accent' ? 'var(--color-accent-primary)' : 'var(--color-accent-pink)'
    return (
      <button
        className={`${base} ${radius} ${size} text-white ${full ? 'w-full' : ''} ${className}`}
        style={{ background: bg }}
        {...rest}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      className={`${base} ${radius} ${size} glass-strong text-glass-strong ${
        full ? 'w-full' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
