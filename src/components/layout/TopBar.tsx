import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { Avatar } from '@/components/ui/Avatar'
import { IconBack, IconBell, IconPlus } from '@/components/ui/Icons'
import { Logo } from './Logo'

/** نوار بالای موبایل: در صفحات داخلی دکمهٔ بازگشت، در صفحات اصلی لوگو */
export function TopBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, isAuthenticated } = useAuth()

  const isRoot = ['/', '/tasks', '/projects', '/messages', '/profile'].includes(pathname)

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/95 backdrop-blur lg:hidden">
      <div className="flex h-14 items-center justify-between gap-2 px-3">
        <div className="flex min-w-0 items-center gap-1.5">
          {isRoot ? (
            <Logo />
          ) : (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="-ms-1 flex size-10 items-center justify-center rounded-xl text-ink-600 hover:bg-ink-100"
              aria-label="بازگشت"
            >
              <IconBack className="size-5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Link
            to="/tasks/new"
            aria-label="ثبت تسک جدید"
            className="flex size-10 items-center justify-center rounded-xl text-ink-600 hover:bg-ink-100"
          >
            <IconPlus className="size-5" />
          </Link>
          <Link
            to="/notifications"
            aria-label="اعلان‌ها"
            className="relative flex size-10 items-center justify-center rounded-xl text-ink-600 hover:bg-ink-100"
          >
            <IconBell className="size-5" />
            <span className="absolute end-2.5 top-2.5 size-1.5 rounded-full bg-rose-500" aria-hidden />
          </Link>
          {isAuthenticated && user ? (
            <Link to="/profile" aria-label="پروفایل من" className="ms-0.5">
              <Avatar name={user.full_name} size="sm" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="ms-1 rounded-xl bg-brand-600 px-3 py-2 text-[12.5px] font-semibold text-white"
            >
              ورود
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
