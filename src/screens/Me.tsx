import { useRef, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile } from '../lib/profile'
import { setBackground } from '../lib/background'
import { fileToDataURL } from '../lib/image'

function Toggle({ on: initial }: { on: boolean }) {
  const [on, setOn] = useState(initial)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn((v) => !v)}
      className="w-11 h-[22px] rounded-[13px] flex items-center px-0.5 transition shrink-0"
      style={{ background: on ? 'var(--color-accent-primary)' : 'rgba(95,99,104,0.25)' }}
    >
      <span
        className="w-[18px] h-[18px] rounded-full bg-white transition"
        style={{ transform: on ? 'translateX(18px)' : 'translateX(0)' }}
      />
    </button>
  )
}

function Row({
  label,
  value,
  chevron,
  toggleOn,
  onClick,
}: {
  label: string
  value?: string
  chevron?: boolean
  toggleOn?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3 first:pt-1 last:pb-1 text-left"
    >
      <span className="w-7 h-7 rounded-md flex items-center justify-center text-accent shrink-0" style={{ background: 'rgba(124,108,240,0.18)' }}>
        ●
      </span>
      <span className="flex-1 text-[14px] text-glass-strong">{label}</span>
      {value && <span className="text-[13px] text-glass opacity-80">{value}</span>}
      {toggleOn !== undefined && <Toggle on={toggleOn} />}
      {chevron && <span className="text-glass opacity-50 text-[16px]">›</span>}
    </button>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-5">
      <h2 className="text-[13px] font-medium text-glass opacity-90 mb-2.5 px-1">{title}</h2>
      <div className="glass rounded-card px-4 divide-y divide-white/10">{children}</div>
    </div>
  )
}

const swatches = [
  'linear-gradient(135deg,#7C6CF0,#FF6FB5)',
  'linear-gradient(135deg,#1E3A8A,#0F172A)',
  'linear-gradient(135deg,#F4A8D4,#C085F7)',
  'linear-gradient(135deg,#A7F0D0,#6EE7B7)',
]

export default function Me() {
  const nav = useNavigate()
  const bgRef = useRef<HTMLInputElement>(null)
  const profile = getProfile()
  const avatar = profile.avatar
  const name = profile.name || '星酱'
  const bio = profile.bio || 'Lingorm 星球的星酱 ✨'

  async function onBgPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await fileToDataURL(file, 1280)
      setBackground(url)
    } catch {
      /* 忽略 */
    }
    e.target.value = ''
  }

  return (
    <div className="-mt-1">
      {/* Profile Card */}
      <div className="glass rounded-card p-4">
        <div className="flex items-center gap-3">
          <div
            className="w-16 h-16 rounded-[28px] shrink-0 bg-cover bg-center"
            style={avatar ? { backgroundImage: `url(${avatar})` } : { background: 'linear-gradient(135deg,#7C6CF0,#FF6FB5)' }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-semibold text-glass-strong">{name}</p>
            <p className="text-[12px] text-glass opacity-70 truncate">{bio}</p>
          </div>
          <button
            type="button"
            onClick={() => nav('/edit-profile')}
            aria-label="编辑资料"
            className="w-9 h-9 rounded-2xl flex items-center justify-center text-glass-strong glass-pill active:scale-95 transition"
          >
            ✎
          </button>
        </div>
        <div className="mt-3 inline-flex px-3 py-1 rounded-[13px] text-[12px] text-white" style={{ background: 'rgba(124,108,240,0.12)' }}>
          Lv.5 · 资深CP粉
        </div>
        <div className="flex justify-around mt-4">
          {[['286', '收藏'], ['48', '活动'], ['142', '打卡']].map(([n, l]) => (
            <div key={l} className="text-center">
              <p className="text-[18px] font-bold font-mono text-glass-strong leading-none">{n}</p>
              <p className="text-[11px] text-glass opacity-70 mt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 外观与主题 */}
      <Section title="外观与主题">
        <div className="py-3">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[14px] text-glass-strong">App 背景图</span>
            <button
              type="button"
              onClick={() => bgRef.current?.click()}
              className="text-[12px] text-accent active:scale-95 transition"
            >
              更换背景图 →
            </button>
          </div>
          <div className="flex gap-2.5">
            {swatches.map((s, i) => (
              <div key={i} className="w-9 h-9 rounded-xl" style={{ background: s, outline: i === 1 ? '2px solid #fff' : 'none', outlineOffset: 2 }} />
            ))}
          </div>
          <input ref={bgRef} type="file" accept="image/*" className="hidden" onChange={onBgPick} />
        </div>
        <Row label="深色模式" toggleOn={false} />
        <Row label="应援主题色" value="● ● ●" chevron />
      </Section>

      {/* 照片与分类 */}
      <Section title="照片与分类">
        <Row label="智能分类" toggleOn />
        <Row label="GIF 自动播放" value="仅 WiFi" chevron />
        <Row label="照片对比默认" chevron />
        <Row label="数据统计" chevron onClick={() => nav('/stats')} />
      </Section>

      {/* 存储与备份 */}
      <Section title="存储与备份">
        <Row label="本地备份" chevron />
        <Row label="导出压缩包" chevron />
        <Row label="批量管理" chevron />
      </Section>

      {/* 应援打卡 */}
      <Section title="应援打卡">
        <Row label="同步 Google 日历" toggleOn />
        <Row label="打卡提醒" toggleOn />
        <Row label="打卡里程碑" chevron />
      </Section>

      {/* 动态聚合 */}
      <Section title="动态聚合">
        <Row label="绑定微博" value="已绑定" chevron />
        <Row label="绑定 Instagram" value="未绑定" chevron />
        <Row label="推送通知" toggleOn />
      </Section>

      {/* 周边与心愿 */}
      <Section title="周边与心愿">
        <Row label="周边收藏管理" chevron onClick={() => nav('/nearby')} />
        <Row label="愿望清单" chevron onClick={() => nav('/wishlist')} />
      </Section>

      {/* 关于 */}
      <Section title="关于">
        <Row label="数据统计" chevron onClick={() => nav('/stats')} />
        <Row label="关于 Lingorm 相册" value="v1.0.0" chevron />
      </Section>
    </div>
  )
}
