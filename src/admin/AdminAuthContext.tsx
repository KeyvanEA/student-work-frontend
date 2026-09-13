import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/**
 * نشست ادمین — عمداً کاملاً جدا از نشست کاربر عادی.
 *
 * ⚠️ بک‌اند هنوز هیچ authentication/permission ای برای ادمین ندارد و در جدول users
 * ستون role وجود ندارد. اینجا ستون یا نقش جدیدی اختراع نشده است؛ فقط یک نشست محلی و
 * موقت نگه داشته می‌شود تا کاربر عادی به‌طور اتفاقی وارد UI ادمین نشود.
 *
 * وقتی بک‌اند role/permission (مثلاً با middleware لاراول) اضافه کرد، تنها همین فایل
 * عوض می‌شود: به‌جای کلید localStorage، توکن و مجوز واقعی از API خوانده می‌شود.
 */

const ADMIN_SESSION_KEY = 'studentwork.admin.session'

/** رمز عبور محلی و موقت پنل — صرفاً برای جدا نگه داشتن UI ادمین در نبود API ادمین */
const LOCAL_ADMIN_PASSCODE = 'studentwork-admin'

interface AdminSession {
  name: string
  since: number
}

interface AdminAuthValue {
  session: AdminSession | null
  isAdmin: boolean
  signIn: (passcode: string) => { ok: boolean; message?: string }
  signOut: () => void
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null)

function readSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AdminSession
    return parsed && typeof parsed.name === 'string' ? parsed : null
  } catch {
    return null
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(readSession)

  // نشست ادمین فقط در همین تب زنده است (sessionStorage، نه localStorage)
  useEffect(() => {
    try {
      if (session) sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
      else sessionStorage.removeItem(ADMIN_SESSION_KEY)
    } catch {
      /* حالت private mode مرورگر */
    }
  }, [session])

  const signIn = useCallback((passcode: string) => {
    if (passcode.trim() !== LOCAL_ADMIN_PASSCODE) {
      return { ok: false, message: 'رمز ورود پنل ادمین درست نیست.' }
    }
    setSession({ name: 'ادمین', since: Date.now() })
    return { ok: true }
  }, [])

  const signOut = useCallback(() => setSession(null), [])

  const value = useMemo<AdminAuthValue>(
    () => ({ session, isAdmin: session !== null, signIn, signOut }),
    [session, signIn, signOut],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth(): AdminAuthValue {
  const context = useContext(AdminAuthContext)
  if (!context) throw new Error('useAdminAuth باید داخل AdminAuthProvider استفاده شود.')
  return context
}
