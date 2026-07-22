// 全系统统计的唯一来源 (single source of truth)。
// 首页 Hero、统计页、以及未来任何展示计数的地方都从这里取数，
// 保证跨页面口径完全一致，杜绝写死的示例数字（如首页曾经的 "48"）。
import { getPhotos, getFavorites, getCalendarEventNames } from './photos'
import { getMoods } from './moods'
import { lingormEvents } from './events'

export type AppStats = {
  photos: number
  favorites: number
  moods: number
  events: number
}

export function getStats(): AppStats {
  // 活动场次 = 追星日历内置活动 + 已同步的 Google 行程，随同步实时变化
  const events = lingormEvents.length + getCalendarEventNames().length
  return {
    photos: getPhotos().length,
    favorites: getFavorites().length,
    moods: getMoods().length,
    events,
  }
}
