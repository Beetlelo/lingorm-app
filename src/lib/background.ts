const KEY = 'lingorm_bg'

type Listener = () => void
let listeners: Listener[] = []

export function getBackground(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setBackground(dataUrl: string): void {
  localStorage.setItem(KEY, dataUrl)
  listeners.forEach((l) => l())
}

// 订阅背景变化，便于 Background 组件实时刷新（无需整页 reload）
export function onBackgroundChange(l: Listener): () => void {
  listeners.push(l)
  return () => {
    listeners = listeners.filter((x) => x !== l)
  }
}
