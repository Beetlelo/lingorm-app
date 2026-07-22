import { ReactNode } from 'react'

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-card animate-shimmer ${className}`}
      style={{
        background:
          'linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0.06) 75%)',
        backgroundSize: '400px 100%',
      }}
      aria-hidden="true"
    />
  )
}

export function Empty({
  title,
  hint,
  action,
}: {
  title: string
  hint?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-full glass-strong flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-glass-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
          <circle cx="9" cy="10" r="1.6" />
          <path d="m4 17 5-4 4 3 3-2.5 4 3.5" />
        </svg>
      </div>
      <p className="text-[15px] text-glass-strong font-medium">{title}</p>
      {hint && <p className="text-[13px] text-glass-soft mt-1">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <p className="text-[14px] text-[var(--color-error)] font-medium">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-4 text-[13px] text-glass-soft underline">
          重试
        </button>
      )}
    </div>
  )
}
