import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../AdminAuthContext'

/**
 * محافظ مسیرهای ادمین.
 * تا وقتی بک‌اند permission ادمین ندارد، نشست محلی ادمین ملاک است؛ ساختار طوری است
 * که بعداً فقط بررسی داخل useAdminAuth به middleware واقعی وصل شود.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { isAdmin } = useAdminAuth()
  const location = useLocation()

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}
