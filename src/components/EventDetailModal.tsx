import type { CalEvent } from '../lib/events'

export default function EventDetailModal({
  event,
  onClose,
}: {
  event: CalEvent | null
  onClose: () => void
}) {
  if (!event) return null

  const dateLabel = `${event.date.getMonth() + 1}月${event.date.getDate()}日`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="glass-strong w-full max-w-sm rounded-[20px] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <span
            className="px-2 py-0.5 rounded-[8px] text-[11px] text-white shrink-0"
            style={{ background: event.source === 'google' ? '#818CF8' : 'var(--color-accent-primary)' }}
          >
            {event.source === 'google' ? 'Google' : 'Lingorm'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-glass-soft transition"
          >
            ✕
          </button>
        </div>

        <h3 className="text-[18px] font-semibold text-glass-strong leading-snug mb-3">
          {event.summary}
        </h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-[15px] shrink-0">🕐</span>
            <div>
              <p className="text-[13px] text-glass-strong">{dateLabel}</p>
              <p className="text-[13px] text-glass opacity-80">
                {event.allDay ? '全天' : `${event.start}${event.end ? ` – ${event.end}` : ''}`}
              </p>
            </div>
          </div>

          {event.location && event.location !== 'Google 日历' && (
            <div className="flex items-start gap-3">
              <span className="text-[15px] shrink-0">📍</span>
              <p className="text-[13px] text-glass-strong break-all">{event.location}</p>
            </div>
          )}

          {event.desc && (
            <div className="flex items-start gap-3">
              <span className="text-[15px] shrink-0">📝</span>
              <div className="text-[13px] text-glass opacity-90 leading-relaxed break-words whitespace-pre-wrap">
                {linkify(event.desc)}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-5 py-2.5 rounded-[14px] text-white text-[14px] font-medium active:scale-95 transition"
          style={{ background: 'var(--color-accent-primary)' }}
        >
          知道了
        </button>
      </div>
    </div>
  )
}

function linkify(text: string) {
  const regex = /(https?:\/\/[^\s]+)/g
  return text.split(regex).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noreferrer"
        className="text-accent underline break-all"
        onClick={(e) => e.stopPropagation()}
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}
