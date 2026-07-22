export type Photo = {
  id: string
  title: string
  location: string
  date: string
  tags: string[]
  gradient: string
}

export type Album = {
  id: string
  name: string
  count: number
  gradient: string
}

export type Trip = {
  id: string
  title: string
  place: string
  dateRange: string
  photoCount: number
  gradient: string
}

export type CalendarDay = {
  date: string
  photoCount: number
}

export type Moment = {
  id: string
  user: string
  avatar: string
  caption: string
  gradient: string
  likes: number
  comments: number
  liked: boolean
}

export type NearbyItem = {
  id: string
  title: string
  price: number
  distance: string
  gradient: string
}

export type WishItem = {
  id: string
  title: string
  price: number
  purchased: boolean
  gradient: string
}

export type User = {
  name: string
  handle: string
  bio: string
  avatar: string
}

export const currentUser: User = {
  name: 'Ling',
  handle: '@lingorm',
  bio: '收集旅途里散落的光',
  avatar: '🪐',
}

export const TAGS = ['旅行', '人物', '风景', '美食', '节日']

export const photos: Photo[] = [
  { id: 'p1', title: '海边的清晨', location: '冲绳', date: '2026-03-12', tags: ['风景', '旅行'], gradient: 'linear-gradient(135deg,#5b7cfa,#9b6cf0)' },
  { id: 'p2', title: '巷口的面摊', location: '台南', date: '2026-02-28', tags: ['美食'], gradient: 'linear-gradient(135deg,#ff6fb5,#ff9a6c)' },
  { id: 'p3', title: '雪山徒步', location: '瑞士', date: '2026-01-15', tags: ['风景', '旅行'], gradient: 'linear-gradient(135deg,#7c6cf0,#4fd1c5)' },
  { id: 'p4', title: '跨年烟火', location: '东京', date: '2025-12-31', tags: ['节日'], gradient: 'linear-gradient(135deg,#f87171,#ff6fb5)' },
  { id: 'p5', title: '老友合影', location: '上海', date: '2025-11-20', tags: ['人物'], gradient: 'linear-gradient(135deg,#60a5fa,#7c6cf0)' },
  { id: 'p6', title: '晨雾中的湖', location: '大理', date: '2025-10-08', tags: ['风景'], gradient: 'linear-gradient(135deg,#34d399,#60a5fa)' },
  { id: 'p7', title: '夜市小吃', location: '曼谷', date: '2025-09-30', tags: ['美食'], gradient: 'linear-gradient(135deg,#fbbf24,#ff6fb5)' },
  { id: 'p8', title: '古镇屋檐', location: '京都', date: '2025-08-22', tags: ['风景', '旅行'], gradient: 'linear-gradient(135deg,#a78bfa,#f472b6)' },
  { id: 'p9', title: '生日派对', location: '新加坡', date: '2025-07-11', tags: ['节日', '人物'], gradient: 'linear-gradient(135deg,#ff6fb5,#fbbf24)' },
  { id: 'p10', title: '公路旅行', location: '加州', date: '2025-06-02', tags: ['旅行'], gradient: 'linear-gradient(135deg,#7c6cf0,#22d3ee)' },
  { id: 'p11', title: '咖啡馆窗边', location: '里斯本', date: '2025-05-19', tags: ['人物', '美食'], gradient: 'linear-gradient(135deg,#fb923c,#ff6fb5)' },
  { id: 'p12', title: '极光之夜', location: '特罗姆瑟', date: '2025-04-03', tags: ['风景'], gradient: 'linear-gradient(135deg,#4f46e5,#22d3ee)' },
  { id: 'p13', title: '花市早晨', location: '清迈', date: '2025-03-14', tags: ['节日', '风景'], gradient: 'linear-gradient(135deg,#34d399,#a78bfa)' },
  { id: 'p14', title: '码头落日', location: '悉尼', date: '2025-02-26', tags: ['风景', '旅行'], gradient: 'linear-gradient(135deg,#f97316,#7c6cf0)' },
]

export const albums: Album[] = [
  { id: 'a1', name: '全部照片', count: 248, gradient: 'linear-gradient(135deg,#7c6cf0,#ff6fb5)' },
  { id: 'a2', name: '旅行', count: 96, gradient: 'linear-gradient(135deg,#5b7cfa,#9b6cf0)' },
  { id: 'a3', name: '美食', count: 54, gradient: 'linear-gradient(135deg,#fbbf24,#ff6fb5)' },
  { id: 'a4', name: '人物', count: 41, gradient: 'linear-gradient(135deg,#60a5fa,#7c6cf0)' },
  { id: 'a5', name: '风景', count: 38, gradient: 'linear-gradient(135deg,#34d399,#60a5fa)' },
  { id: 'a6', name: '节日', count: 19, gradient: 'linear-gradient(135deg,#f87171,#ff6fb5)' },
]

export const trips: Trip[] = [
  { id: 't1', title: '北海道雪国', place: '日本 · 北海道', dateRange: '01.10 – 01.17', photoCount: 32, gradient: 'linear-gradient(135deg,#7c6cf0,#4fd1c5)' },
  { id: 't2', title: '东南亚慢游', place: '泰国 · 清迈', dateRange: '03.02 – 03.12', photoCount: 27, gradient: 'linear-gradient(135deg,#34d399,#a78bfa)' },
  { id: 't3', title: '欧洲三城', place: '法 / 瑞 / 意', dateRange: '06.01 – 06.15', photoCount: 51, gradient: 'linear-gradient(135deg,#ff6fb5,#fbbf24)' },
  { id: 't4', title: '北欧追光', place: '挪威 · 特罗姆瑟', dateRange: '12.20 – 12.27', photoCount: 18, gradient: 'linear-gradient(135deg,#4f46e5,#22d3ee)' },
]

export const calendarDays: CalendarDay[] = [
  { date: '2026-03-12', photoCount: 6 },
  { date: '2026-02-28', photoCount: 3 },
  { date: '2026-01-15', photoCount: 9 },
  { date: '2025-12-31', photoCount: 12 },
  { date: '2025-11-20', photoCount: 4 },
  { date: '2025-10-08', photoCount: 7 },
  { date: '2025-09-30', photoCount: 5 },
  { date: '2025-08-22', photoCount: 8 },
]

export const moments: Moment[] = [
  { id: 'm1', user: '小琳', avatar: '🌿', caption: '冲绳的海，蓝得像被调过饱和度。', gradient: 'linear-gradient(135deg,#5b7cfa,#9b6cf0)', likes: 128, comments: 12, liked: false },
  { id: 'm2', user: '阿哲', avatar: '📷', caption: '一路向西，公路尽头的落日。', gradient: 'linear-gradient(135deg,#7c6cf0,#22d3ee)', likes: 86, comments: 7, liked: true },
  { id: 'm3', user: 'Mia', avatar: '🌸', caption: '京都的屋檐下，时间走得很慢。', gradient: 'linear-gradient(135deg,#a78bfa,#f472b6)', likes: 204, comments: 23, liked: false },
  { id: 'm4', user: '老周', avatar: '🍜', caption: '台南的巷口，一碗面治愈所有疲惫。', gradient: 'linear-gradient(135deg,#ff6fb5,#ff9a6c)', likes: 157, comments: 19, liked: false },
  { id: 'm5', user: 'Yuki', avatar: '⛄', caption: '特罗姆瑟的极光，此生第一次。', gradient: 'linear-gradient(135deg,#4f46e5,#22d3ee)', likes: 312, comments: 41, liked: true },
  { id: 'm6', user: 'Coco', avatar: '🎂', caption: '新加坡的生日，烟火和蛋糕都安排上。', gradient: 'linear-gradient(135deg,#ff6fb5,#fbbf24)', likes: 98, comments: 9, liked: false },
  { id: 'm7', user: '阿哲', avatar: '📷', caption: '里斯本的小酒馆，窗边最适合发呆。', gradient: 'linear-gradient(135deg,#fb923c,#ff6fb5)', likes: 73, comments: 5, liked: false },
  { id: 'm8', user: '小琳', avatar: '🌿', caption: '清迈花市，一早就被颜色叫醒。', gradient: 'linear-gradient(135deg,#34d399,#a78bfa)', likes: 142, comments: 15, liked: false },
]

export const nearbyItems: NearbyItem[] = [
  { id: 'n1', title: '极光摄影之旅', price: 1280, distance: '1.2km', gradient: 'linear-gradient(135deg,#4f46e5,#22d3ee)' },
  { id: 'n2', title: '当地美食地图', price: 39, distance: '0.4km', gradient: 'linear-gradient(135deg,#fbbf24,#ff6fb5)' },
  { id: 'n3', title: '手工陶瓷杯', price: 128, distance: '3.1km', gradient: 'linear-gradient(135deg,#7c6cf0,#60a5fa)' },
  { id: 'n4', title: '古城导览音频', price: 19, distance: '0.8km', gradient: 'linear-gradient(135deg,#34d399,#a78bfa)' },
  { id: 'n5', title: '限定明信片', price: 15, distance: '2.0km', gradient: 'linear-gradient(135deg,#ff6fb5,#f472b6)' },
  { id: 'n6', title: '雪山徒步装备租赁', price: 360, distance: '5.6km', gradient: 'linear-gradient(135deg,#60a5fa,#4fd1c5)' },
]

export const wishItems: WishItem[] = [
  { id: 'w1', title: '冰岛极光之旅', price: 6800, purchased: false, gradient: 'linear-gradient(135deg,#4f46e5,#22d3ee)' },
  { id: 'w2', title: '复古胶片相机', price: 1200, purchased: true, gradient: 'linear-gradient(135deg,#7c6cf0,#ff6fb5)' },
  { id: 'w3', title: '手冲咖啡套装', price: 420, purchased: false, gradient: 'linear-gradient(135deg,#fb923c,#ff9a6c)' },
  { id: 'w4', title: '旅行手账本', price: 88, purchased: false, gradient: 'linear-gradient(135deg,#34d399,#60a5fa)' },
  { id: 'w5', title: '降噪耳机', price: 1599, purchased: true, gradient: 'linear-gradient(135deg,#a78bfa,#f472b6)' },
]
