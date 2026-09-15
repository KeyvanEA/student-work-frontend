import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ApiError } from '@/api/client'
import { fetchAdminDashboard } from '@/admin/api/adminApi'
import { useAuth } from '@/auth/AuthContext'
import type { User } from '@/types/models'

/**
 * تشخیص «کاربر جاری ادمین است یا نه».
 *
 * ورود ادمین همان ورود عادی پروژه است و هیچ صفحه یا endpoint جداگانه‌ای ندارد.
 * امنیت واقعی سمت بک‌اند است (middleware `admin` روی مسیرهای /api/admin/*)؛
 * اینجا فقط UI و مسیریابی بر اساس نقش کنترل می‌شود.
 *
 * چطور نقش را می‌فهمیم؟
 *  ۱) اگر پاسخ کاربر رابطهٔ `roles` را داشت، از همان خوانده می‌شود (بدون درخواست اضافه).
 *     بک‌اند فعلی این رابطه را eager-load نمی‌کند، پس معمولاً این حالت رخ نمی‌دهد.
 *  ۲) در غیر این صورت یک بار `GET /api/admin/dashboard` زده می‌شود؛ ۲۰۰ یعنی ادمین و
 *     ۴۰۳ یعنی کاربر عادی. این همان endpoint واقعی بک‌اند است و چیزی اختراع نمی‌شود.
 *
 * نتیجه برای هر کاربر در همان نشست cache می‌شود تا این بررسی تکرار نشود.
 *
 * بررسی به‌محض شناخته‌شدن کاربر و بدون انتظار برای ورود به مسیر /admin انجام می‌شود،
 * تا تصمیم‌های مسیریابی (ورود و رفرش صفحه) هرگز مجبور نشوند نقش را حدس بزنند و
 * داشبورد اشتباه حتی برای یک لحظه رندر نشود.
 */

export type AdminAccessStatus = 'idle' | 'checking' | 'admin' | 'denied' | 'error'

interface AdminAccessValue {
  status: AdminAccessStatus
  isAdmin: boolean
  /**
   * نقش کاربر جاری قطعی شده است؟
   * تا وقتی این false است هیچ redirect وابسته به نقش نباید انجام شود.
   * برای کاربر مهمان هم true است، چون «ادمین نبودن» او قطعی است.
   */
  resolved: boolean
  /**
   * بررسی دسترسی (در صورت لازم) و برگرداندن نتیجه.
   *
   * `forUser` برای لحظهٔ بلافاصله پس از ورود است؛ در آن لحظه هنوز state کاربر در
   * context به‌روز نشده و باید کاربری که خودِ login برگردانده صریحاً پاس داده شود.
   */
  ensureChecked: (forUser?: User | null) => Promise<boolean>
}

const AdminAccessContext = createContext<AdminAccessValue | null>(null)

const CACHE_PREFIX = 'studentwork.admin-access.'

function roleFromUser(user: User | null): boolean | null {
  if (!user?.roles) return null
  return user.roles.some((role) => role.name === 'admin')
}

function readCache(userId: number): boolean | null {
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${userId}`)
    if (raw === 'true') return true
    if (raw === 'false') return false
    return null
  } catch {
    return null
  }
}

function writeCache(userId: number, value: boolean) {
  try {
    sessionStorage.setItem(`${CACHE_PREFIX}${userId}`, String(value))
  } catch {
    /* حالت private mode مرورگر */
  }
}

export function AdminAccessProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [status, setStatus] = useState<AdminAccessStatus>('idle')

  /** جلوگیری از چند بررسی هم‌زمان وقتی چند کامپوننت با هم درخواست می‌دهند */
  const inFlight = useRef<Promise<boolean> | null>(null)

  /**
   * کاربر جاری برای `ensureChecked()` بدون آرگومان.
   * از ref خوانده می‌شود تا هویت `ensureChecked` ثابت بماند و effectهای مصرف‌کننده
   * با هر رندر دوباره اجرا نشوند.
   */
  const currentUser = useRef<User | null>(null)
  currentUser.current = isAuthenticated ? user : null

  const resolveFor = useCallback(async (target: User | null): Promise<boolean> => {
    if (!target) return false

    const fromRole = roleFromUser(target)
    if (fromRole !== null) {
      writeCache(target.id, fromRole)
      setStatus(fromRole ? 'admin' : 'denied')
      return fromRole
    }

    const cached = readCache(target.id)
    if (cached !== null) {
      setStatus(cached ? 'admin' : 'denied')
      return cached
    }

    if (inFlight.current) return inFlight.current

    setStatus('checking')
    const request = fetchAdminDashboard()
      .then(() => {
        writeCache(target.id, true)
        setStatus('admin')
        return true
      })
      .catch((error: unknown) => {
        // ۴۰۳ یعنی کاربر عادی — یک پاسخ معتبر، نه خطای غیرمنتظره
        if (error instanceof ApiError && error.status === 403) {
          writeCache(target.id, false)
          setStatus('denied')
          return false
        }
        setStatus('error')
        return false
      })
      .finally(() => {
        inFlight.current = null
      })

    inFlight.current = request
    return request
  }, [])

  const ensureChecked = useCallback(
    (forUser?: User | null) => resolveFor(forUser ?? currentUser.current),
    [resolveFor],
  )

  // با مشخص شدن کاربر (ورود یا بازیابی نشست) نقش بلافاصله تعیین می‌شود؛ با خروج پاک می‌شود.
  useEffect(() => {
    if (!isAuthenticated || !user) {
      inFlight.current = null
      setStatus('idle')
      return
    }
    void resolveFor(user)
  }, [isAuthenticated, user, resolveFor])

  const value = useMemo<AdminAccessValue>(
    () => ({
      status,
      isAdmin: status === 'admin',
      // وقتی کاربری وارد نشده، «ادمین نبودن» قطعی است؛ 'error' هم نتیجهٔ نهایی این نشست است.
      resolved: !isAuthenticated || status === 'admin' || status === 'denied' || status === 'error',
      ensureChecked,
    }),
    [status, isAuthenticated, ensureChecked],
  )

  return <AdminAccessContext.Provider value={value}>{children}</AdminAccessContext.Provider>
}

export function useAdminAccess(): AdminAccessValue {
  const context = useContext(AdminAccessContext)
  if (!context) throw new Error('useAdminAccess باید داخل AdminAccessProvider استفاده شود.')
  return context
}
