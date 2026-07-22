const KEY = 'lingorm_profile'

export type Profile = {
  name?: string
  bio?: string
  avatar?: string // dataURL
}

export function getProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Profile) : {}
  } catch {
    return {}
  }
}

export function setProfile(p: Profile): void {
  localStorage.setItem(KEY, JSON.stringify(p))
}
