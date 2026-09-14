import { Link } from 'react-router-dom'
import { useAdminAccess } from '@/admin/AdminAccessContext'
import { useAuth } from '@/auth/AuthContext'
import { Avatar } from '@/components/ui/Avatar'
import { IconPlus, IconShield } from '@/components/ui/Icons'
import { DashboardNav } from './DashboardNav'
import { Logo } from './Logo'

/** Sidebar داشبورد — فقط در دسکتاپ؛ در موبایل همین ناوبری داخل کشو نمایش داده می‌شود. */
export function SideNav() {
  const { user, isAuthenticated } = useAuth()
  // فقط وقتی نقش ادمین قبلاً مشخص شده باشد؛ هیچ بررسی اضافه‌ای اینجا انجام نمی‌شود.
  const { isAdmin } = useAdminAccess()

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e border-ink-200 bg-white px-4 py-5 lg:flex">
      <div className="px-1">
        <Logo />
      </div>

      <Link
        to="/tasks/new"
        className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        <IconPlus className="size-[18px]" />
        ثبت تسک جدید
      </Link>

      <div className="scrollbar-none mt-6 flex-1 overflow-y-auto">
        <DashboardNav />
      </div>

      {isAdmin ? (
        <Link
          to="/admin"
          className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl bg-ink-900 text-[13px] font-semibold text-white transition-colors hover:bg-ink-800"
        >
          <IconShield className="size-[18px]" />
          پنل ادمین
        </Link>
      ) : null}

      {isAuthenticated && user ? (
        <Link
          to="/profile"
          className="mt-3 flex items-center gap-3 rounded-xl border border-ink-200 p-2.5 transition-colors hover:bg-ink-50"
        >
          <Avatar name={user.full_name} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-bold text-ink-800">{user.full_name}</span>
            <span className="block truncate text-[11px] text-ink-400">
              {user.university_name || 'دانشجو'}
            </span>
          </span>
        </Link>
      ) : (
        <Link
          to="/login"
          className="mt-3 flex h-11 items-center justify-center rounded-xl border border-brand-200 text-sm font-semibold text-brand-700 hover:bg-brand-50"
        >
          ورود به حساب
        </Link>
      )}
    </aside>
  )
}
