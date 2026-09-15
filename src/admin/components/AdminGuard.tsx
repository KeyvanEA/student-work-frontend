import type { ReactNode } from 'react'
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
 *
 * تعیین نقش در AdminAccessProvider و به‌محض شناخته‌شدن کاربر انجام می‌شود؛ اینجا فقط
 * نتیجهٔ آن خوانده می‌شود تا هیچ صفحه‌ای پیش از قطعی‌شدن نقش رندر نشود.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { status: authStatus } = useAuth()
  const { status, resolved } = useAdminAccess()

  // مهمان: وضعیت قطعی است، مستقیم به صفحهٔ ورود (با نگه‌داشتن مسیر مقصد)
  if (authStatus === 'guest') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  // نشست یا نقش هنوز قطعی نشده — هیچ UI ای که به نقش وابسته است نباید رندر شود
  if (authStatus === 'loading' || !resolved) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 text-ink-400">
        <Spinner size={28} className="text-brand-500" />
        <p className="text-[13px] font-medium">در حال بررسی دسترسی…</p>
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

  // کاربر عادی: به داشبورد خودش هدایت می‌شود، نه یک صفحهٔ بن‌بست
  if (status !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
