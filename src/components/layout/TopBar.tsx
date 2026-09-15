import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { useDashboardStats } from '@/dashboard/DashboardStatsContext'
import { Avatar } from '@/components/ui/Avatar'
import { IconBack, IconBell, IconMenu, IconPlus } from '@/components/ui/Icons'
import { toPersianDigits } from '@/lib/format'
import { DashboardNav } from './DashboardNav'
import { Logo } from './Logo'

/** مسیرهایی که «ریشه» محسوب می‌شوند و به‌جای دکمهٔ بازگشت، لوگو نشان می‌دهند */
const ROOT_PATHS = ['/dashboard', '/my-tasks', '/notifications', '/profile', '/satisfaction']

/** نوار بالای موبایل: کشوی ناوبری، دکمهٔ بازگشت، اعلان‌ها و پروفایل */
export function TopBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, isAuthenticated } = useAuth()
  const { stats } = useDashboardStats()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => setDrawerOpen(false), [pathname])

  useEffect(() => {
    if (!drawerOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [drawerOpen])

  const isRoot = ROOT_PATHS.includes(pathname)
  const unread = stats?.unreadNotifications ?? 0

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between gap-2 px-3">
          <div className="flex min-w-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="-ms-1 flex size-10 items-center justify-center rounded-xl text-ink-600 hover:bg-ink-100"
              aria-label="باز کردن منوی داشبورد"
            >
              <IconMenu className="size-5" />
            </button>

            {isRoot ? (
              <Logo compact />
            ) : (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex size-10 items-center justify-center rounded-xl text-ink-600 hover:bg-ink-100"
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
              aria-label={unread > 0 ? `اعلان‌ها، ${unread} خوانده‌نشده` : 'اعلان‌ها'}
              className="relative flex size-10 items-center justify-center rounded-xl text-ink-600 hover:bg-ink-100"
            >
              <IconBell className="size-5" />
              {unread > 0 ? (
                <span className="absolute -end-0.5 top-1 min-w-4 rounded-full bg-rose-500 px-1 text-[9.5px] font-bold leading-4 text-white">
                  {toPersianDigits(unread > 99 ? '99+' : unread)}
                </span>
              ) : null}
            </Link>
            {isAuthenticated && user ? (
              <Link to="/profile" aria-label="پروفایل من" className="ms-0.5">
                <Avatar name={user.full_name} src={user.avatar} size="sm" />
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

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/45 backdrop-blur-[2px]"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="منوی داشبورد"
            className="animate-fade-up absolute inset-y-0 end-0 flex w-[82%] max-w-xs flex-col bg-white shadow-[var(--shadow-lift)]"
          >
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
              <Logo />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="بستن منو"
                className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
              >
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="scrollbar-none flex-1 overflow-y-auto p-3">
              <DashboardNav onNavigate={() => setDrawerOpen(false)} />
            </div>

            <div className="safe-bottom border-t border-ink-100 p-3">
              <Link
                to="/"
                onClick={() => setDrawerOpen(false)}
                className="flex h-11 items-center justify-center rounded-xl border border-ink-200 text-[13px] font-semibold text-ink-600"
              >
                بازگشت به سایت
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
