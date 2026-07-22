// 物料视频"是否已看/打卡"的本地持久化
import type { MaterialSeed } from './events'

const KEY = 'lingorm:materials'

type Store = Record<string, Record<string, boolean>>

function load(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

function save(s: Store) {
  localStorage.setItem(KEY, JSON.stringify(s))
}

export type MaterialItem = MaterialSeed & { done: boolean }

// 合并默认物料与本地已打卡状态
export function getMaterials(eventId: string, defaults: MaterialSeed[]): MaterialItem[] {
  const store = load()
  const checked = store[eventId] || {}
  return defaults.map((m) => ({ ...m, done: checked[m.id] ?? !!m.done }))
}

export function toggleMaterial(eventId: string, materialId: string) {
  const store = load()
  const checked = { ...(store[eventId] || {}) }
  checked[materialId] = !checked[materialId]
  store[eventId] = checked
  save(store)
}

export function progressOf(items: MaterialItem[]): { done: number; total: number } {
  return { done: items.filter((m) => m.done).length, total: items.length }
}
