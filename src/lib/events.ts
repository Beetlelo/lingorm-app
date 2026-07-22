// 统一活动数据（被 Calendar 月历/时间线 与 EventDetail 共用）
// 避免首页时间线跳转 id 与详情页对不上的问题。

export type CalEvent = {
  id: string
  summary: string
  start: string // 'HH:MM' 或 '全天'
  end?: string
  location: string
  allDay: boolean
  source: 'lingorm' | 'google'
  date: Date
  color: string
  desc: string
  materials: MaterialSeed[]
}

export type MaterialSeed = {
  id: string
  title: string
  type: string // 正片 / 预告 / 花絮 / 二创 / 直播
  duration: string // 时长，如 12:30
  done?: boolean
}

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day)

export const lingormEvents: CalEvent[] = [
  {
    id: 'dara-0718',
    summary: 'Dara Daily 娱乐访谈',
    start: '全天',
    allDay: true,
    source: 'lingorm',
    location: 'YouTube 频道',
    date: d(2026, 7, 18),
    color: '#7C6CF0',
    desc: 'Lingorm 双人访谈，回顾本周名场面与幕后趣事，记得刷完物料打卡～',
    materials: [
      { id: 'm1', title: '正片回放', type: '正片', duration: '42:18' },
      { id: 'm2', title: '预告片 30s', type: '预告', duration: '0:30' },
      { id: 'm3', title: '幕后花絮合集', type: '花絮', duration: '08:52' },
      { id: 'm4', title: '粉丝混剪二创', type: '二创', duration: '05:11' },
    ],
  },
  {
    id: 'dara-live-0717',
    summary: 'Dara Daily 娱乐访谈',
    start: '20:00',
    end: '21:00',
    allDay: false,
    source: 'lingorm',
    location: '直播 · 泰国',
    date: d(2026, 7, 17),
    color: '#FF6FB5',
    desc: '直播连线，现场互动读评论，回放已上传。',
    materials: [
      { id: 'm1', title: '直播回放', type: '直播', duration: '61:04' },
      { id: 'm2', title: '高光剪辑', type: '花絮', duration: '03:27' },
    ],
  },
  {
    id: 'daradaily-0720',
    summary: 'Dara Daily 娱乐访谈',
    start: '14:00',
    end: '15:00',
    allDay: false,
    source: 'lingorm',
    location: '曼谷 · 中央世界',
    date: d(2026, 7, 20),
    color: '#7C6CF0',
    desc: '线下见面访谈场，可现场打卡并上传照片。',
    materials: [
      { id: 'm1', title: '开场 VCR', type: '预告', duration: '01:45' },
      { id: 'm2', title: '正片回放', type: '正片', duration: '58:30' },
    ],
  },
  {
    id: 'ep7-0720',
    summary: '绘梦婚约 EP7 首播',
    start: '21:30',
    end: '22:30',
    allDay: false,
    source: 'lingorm',
    location: '线上 · 爱奇艺',
    date: d(2026, 7, 20),
    color: '#FF6FB5',
    desc: '第 7 集首播，刷完正片与花絮即可打卡。',
    materials: [
      { id: 'm1', title: 'EP7 正片', type: '正片', duration: '45:00' },
      { id: 'm2', title: '片尾彩蛋', type: '花絮', duration: '02:10' },
      { id: 'm3', title: '杀青特辑', type: '花絮', duration: '11:39' },
    ],
  },
  {
    id: 'fansign-0725',
    summary: '粉丝见面会',
    start: '16:00',
    end: '18:00',
    allDay: false,
    source: 'lingorm',
    location: '深圳湾体育中心',
    date: d(2026, 7, 25),
    color: '#7C6CF0',
    desc: '深圳场粉丝见面会，含物料放映与合影环节。',
    materials: [
      { id: 'm1', title: '入场须知影片', type: '预告', duration: '04:02' },
      { id: 'm2', title: '应援教学 MV', type: '正片', duration: '03:55' },
      { id: 'm3', title: '现场回顾', type: '花絮', duration: '09:20' },
    ],
  },
  {
    id: 'recording-0726',
    summary: '综艺录制',
    start: '全天',
    allDay: true,
    source: 'lingorm',
    location: '长沙',
    date: d(2026, 7, 26),
    color: '#C084FC',
    desc: '综艺节目录制日，相关物料稍后上传。',
    materials: [{ id: 'm1', title: '预告先导片', type: '预告', duration: '01:18' }],
  },
]

export function getEvent(id: string): CalEvent | undefined {
  return lingormEvents.find((e) => e.id === id)
}
