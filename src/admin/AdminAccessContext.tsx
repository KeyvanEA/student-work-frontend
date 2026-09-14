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
 * اینجا فقط UI بر اساس نقش کنترل می‌شود.
 *
 * چطور نقش را می‌فهمیم؟
 *  ۱) اگر پاسخ کاربر رابطهٔ `roles` را داشت، از همان خوانده می‌شود (بدون درخواست اضافه).
 *     بک‌اند فعلی این رابطه را eager-load نمی‌کند، پس معمولاً این حالت رخ نمی‌دهد.
 *  ۲) در غیر این صورت یک بار `GET /api/admin/dashboard` زده می‌شود؛ ۲۰۰ یعنی ادمین و
 *     ۴۰۳ یعنی کاربر عادی. این همان endpoint واقعی بک‌اند است و چیزی اختراع نمی‌شود.
 *
 * نتیجه برای هر کاربر در همان نشست cache می‌شود تا این بررسی تکرار نشود.
 */

export type AdminAccessStatus = 'idle' | 'checking' | 'admin' | 'denied' | 'error'

interface AdminAccessValue {
  status: AdminAccessStatus
  isAdmin: boolean
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

  // با تغییر کاربر (ورود/خروج) وضعیت از نو ارزیابی می‌شود
  useEffect(() => {
    inFlight.current = null

    if (!isAuthenticated || !user) {
      setStatus('idle')
      return
    }

    const fromRole = roleFromUser(user)
    if (fromRole !== null) {
      writeCache(user.id, fromRole)
      setStatus(fromRole ? 'admin' : 'denied')
      return
    }

    const cached = readCache(user.id)
    setStatus(cached === null ? 'idle' : cached ? 'admin' : 'denied')
  }, [isAuthenticated, user])

  const ensureChecked = useCallback(
    async (forUser?: User | null): Promise<boolean> => {
      const target = forUser ?? user
      if (!target || (!forUser && !isAuthenticated)) return false

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
    },
    [isAuthenticated, user],
  )

  const value = useMemo<AdminAccessValue>(
    () => ({ status, isAdmin: status === 'admin', ensureChecked }),
    [status, ensureChecked],
  )

  return <AdminAccessContext.Provider value={value}>{children}</AdminAccessContext.Provider>
}

export function useAdminAccess(): AdminAccessValue {
  const context = useContext(AdminAccessContext)
  if (!context) throw new Error('useAdminAccess باید داخل AdminAccessProvider استفاده شود.')
  return context
}
