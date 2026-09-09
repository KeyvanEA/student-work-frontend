/**
 * دفترچهٔ محلی شناسه‌ها.
 *
 * ⚠️ چرا لازم است؟ بک‌اند فعلی هیچ endpoint لیستی برای «پروژه‌های من»،
 * «درخواست‌های من» و «تحویل‌های یک پروژه» ندارد و پاسخ accept کردن یک
 * Application هم `project_id` برنمی‌گرداند. برای اینکه کاربر بتواند در
 * طول دمو بین صفحات جابه‌جا شود، هر شناسه‌ای که در همین نشست «واقعاً از API
 * دیده شده» را محلی نگه می‌داریم. این فقط یک میان‌بر ناوبری سمت کلاینت است و
 * هیچ داده‌ای را جعل نمی‌کند — محتوای صفحات همیشه از API واقعی خوانده می‌شود.
 *
 * TODO(backend): با افزوده‌شدن GET /projects و GET /projects/{id}/deliveries
 * و برگرداندن project_id در پاسخ accept، این فایل حذف می‌شود.
 */

export type RecentKind = 'task' | 'application' | 'project' | 'delivery'

export interface RecentEntry {
  id: number
  kind: RecentKind
  title: string
  subtitle?: string
  /** شناسه منبع والد (مثلاً project_id یک delivery) برای ساختن لینک دقیق‌تر */
  parentId?: number
  seenAt: number
}

const STORAGE_KEY = 'studentwork.recent'
const MAX_PER_KIND = 12
const CHANGE_EVENT = 'studentwork:recent-changed'

function readAll(): RecentEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as RecentEntry[]) : []
  } catch {
    return []
  }
}

function writeAll(entries: RecentEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    /* حالت private mode */
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

export function rememberEntry(entry: Omit<RecentEntry, 'seenAt'>) {
  const all = readAll().filter((item) => !(item.kind === entry.kind && item.id === entry.id))
  all.unshift({ ...entry, seenAt: Date.now() })

  const trimmed: RecentEntry[] = []
  const counters: Partial<Record<RecentKind, number>> = {}
  for (const item of all) {
    const count = counters[item.kind] ?? 0
    if (count >= MAX_PER_KIND) continue
    counters[item.kind] = count + 1
    trimmed.push(item)
  }
  writeAll(trimmed)
}

export function listEntries(kind: RecentKind): RecentEntry[] {
  return readAll()
    .filter((item) => item.kind === kind)
    .sort((a, b) => b.seenAt - a.seenAt)
}

export function forgetEntry(kind: RecentKind, id: number) {
  writeAll(readAll().filter((item) => !(item.kind === kind && item.id === id)))
}

export function clearRecent() {
  writeAll([])
}

export function subscribeRecent(listener: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}
