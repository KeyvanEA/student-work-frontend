import { useEffect, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAccess } from '@/admin/AdminAccessContext'
import { useAuth } from '@/auth/AuthContext'
import { Alert } from '@/components/ui/Alert'
import { LinkButton } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

/**
 * محافظ مسیرهای /admin.
 *
 * ورود جداگانه‌ای برای ادمین وجود ندارد؛ کاربر مهمان به همان صفحهٔ ورود پروژه می‌رود.
 * این فقط کنترل UI است — دسترسی واقعی را middleware `admin` در بک‌اند تضمین می‌کند.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { status: authStatus } = useAuth()
  const { status, ensureChecked } = useAdminAccess()

  useEffect(() => {
    if (authStatus === 'authenticated') void ensureChecked()
  }, [authStatus, ensureChecked])

  if (authStatus === 'loading' || status === 'checking' || status === 'idle') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 text-ink-400">
        <Spinner size={28} className="text-brand-500" />
        <p className="text-[13px] font-medium">در حال بررسی دسترسی…</p>
      </div>
    )
  }

  if (authStatus === 'guest') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  if (status === 'denied') {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4">
        <Alert tone="danger" title="دسترسی به پنل ادمین ندارید">
          این بخش فقط برای حساب‌های با نقش <b>admin</b> در دسترس است.
        </Alert>
        <LinkButton to="/dashboard" variant="outline" size="md">
          بازگشت به داشبورد
        </LinkButton>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4">
        <Alert tone="warning" title="بررسی دسترسی ناموفق بود">
          ارتباط با سرور برقرار نشد. اتصال اینترنت یا اجرای بک‌اند را بررسی کنید.
        </Alert>
        <LinkButton to="/dashboard" variant="outline" size="md">
          بازگشت به داشبورد
        </LinkButton>
      </div>
    )
  }

  return <>{children}</>
}
