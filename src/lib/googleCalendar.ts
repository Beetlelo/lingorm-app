// Google Calendar 只读同步封装（纯前端 SPA，无后端）
// 使用 Google Identity Services 的 token 模式，不接触 client_secret，符合 SPA 安全规范。
// 授权范围：calendar.readonly + openid email（用于展示账号）

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly openid email'
const TOKEN_KEY = 'lingorm_gcal_token'
const API = 'https://www.googleapis.com/calendar/v3'

// 用户要同步的追星日历（来自其提供的 embed 链接）
export const TARGET_CALENDAR_ID =
  'a7cac20df234f8dd78c17b17764e7b65cc799ddda1b5c2f1d7c06100d8ad79b6@group.calendar.google.com'

// 用于 iframe 嵌入的地址：公开日历可直接显示；私有日历需在该浏览器登录 Google。
export const GOOGLE_EMBED_URL = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(
  TARGET_CALENDAR_ID,
)}&ctz=Asia/Shanghai&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&mode=MONTH&hl=zh_CN`

export type GCalEvent = {
  id: string
  summary?: string
  start?: { date?: string; dateTime?: string }
  end?: { date?: string; dateTime?: string }
  location?: string
  description?: string
}

type TokenResponse = {
  access_token?: string
  error?: string
  error_description?: string
}

let scriptPromise: Promise<void> | null = null

// 动态加载 Google Identity Services 脚本（只加载一次，失败可重试）
function loadGIS(): Promise<void> {
  const w = window as any
  if (w.google?.accounts?.oauth2) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => {
      scriptPromise = null
      reject(new Error('Google 授权组件加载失败，请检查网络/VPN 后重试'))
    }
    document.head.appendChild(s)
  })
  return scriptPromise
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// 弹出 Google 授权窗口，成功后把 access_token 存入 localStorage
// 已有有效 token 时直接复用，不重复弹窗。
export async function connect(clientId: string): Promise<string> {
  await loadGIS()
  const w = window as any
  const existing = getStoredToken()
  // 如果本地已经存了 token，直接复用，不再弹窗
  if (existing) return existing

  return new Promise<string>((resolve, reject) => {
    let settled = false
    // 超时保护：若 10 秒内未收到回调，大概率是弹窗被拦截或网络不通
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      reject(
        new Error(
          '授权窗口未响应。最常见原因：1) 浏览器拦截了弹窗；2) 网络/VPN 无法访问 accounts.google.com。请在浏览器设置里允许本站弹窗，或换电脑 Chrome 测试。',
        ),
      )
    }, 10000)

    const client = w.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (resp: TokenResponse) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        if (resp.error) {
          // 用户取消/关闭窗口
          if (resp.error === 'popup_closed_by_user' || resp.error === 'access_denied') {
            reject(new Error('授权窗口被关闭，未获取权限'))
            return
          }
          reject(new Error(resp.error_description || resp.error))
          return
        }
        if (!resp.access_token) {
          reject(new Error('未获取到授权令牌'))
          return
        }
        localStorage.setItem(TOKEN_KEY, resp.access_token)
        resolve(resp.access_token)
      },
    })

    try {
      // 不强制 consent：已授权用户可直接拿到 token；首次/需要重新授权时才弹出同意页
      client.requestAccessToken()
    } catch (e: any) {
      if (!settled) {
        settled = true
        clearTimeout(timer)
        reject(new Error(e?.message || '唤起 Google 授权窗口失败'))
      }
    }
  })
}

export type GCalCalendar = { id: string; summary: string; primary?: boolean }

// 列出当前授权用户可见的所有日历（含主日历、共享/订阅日历）
export async function listCalendars(): Promise<GCalCalendar[]> {
  const token = getStoredToken()
  if (!token) throw new Error('未连接 Google 日历')
  const res = await fetch(`${API}/users/me/calendarList`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) {
    clearToken()
    throw new Error('授权已过期，请重新连接')
  }
  if (!res.ok) throw new Error(`获取日历列表失败（${res.status}）`)
  const data = await res.json()
  return (data.items ?? []) as GCalCalendar[]
}

// 自动选择要同步的日历：优先找名字包含 LingOrm 的日历，否则回退到初始目标日历
export async function resolveTargetCalendar(): Promise<{ id: string; name: string }> {
  try {
    const cals = await listCalendars()
    const match = cals.find((c) => /lingorm/i.test(c.summary))
    if (match) return { id: match.id, name: match.summary }
  } catch {
    /* 列表获取失败时静默回退 */
  }
  return { id: TARGET_CALENDAR_ID, name: 'Lingorm 日历' }
}

// 拉取目标日历在 [timeMin, timeMax] 区间内的事件
// 使用 timeZone=Asia/Shanghai 让 Google 返回带 +08:00 的时间，避免浏览器本地时区不一致导致日期偏移。
// 自动处理 nextPageToken 分页，确保大量事件也能完整拉取。
export async function fetchEvents(
  timeMin: string,
  timeMax: string,
): Promise<{ events: GCalEvent[]; calendarName: string }> {
  const token = getStoredToken()
  if (!token) throw new Error('未连接 Google 日历')
  const { id: calendarId, name: calendarName } = await resolveTargetCalendar()

  const allEvents: GCalEvent[] = []
  let pageToken: string | undefined
  do {
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '2500',
      timeZone: 'Asia/Shanghai',
    })
    if (pageToken) params.set('pageToken', pageToken)

    const res = await fetch(
      `${API}/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    if (res.status === 401) {
      clearToken()
      throw new Error('授权已过期，请重新连接')
    }
    if (!res.ok) throw new Error(`Google 日历请求失败（${res.status}）`)
    const data = await res.json()
    const items = (data.items ?? []) as GCalEvent[]
    allEvents.push(...items)
    pageToken = data.nextPageToken
  } while (pageToken)

  return { events: allEvents, calendarName }
}

// 获取已授权账号信息（邮箱/昵称）用于界面展示
export async function fetchUserInfo(): Promise<{ email: string; name?: string }> {
  const token = getStoredToken()
  if (!token) throw new Error('未连接')
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('获取账号信息失败')
  const data = await res.json()
  return { email: data.email, name: data.name }
}

// 把 Google 事件的开始时间解析为本地 Date
// 全天事件使用 start.date（YYYY-MM-DD），按字符串拆分为本地年月日，避免被浏览器解析成 UTC 导致日期偏移。
// 带时间事件使用 start.dateTime（已要求 API 返回 Asia/Shanghai 时区），new Date 会正确解析为本地时刻。
export function eventStartDate(ev: GCalEvent): Date | null {
  const dateOnly = ev.start?.date
  const dateTime = ev.start?.dateTime

  if (dateOnly && !dateTime) {
    const [y, m, d] = dateOnly.split('-').map((n) => parseInt(n, 10))
    if (!y || !m || !d) return null
    return new Date(y, m - 1, d)
  }

  const raw = dateTime || dateOnly
  if (!raw) return null
  return new Date(raw)
}
