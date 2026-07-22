// 保存的搜索 / 智能相册：把常用查询条件（如「今年 合照」）持久化为常驻相册。
export interface SavedSearch {
  name: string
  query: string // 搜索词（与相册搜索框同语义）
  cat: string // 当前分类（'全部' / 某标签 / '收藏'）
}

const KEY = 'lingorm_saved_searches'

export function getSavedSearches(): SavedSearch[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as SavedSearch[]
  } catch {
    return []
  }
}

// 同名则覆盖，否则追加。返回更新后的列表。
export function saveSearch(s: SavedSearch): SavedSearch[] {
  const list = getSavedSearches()
  const i = list.findIndex((x) => x.name === s.name)
  if (i >= 0) list[i] = s
  else list.push(s)
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* noop */
  }
  return list
}

export function deleteSavedSearch(name: string): SavedSearch[] {
  const list = getSavedSearches().filter((x) => x.name !== name)
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* noop */
  }
  return list
}
