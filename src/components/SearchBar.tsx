type Props = {
  value?: string
  onChange?: (v: string) => void
  placeholder?: string
  className?: string
}

export default function SearchBar({ value, onChange, placeholder = '搜索照片、地点、回忆…', className = '' }: Props) {
  return (
    <div className={`glass-strong flex items-center gap-2 px-4 py-3 rounded-[16px] ${className}`}>
      <svg
        className="w-[18px] h-[18px] text-glass-soft shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 bg-transparent outline-none text-[14px] text-glass-strong placeholder:text-glass-soft"
        aria-label="搜索"
      />
    </div>
  )
}
