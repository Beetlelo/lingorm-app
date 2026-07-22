import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  connect,
  fetchEvents,
  fetchUserInfo,
  getStoredToken,
  clearToken,
  eventStartDate,
  GCalEvent,
} from '../lib/googleCalendar'
import { lingormEvents, type CalEvent } from '../lib/events'
import { lunarShort, isoWeekNumber } from '../lib/lunar'
import { getOnThisDayPhotos, saveCalendarEvents } from '../lib/photos'
import MoodModal from '../components/MoodModal'
import EventDetailModal from '../components/EventDetailModal'
import { getMoods, dateKey, type Mood } from '../lib/moods'

type GStatus = 'idle' | 'connecting' | 'syncing' | 'connected'
type CalView = '月' | '年'

const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined

const WEEK = ['日', '一', '二', '三', '四', '五', '六']

export default function Calendar() {
  const nav = useNavigate()
  const [tab, setTab] = useState<'时间线' | '行程'>('行程')
  const [calView, setCalView] = useState<CalView>('月')
  const [calMode, setCalMode] = useState<'追星' | 'google'>('追星')
  const [gstatus, setGStatus] = useState<GStatus>('idle')
  const [email, setEmail] = useState('')
  const [events, setEvents] = useState<GCalEvent[]>([])
  const [calendarName, setCalendarName] = useState('')
  const [lastSync, setLastSync] = useState('')
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2026, 6, 20))

  const today = new Date()
  const [viewDate, setViewDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1))

  const [moods, setMoods] = useState<Mood[]>(getMoods())
  const [showMood, setShowMood] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null)

  const moodByKey = useMemo(() => {
    const m: Record<string, Mood> = {}
    moods.forEach((x) => (m[x.date] = x))
    return m
  }, [moods])

  const displayDate = selectedDate || today
  const displayMood = moodByKey[dateKey(displayDate)]
  const onThisDay = useMemo(() => getOnThisDayPhotos(), [])

  // 启动时若已有授权令牌，自动恢复
  useEffect(() => {
    if (!getStoredToken()) return
    setGStatus('connected')
    fetchUserInfo()
      .then((u) => setEmail(u.email))
      .catch(() => {})
    void doSync(setGStatus, setEvents, setCalendarName, setLastSync, setEmail, setError)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function isPopupBlocked() {
    const win = window.open('', '_blank', 'width=1,height=1,left=-1000,top=-1000')
    if (!win) return true
    try {
      const blocked = win.closed || typeof win.closed === 'undefined'
      win.close()
      return blocked
    } catch {
      try {
        win.close()
      } catch {}
      return true
    }
  }

  async function handleConnect() {
    if (!clientId) {
      setError('未配置 VITE_GOOGLE_CLIENT_ID，请在项目根目录 .env 填写后重启预览')
      return
    }
    if (isPopupBlocked()) {
      setError(
        '浏览器拦截了弹窗。iOS Safari：设置 → Safari → 关闭「阻止弹窗」；Chrome：地址栏右侧点「已拦截弹窗」→ 允许本站。',
      )
      return
    }
    setError('')
    setGStatus('connecting')
    try {
      await connect(clientId)
      setGStatus('connected')
      try {
        const u = await fetchUserInfo()
        setEmail(u.email)
      } catch {
        /* noop */
      }
      await doSync(setGStatus, setEvents, setCalendarName, setLastSync, setEmail, setError)
    } catch (e: any) {
      setGStatus('idle')
      setError(e?.message || '连接失败')
    }
  }

  function handleDisconnect() {
    clearToken()
    setEvents([])
    setCalendarName('')
    setEmail('')
    setLastSync('')
    setGStatus('idle')
    setError('')
  }

  const googleEvents: CalEvent[] = useMemo(() => {
    return events
      .map((ev) => {
        const start = eventStartDate(ev)
        if (!start) return null
        const allDay = !ev.start?.dateTime
        const startStr = allDay
          ? '全天'
          : start.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        const endStr = ev.end?.dateTime
          ? new Date(ev.end.dateTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
          : undefined
        return {
          id: ev.id,
          summary: ev.summary || '（无标题）',
          start: startStr,
          end: endStr,
          location: ev.location || 'Google 日历',
          allDay,
          source: 'google' as const,
          date: new Date(start.getFullYear(), start.getMonth(), start.getDate()),
          color: '#818CF8',
          desc: ev.description || '',
          materials: [],
        }
      })
      .filter(Boolean) as CalEvent[]
  }, [events])

  // 追星日历合并本地 + Google 事件；Google 日历模式仅展示同步来的 Google 事件
  const activeEvents = useMemo(() => {
    if (calMode === 'google') return googleEvents
    return [...lingormEvents, ...googleEvents]
  }, [googleEvents, calMode])

  function eventsForDate(date: Date | null) {
    if (!date) return []
    return activeEvents.filter(
      (ev) =>
        ev.date.getFullYear() === date.getFullYear() &&
        ev.date.getMonth() === date.getMonth() &&
        ev.date.getDate() === date.getDate(),
    )
  }

  function isSameDay(a: Date, b: Date | null) {
    if (!b) return false
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  }

  const isToday = (date: Date | null) => (date ? isSameDay(today, date) : false)
  const selectedEvents = selectedDate ? eventsForDate(selectedDate) : []
  const selectedMood = selectedDate ? moodByKey[dateKey(selectedDate)] : undefined

  function buildMonthGrid(year: number, month: number) {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    const totalCells = Math.ceil((startPadding + daysInMonth) / 7) * 7
    const cells: { date: Date | null; day: number | null }[] = []
    for (let i = 0; i < totalCells; i++) {
      const dayIndex = i - startPadding + 1
      if (dayIndex > 0 && dayIndex <= daysInMonth) {
        cells.push({ date: new Date(year, month, dayIndex), day: dayIndex })
      } else {
        cells.push({ date: null, day: null })
      }
    }
    const weeks: { date: Date | null; day: number | null }[][] = []
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
    return weeks
  }

  const weeks = useMemo(
    () => buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  )
  const monthLabel = `${viewDate.getFullYear()}年${viewDate.getMonth() + 1}月`

  function prevMonth() {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }
  function nextMonth() {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }
  function prevYear() {
    setViewDate(new Date(viewDate.getFullYear() - 1, 0, 1))
  }
  function nextYear() {
    setViewDate(new Date(viewDate.getFullYear() + 1, 0, 1))
  }
  function goMonth(year: number, month: number) {
    setViewDate(new Date(year, month, 1))
    setCalView('月')
  }

  const renderTimeline = () => (
    <div className="relative pl-5">
      <div className="absolute left-[7px] top-3 bottom-3 w-px bg-white/15" aria-hidden="true" />
      <div className="flex flex-col gap-5">
        {lingormEvents.slice(0, 4).map((t, idx) => (
          <button
            key={t.id}
            type="button"
            onClick={() => nav(`/event/${t.id}`)}
            className="relative text-left active:scale-[0.99] transition"
          >
            <span
              className="absolute -left-[19px] top-6 w-2.5 h-2.5 rounded-full"
              style={{ background: idx % 2 === 0 ? 'var(--color-accent-primary)' : '#FF6FB5' }}
              aria-hidden="true"
            />
            <div className="glass rounded-card p-3 flex gap-3 card-lift">
              <div
                className="w-16 h-16 rounded-[12px] shrink-0"
                style={{ background: `linear-gradient(135deg,${t.color},${t.color === '#7C6CF0' ? '#9b8bfb' : '#ff8fc7'})` }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-glass-strong truncate">{t.summary}</p>
                <p className="text-[12px] text-glass opacity-70 truncate mt-0.5">{t.location}</p>
                <span
                  className="inline-block mt-2 px-2 py-0.5 rounded-[8px] text-[11px] text-glass-strong"
                  style={{ background: 'rgba(237,229,255,0.25)' }}
                >
                  {t.allDay ? '全天' : t.start}
                </span>
              </div>
              <div className="flex flex-col items-end justify-between shrink-0">
                <span className="text-[18px] font-bold font-mono text-accent">{t.date.getDate()}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  function shortTitle(text: string) {
    const t = text.trim()
    if (t.length <= 3) return t
    return t.slice(0, 3) + '…'
  }

  const renderMonthDayCell = (cell: { date: Date | null; day: number | null }, i: number) => {
    const date = cell.date
    const dayEvents = eventsForDate(date)
    const visible = dayEvents.slice(0, 2)
    const overflow = dayEvents.length - visible.length
    const selected = date && selectedDate ? isSameDay(date, selectedDate) : false
    const lunar = date ? lunarShort(date.getFullYear(), date.getMonth() + 1, date.getDate()) : ''
    const mood = date ? moodByKey[dateKey(date)] : undefined
    return (
      <button
        key={i}
        type="button"
        onClick={() => setSelectedDate(date)}
        className={`relative flex flex-col items-stretch justify-start pt-1 pb-1 rounded-[12px] h-[56px] overflow-hidden transition ${
          date ? 'hover:bg-white/5 active:scale-95' : ''
        } ${selected ? 'ring-1 ring-white/30 bg-white/[0.06]' : ''}`}
      >
        {date && (
          <>
            <div className="flex items-center justify-between px-1 mb-0.5 shrink-0">
              <span
                className={`w-5 h-5 flex items-center justify-center text-[11px] rounded-full ${
                  isToday(date)
                    ? 'bg-[var(--color-accent-primary)] text-white font-semibold'
                    : selected
                    ? 'text-white font-medium'
                    : 'text-glass-strong'
                }`}
              >
                {cell.day}
              </span>
              {mood ? (
                <span className="text-[13px] leading-none" title={mood.text || ''}>{mood.emoji}</span>
              ) : (
                <span className="text-[7px] text-glass opacity-50 leading-none">{lunar}</span>
              )}
            </div>
            <div className="w-full flex flex-col gap-[1px] px-0.5 overflow-hidden">
              {visible.map((ev) => (
                <span
                  key={ev.id}
                  className="w-full h-[14px] rounded-[3px] px-1 text-[8px] leading-[14px] text-white truncate text-left"
                  style={{ background: ev.color + 'CC' }}
                  title={ev.summary}
                >
                  {shortTitle(ev.summary)}
                </span>
              ))}
              {overflow > 0 && (
                <span className="h-[14px] rounded-[3px] px-1 text-[8px] leading-[14px] text-white/80 text-center truncate"
                  style={{ background: 'rgba(255,255,255,0.12)' }}>
                  +{overflow}
                </span>
              )}
              {!visible.length && mood && (
                <span className="px-1 text-[9px] text-glass opacity-80 truncate leading-tight">{mood.text || '心情'}</span>
              )}
            </div>
          </>
        )}
      </button>
    )
  }

  const renderMonth = () => (
    <>
      {/* 月历 + 选中日详情（宽屏左右分栏，手机上下） */}
      <div className="min-[820px]:grid min-[820px]:grid-cols-[1fr_280px] min-[820px]:gap-4 min-[820px]:items-start">
        {/* 月历卡片 */}
        <div className="glass-strong rounded-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[15px] font-semibold text-glass-strong">{monthLabel}</span>
            <div className="flex gap-2 text-glass-soft">
              <button type="button" onClick={prevMonth} className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center active:scale-95 transition">‹</button>
              <button type="button" onClick={nextMonth} className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center active:scale-95 transition">›</button>
            </div>
          </div>
          {/* 周数列 + 星期 */}
          <div className="grid grid-cols-[18px_repeat(7,1fr)] gap-x-1 mb-1">
            <div />
            {WEEK.map((w) => (
              <div key={w} className="text-center text-[11px] text-glass-soft py-1">{w}</div>
            ))}
          </div>
          <div className="space-y-1">
            {weeks.map((week, wi) => {
              const firstReal = week.find((c) => c.date)?.date
              const wn = firstReal ? isoWeekNumber(firstReal) : ''
              return (
                <div key={wi} className="grid grid-cols-[18px_repeat(7,1fr)] gap-x-1 items-start">
                  <div className="text-[9px] text-glass opacity-35 flex items-center justify-center font-mono">{wn}</div>
                  {week.map((cell, ci) => renderMonthDayCell(cell, wi * 7 + ci))}
                </div>
              )
            })}
          </div>
          <p className="text-[12px] text-accent mt-3">
            {calMode === 'google'
              ? `● 已同步 ${googleEvents.length} 场 Google 行程`
              : `● 本月还有 ${lingormEvents.length} 场活动待打卡`}
          </p>
        </div>

        {/* 选中日详情 */}
        {selectedDate && (
          <div className="mt-4 min-[820px]:mt-0 min-[820px]:sticky min-[820px]:top-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[16px] font-semibold text-glass-strong">
                {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
                <span className="ml-2 text-[11px] text-glass opacity-50">
                  {lunarShort(selectedDate.getFullYear(), selectedDate.getMonth() + 1, selectedDate.getDate())}
                </span>
                {isToday(selectedDate) && <span className="ml-2 text-[12px] text-accent">今天</span>}
              </h2>
              <span
                className="text-[11px] px-2 py-0.5 rounded-[10px] text-accent"
                style={{ background: 'rgba(124,108,240,0.12)' }}
              >
                {selectedEvents.length} 项
              </span>
            </div>
            {selectedMood && (
              <div className="glass rounded-card p-3 mb-3 flex items-center gap-3">
                <span className="text-[26px] leading-none">{selectedMood.emoji}</span>
                <p className="flex-1 min-w-0 text-[13px] text-glass-strong truncate">{selectedMood.text || '这天记录了心情'}</p>
                <button
                  type="button"
                  onClick={() => setShowMood(true)}
                  className="text-[12px] text-accent active:scale-95 shrink-0"
                >
                  编辑
                </button>
              </div>
            )}
            {selectedEvents.length === 0 ? (
              <button
                type="button"
                onClick={() => nav('/add-photo')}
                className="glass w-full rounded-card p-5 text-center active:scale-[0.99] transition"
              >
                <p className="text-[13px] text-glass opacity-70">这天还没有行程，去添加一张 Lingorm 回忆 ✨</p>
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedEvents
                  .sort((a, b) => (a.allDay ? -1 : b.allDay ? 1 : a.start.localeCompare(b.start)))
                  .map((ev, i) => (
                    <button
                      key={`${ev.id}-${i}`}
                      type="button"
                      onClick={() => setSelectedEvent(ev)}
                      className="glass rounded-card p-3 flex items-center gap-3 text-left active:scale-[0.99] transition"
                    >
                      <div className="text-right w-14 shrink-0">
                        {ev.allDay ? (
                          <span className="inline-block px-2 py-0.5 rounded-[8px] text-[11px] text-white" style={{ background: ev.color + 'DD' }}>
                            全天
                          </span>
                        ) : (
                          <>
                            <p className="text-[14px] font-mono text-accent leading-tight">{ev.start}</p>
                            {ev.end && <p className="text-[11px] text-glass opacity-60 leading-tight">{ev.end}</p>}
                          </>
                        )}
                      </div>
                      <div className="w-1.5 self-stretch rounded-full shrink-0" style={{ background: ev.color }} aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-glass-strong truncate">{ev.summary}</p>
                        <p className="text-[12px] text-glass opacity-70 truncate">{ev.location}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-[8px] text-[10px] text-white shrink-0" style={{ background: ev.source === 'google' ? '#818CF8' : 'var(--color-accent-primary)' }}>
                        {ev.source === 'google' ? 'Google' : 'Lingorm'}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-5">
        <h2 className="text-[16px] font-semibold text-glass-strong mb-3">心情打卡</h2>
        <button
          type="button"
          onClick={() => setShowMood(true)}
          className={`glass w-full rounded-card p-5 text-center active:scale-[0.99] transition ${
            displayMood ? 'border border-[var(--color-accent-primary)]/50' : ''
          }`}
        >
          {displayMood ? (
            <p className="text-[14px] text-glass-strong">{displayMood.emoji} 已记录：{displayMood.text || '点击编辑今天的心情'}</p>
          ) : (
            <p className="text-[13px] text-glass opacity-70">记录今天看 Lingorm 的心情 ✨</p>
          )}
        </button>
      </div>

      <div className="mt-5">
        <h2 className="text-[16px] font-semibold text-glass-strong mb-3">回忆 · 去年今日</h2>
        {onThisDay.length > 0 ? (
          <button
            type="button"
            onClick={() => nav('/browse', { state: { photos: onThisDay, index: 0 } })}
            className="glass w-full rounded-card p-4 text-left active:scale-[0.99] transition flex items-center gap-3"
          >
            <div className="flex -space-x-2 shrink-0">
              {onThisDay.slice(0, 3).map((p) => (
                <img
                  key={p.id}
                  src={p.src || p.dataUrl}
                  alt=""
                  className="w-12 h-12 rounded-[10px] object-cover border-2"
                  style={{ borderColor: 'rgba(255,255,255,0.18)' }}
                />
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-glass-strong truncate">{onThisDay.length} 年前的今天，也有 Lingorm 的回忆</p>
              <p className="text-[11px] text-glass opacity-60 mt-0.5">点击重温 →</p>
            </div>
          </button>
        ) : (
          <div className="glass w-full rounded-card p-5 text-center">
            <p className="text-[13px] text-glass opacity-70">这一天还没有往年的回忆，去记录新的吧 ✨</p>
          </div>
        )}
      </div>

      {showMood && (
        <MoodModal
          date={displayDate}
          initial={displayMood}
          onClose={() => setShowMood(false)}
          onSaved={() => setMoods(getMoods())}
        />
      )}
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </>
  )

  const renderYear = () => (
    <div className="glass-strong rounded-card p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[15px] font-semibold text-glass-strong">{viewDate.getFullYear()}年</span>
        <div className="flex gap-2 text-glass-soft">
          <button type="button" onClick={prevYear} className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center active:scale-95 transition">‹</button>
          <button type="button" onClick={nextYear} className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center active:scale-95 transition">›</button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 12 }, (_, mi) => {
          const m = mi
          const miniWeeks = buildMonthGrid(viewDate.getFullYear(), m)
          return (
            <button
              key={m}
              type="button"
              onClick={() => goMonth(viewDate.getFullYear(), m)}
              className="text-left rounded-[14px] p-2.5 hover:bg-white/8 active:scale-[0.98] transition"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <p className="text-[12px] font-semibold text-glass-strong mb-1.5">{m + 1}月</p>
              <div className="grid grid-cols-7 gap-[1px]">
                {miniWeeks.flat().map((c, ci) => {
                  const has = c.date ? eventsForDate(c.date).length > 0 : false
                  return (
                    <span
                      key={ci}
                      className="aspect-square rounded-[2px] flex items-center justify-center text-[7px] text-glass-soft"
                    >
                      {c.day ? (
                        has ? (
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent-pink)' }} />
                        ) : (
                          c.day
                        )
                      ) : null}
                    </span>
                  )
                })}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="-mt-1">
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-[14px] text-glass opacity-80">{tab === '时间线' ? '沿着时间线回忆' : '规划你的应援日历'}</p>
          <h1 className="text-[24px] font-bold text-glass-strong leading-tight">{tab === '时间线' ? '时间线' : '追星行程'}</h1>
        </div>
        <div className="glass-strong flex p-1 rounded-[12px]">
          {(['时间线', '行程'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 rounded-[14px] text-[13px] transition active:scale-95 ${
                tab === t ? 'text-white font-medium' : 'text-glass-soft'
              }`}
              style={tab === t ? { background: 'var(--color-accent-primary)' } : undefined}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === '时间线' ? (
        renderTimeline()
      ) : (
        <div className="space-y-4">
          {/* 模式切换：追星日历 / Google 日历 */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="glass-strong flex p-1 rounded-[12px]">
              {(['追星日历', 'Google 日历'] as const).map((v) => {
                const active = (v === 'Google 日历') === (calMode === 'google')
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setCalMode(v === 'Google 日历' ? 'google' : '追星')}
                    className={`px-3.5 py-1.5 rounded-[14px] text-[13px] transition active:scale-95 ${
                      active ? 'text-white font-medium' : 'text-glass-soft'
                    }`}
                    style={active ? { background: 'var(--color-accent-primary)' } : undefined}
                  >
                    {v}
                  </button>
                )
              })}
            </div>
          {calMode === 'google' && (
            <span className="text-[12px] text-glass opacity-70">
              {gstatus === 'connected' ? '已授权，行程原生展示' : '授权后即可像滴答清单一样导入'}
            </span>
          )}
        </div>

        {calMode === 'google' ? (
          <div className="space-y-4">
            {/* Google 原生导入 */}
            {gstatus !== 'connected' ? (
              <div className="glass rounded-card p-5 text-center space-y-3">
                <div
                  className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-[24px]"
                  style={{ background: 'rgba(129,140,248,0.18)' }}
                >
                  🗓
                </div>
                <div>
                  <p className="text-[14px] font-medium text-glass-strong">连接 Google 日历</p>
                  <p className="text-[12px] text-glass opacity-70 mt-1 leading-relaxed">
                    像滴答清单一样把行程原生导入 App，授权后自动同步，无需反复打开网页。
                  </p>
                </div>
                {gstatus === 'idle' && (
                  <button
                    type="button"
                    onClick={handleConnect}
                    className="px-5 py-2.5 rounded-[16px] text-white text-[13px] font-medium active:scale-95 transition"
                    style={{ background: 'var(--color-accent-primary)' }}
                  >
                    连接并同步
                  </button>
                )}
                {gstatus === 'connecting' && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[16px] text-[13px] text-glass-strong glass">
                    <Spinner /> 连接中…
                  </span>
                )}
                {gstatus === 'syncing' && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[16px] text-[13px] text-glass-strong glass">
                    <Spinner /> 同步中…
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[12px] text-glass-strong">
                  ✓ {email || 'Google 已连接'}
                  {lastSync ? ` · 上次同步 ${lastSync}` : ''}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => doSync(setGStatus, setEvents, setCalendarName, setLastSync, setEmail, setError)}
                    className="glass flex items-center gap-1 px-2.5 py-1.5 rounded-[14px] text-[12px] text-accent active:scale-95 transition"
                  >
                    ↻ 同步
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-2.5 py-1.5 rounded-[14px] text-[12px] text-glass opacity-70 active:scale-95 transition"
                  >
                    断开
                  </button>
                </div>
              </div>
            )}
            {calendarName && (
              <p className="text-[11px] text-glass opacity-60">正在同步：{calendarName}</p>
            )}
            {error && <p className="text-[11px] text-[#ff9aa9]">{error}</p>}

            {gstatus === 'connected' && (
              <>
                {/* 月 / 年 切换 */}
                <div className="flex items-center justify-between">
                  <div className="glass-strong flex p-1 rounded-[12px]">
                    {(['月', '年'] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setCalView(v)}
                        className={`px-3.5 py-1.5 rounded-[14px] text-[13px] transition active:scale-95 ${
                          calView === v ? 'text-white font-medium' : 'text-glass-soft'
                        }`}
                        style={calView === v ? { background: 'var(--color-accent-primary)' } : undefined}
                      >
                        {v}历
                      </button>
                    ))}
                  </div>
                </div>

                {calView === '月' ? renderMonth() : renderYear()}
              </>
            )}
          </div>
        ) : (
            <div className="space-y-4">
              {/* 原生 Google 同步（可选，需配置 VITE_GOOGLE_CLIENT_ID，把事件画进追星月历） */}
              {gstatus !== 'connected' && (
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-[12px] text-glass opacity-70">想把事件同步进追星月历？可连接 Google 账号</p>
                  {gstatus === 'idle' && (
                    <button
                      type="button"
                      onClick={handleConnect}
                      className="glass flex items-center gap-1.5 px-3 py-2 rounded-[16px] text-[12px] text-accent active:scale-95 transition"
                    >
                      ↻ 连接 Google 日历
                    </button>
                  )}
                  {gstatus === 'connecting' && (
                    <span className="glass flex items-center gap-1.5 px-3 py-2 rounded-[16px] text-[12px] text-glass-strong">
                      <Spinner /> 连接中…
                    </span>
                  )}
                  {gstatus === 'syncing' && (
                    <span className="glass flex items-center gap-1.5 px-3 py-2 rounded-[16px] text-[12px] text-glass-strong">
                      <Spinner /> 同步中…
                    </span>
                  )}
                </div>
              )}
              {gstatus === 'connected' && (
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[12px] text-glass-strong">
                    ✓ {email || 'Google 已连接'}
                    {lastSync ? ` · 上次同步 ${lastSync}` : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => doSync(setGStatus, setEvents, setCalendarName, setLastSync, setEmail, setError)}
                      className="glass flex items-center gap-1 px-2.5 py-1.5 rounded-[14px] text-[12px] text-accent active:scale-95 transition"
                    >
                      ↻ 同步
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="px-2.5 py-1.5 rounded-[14px] text-[12px] text-glass opacity-70 active:scale-95 transition"
                    >
                      断开
                    </button>
                  </div>
                </div>
              )}
              {calendarName && (
                <p className="text-[11px] text-glass opacity-60">正在同步：{calendarName}</p>
              )}
              {error && <p className="text-[11px] text-[#ff9aa9]">{error}</p>}

              {/* 月 / 年 切换 */}
              <div className="flex items-center justify-between">
                <div className="glass-strong flex p-1 rounded-[12px]">
                  {(['月', '年'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setCalView(v)}
                      className={`px-3.5 py-1.5 rounded-[14px] text-[13px] transition active:scale-95 ${
                        calView === v ? 'text-white font-medium' : 'text-glass-soft'
                      }`}
                      style={calView === v ? { background: 'var(--color-accent-primary)' } : undefined}
                    >
                      {v}历
                    </button>
                  ))}
                </div>
              </div>

              {calView === '月' ? renderMonth() : renderYear()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

async function doSync(
  setGStatus: (s: GStatus) => void,
  setEvents: (e: GCalEvent[]) => void,
  setCalendarName: (s: string) => void,
  setLastSync: (s: string) => void,
  setEmail: (s: string) => void,
  setError: (s: string) => void,
) {
  setGStatus('syncing')
  setError('')
  try {
    const now = new Date()
    // 拉取约 13 个月的区间（上月至次年年底），覆盖即将到来的演出行程
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const end = new Date(now.getFullYear(), now.getMonth() + 12, 0, 23, 59, 59).toISOString()
    const { events, calendarName } = await fetchEvents(start, end)
    setEvents(events)
    setCalendarName(calendarName)
    saveCalendarEvents(events.map((ev) => ev.summary || '').filter(Boolean))
    setLastSync(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
  } catch (e: any) {
    setError(e?.message || '同步失败')
    if (e?.message?.includes('重新连接') || e?.message?.includes('过期')) {
      setGStatus('idle')
      setEmail('')
      setCalendarName('')
      return
    }
  }
  if (getStoredToken()) setGStatus('connected')
}
