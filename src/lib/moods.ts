// Mood check-in — user records how they feel about Lingorm on a given day.
// Persisted to localStorage so the calendar can show a mood dot per day.

export type Mood = {
  date: string // YYYY-MM-DD
  emoji: string
  text: string
  photoId?: number
}

const KEY = 'lingorm_moods'

export function dateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getMoods(): Mood[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as Mood[]
  } catch {
    return []
  }
}

// One mood per day: overwrite if the same date already exists.
export function addMood(m: Mood): void {
  const all = getMoods().filter((x) => x.date !== m.date)
  all.push(m)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function getMoodByDate(date: string): Mood | undefined {
  return getMoods().find((m) => m.date === date)
}
