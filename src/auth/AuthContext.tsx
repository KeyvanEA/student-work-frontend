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
import { getToken, setToken, UNAUTHORIZED_EVENT } from '@/api/client'
import * as authApi from '@/api/auth'
import { fetchProfile } from '@/api/profile'
import type { User } from '@/types/models'

type AuthStatus = 'loading' | 'authenticated' | 'guest'

interface AuthContextValue {
  user: User | null
  status: AuthStatus
  isAuthenticated: boolean
  login: (mobile: string) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>(() => (getToken() ? 'loading' : 'guest'))
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  /** بازیابی نشست از روی توکن ذخیره‌شده (حفظ وضعیت Login) */
  useEffect(() => {
    if (!getToken()) return
    let cancelled = false

    fetchProfile()
      .then((profile) => {
        if (cancelled) return
        setUserState(profile)
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        setToken(null)
        setUserState(null)
        setStatus('guest')
      })

    return () => {
      cancelled = true
    }
  }, [])

  /** اگر هر درخواستی ۴۰۱ گرفت، نشست را پاک کن */
  useEffect(() => {
    const handleUnauthorized = () => {
      setUserState(null)
      setStatus('guest')
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [])

  const login = useCallback(async (mobile: string) => {
    const result = await authApi.login(mobile)
    // پاسخ login رابطه‌ها را ندارد؛ پروفایل کامل (همراه مهارت‌ها) را می‌گیریم.
    let profile = result.user
    try {
      profile = await fetchProfile()
    } catch {
      /* اگر پروفایل نیامد، همان کاربر پاسخ login کافی است */
    }
    setUserState(profile)
    setStatus('authenticated')
    return profile
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUserState(null)
      setStatus('guest')
    }
  }, [])

  const refreshUser = useCallback(async () => {
    if (!getToken()) return
    const profile = await fetchProfile()
    setUserState(profile)
    setStatus('authenticated')
  }, [])

  const setUser = useCallback((next: User) => setUserState(next), [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated' && Boolean(user),
      login,
      logout,
      refreshUser,
      setUser,
    }),
    [user, status, login, logout, refreshUser, setUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth باید داخل AuthProvider استفاده شود.')
  return context
}

/** آیا کاربر جاری صاحب این منبع است؟ */
export function useIsMe(userId: number | null | undefined): boolean {
  const { user } = useAuth()
  return Boolean(user && userId && user.id === userId)
}
