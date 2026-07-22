export default function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[13px] font-semibold text-glass-strong select-none">
      <span className="font-mono tracking-tight">9:41</span>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {/* cellular / signal */}
        <svg className="w-[17px] h-[11px]" viewBox="0 0 17 11" fill="currentColor">
          <rect x="0" y="7" width="3" height="4" rx="1" />
          <rect x="4.5" y="5" width="3" height="6" rx="1" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
          <rect x="13.5" y="0" width="3" height="11" rx="1" opacity="0.4" />
        </svg>
        {/* wifi */}
        <svg className="w-[16px] h-[11px]" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 11.2 9.7 9.1a2.6 2.6 0 0 0-3.4 0L8 11.2Z" opacity="0.95" />
          <path d="M8 7.1 10.3 4.3a5.3 5.3 0 0 0-4.6 0L8 7.1Z" opacity="0.7" />
          <path d="M8 3 11 0a8 8 0 0 0-6 0L8 3Z" opacity="0.45" />
        </svg>
        {/* battery */}
        <div className="flex items-center gap-0.5">
          <div className="w-[22px] h-[11px] rounded-[3px] border border-white/40 px-[2px] flex items-center">
            <div className="w-[70%] h-[70%] rounded-[1px] bg-white/90" />
          </div>
        </div>
      </div>
    </div>
  )
}
