import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Notif = { id: number; title: string; time: string; unread: boolean }

const initial: Notif[] = [
  { id: 1, title: 'Dara Daily 娱乐访谈 即将开始', time: '15 分钟前', unread: true },
  { id: 2, title: '「绘梦婚约 EP7」今晚 21:30 首播', time: '2 小时前', unread: true },
  { id: 3, title: '你收藏了 3 张新的抱抱图', time: '昨天', unread: false },
  { id: 4, title: '7 月应援打卡已生成月度回顾', time: '昨天', unread: false },
]

export default function Notifications() {
  const nav = useNavigate()
  const [items, setItems] = useState<Notif[]>(initial)
  const [perm, setPerm] = useState<NotificationPermission>('default')
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    if (!('Notification' in window)) {
      setSupported(false)
      return
    }
    setPerm(Notification.permission)
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) return
    const p = await Notification.requestPermission()
    setPerm(p)
  }

  const sendTest = () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    new Notification('Lingorm 星球', {
      body: 'Dara Daily 娱乐访谈 还有 15 分钟开始！',
      icon: '/background.jpg',
      badge: '/background.jpg',
    })
  }

  const markRead = (id: number) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    )
  }

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  return (
    <div className="-mt-1 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[24px] font-bold text-glass-strong">通知</h1>
        <button
          type="button"
          onClick={() => nav(-1)}
          className="w-10 h-10 rounded-full glass flex items-center justify-center text-glass-strong active:scale-95 transition"
          aria-label="返回"
        >
          ✕
        </button>
      </div>

      <div className="glass-strong rounded-card p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[14px] text-glass-strong font-medium">桌面推送</span>
          <span className="text-[12px] text-glass opacity-70">
            {supported ? (perm === 'granted' ? '已开启' : '未开启') : '不支持'}
          </span>
        </div>
        <p className="text-[12px] text-glass opacity-70 mb-3">
          开启后，偶像新动态、直播提醒和打卡通知会出现在你的系统通知栏。
        </p>
        <div className="flex gap-2">
          {perm !== 'granted' && supported && (
            <button
              type="button"
              onClick={requestPermission}
              className="flex-1 py-2.5 rounded-[14px] text-white text-[13px] font-medium active:scale-95 transition"
              style={{ background: 'var(--color-accent-primary)' }}
            >
              开启通知
            </button>
          )}
          {perm === 'granted' && supported && (
            <button
              type="button"
              onClick={sendTest}
              className="flex-1 py-2.5 rounded-[14px] text-white text-[13px] font-medium active:scale-95 transition"
              style={{ background: 'var(--color-accent-primary)' }}
            >
              发送测试通知
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-[16px] font-semibold text-glass-strong">消息列表</span>
        {items.some((n) => n.unread) && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-[12px] text-accent active:scale-95 transition"
          >
            全部已读
          </button>
        )}
      </div>

      <div className="space-y-3 pb-2">
        {items.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => markRead(n.id)}
            className="glass rounded-card p-4 flex gap-3 items-start w-full text-left active:scale-[0.99] transition"
          >
            <div
              className="w-2 h-2 rounded-full mt-2 shrink-0"
              style={{ background: n.unread ? 'var(--color-accent-pink)' : 'transparent' }}
            />
            <div className="flex-1 min-w-0">
              <p className={`text-[14px] leading-snug ${n.unread ? 'text-glass-strong font-medium' : 'text-glass'}`}>
                {n.title}
              </p>
              <p className="text-[12px] text-glass opacity-60 mt-1">{n.time}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
