import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconLogout, IconMenu, IconShield } from '@/components/ui/Icons'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'
import { adminNav, isAdminNavActive } from './adminNavItems'

function AdminNavList({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation()

  return (
    <nav className="space-y-1" aria-label="ناوبری پنل ادمین">
      {adminNav.map((item) => {
        const active = isAdminNavActive(item, pathname)

        // آیتم‌هایی که هنوز API ندارند: نمایش داده می‌شوند ولی هیچ مسیر یا درخواستی ندارند
        if (!item.to) {
          return (
            <span
              key={item.key}
              aria-disabled="true"
              title="این بخش هنوز فعال نشده است"
              className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold text-ink-500"
            >
              <item.Icon className="size-[19px] shrink-0 opacity-60" />
              <span className="min-w-0 flex-1 truncate opacity-70">{item.label}</span>
              <span className="shrink-0 rounded-md bg-ink-800 px-1.5 py-0.5 text-[9.5px] font-bold text-ink-400">
                به‌زودی
              </span>
            </span>
          )
        }

        return (
          <Link
            key={item.key}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-colors',
              active ? 'bg-brand-600 text-white' : 'text-ink-200 hover:bg-ink-800 hover:text-white',
            )}
          >
            <item.Icon className="size-[19px] shrink-0" />
            <span className="min-w-0 truncate">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

/** چیدمان پنل ادمین — ظاهر و ناوبری جدا از داشبورد کاربر */
export function AdminLayout() {
  const navigate = useNavigate()
  const toast = useToast()
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => setDrawerOpen(false), [pathname])

  useEffect(() => {
    if (!drawerOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [drawerOpen])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      toast.success('از حساب خود خارج شدید.')
      navigate('/login', { replace: true })
    } finally {
      setLoggingOut(false)
      setLogoutOpen(false)
    }
  }

  return (
    <div className="flex min-h-dvh bg-ink-100">
      {/* Sidebar دسکتاپ */}
      <aside className="sticky top-0 hidden h-dvh w-[268px] shrink-0 flex-col bg-ink-900 px-4 py-5 lg:flex">
        <Link to="/admin" className="flex items-center gap-2.5 px-1">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <IconShield className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-[14.5px] font-extrabold text-white">پنل ادمین</span>
            <span className="block text-[10.5px] text-ink-400">استودنت‌ورک</span>
          </span>
        </Link>

        <div className="scrollbar-none mt-7 flex-1 overflow-y-auto">
          <AdminNavList />
        </div>

        <div className="space-y-2 border-t border-ink-800 pt-3">
          {user ? (
            <p className="truncate px-1 text-[11.5px] text-ink-400">
              وارد شده به‌عنوان <span className="font-semibold text-ink-300">{user.full_name}</span>
            </p>
          ) : null}
          <Link
            to="/"
            className="flex h-10 items-center justify-center rounded-xl border border-ink-700 text-[12.5px] font-semibold text-ink-300 hover:bg-ink-800"
          >
            بازگشت به سایت
          </Link>
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-ink-800 text-[12.5px] font-semibold text-ink-200 hover:bg-ink-700"
          >
            <IconLogout className="size-4" />
            خروج از حساب
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* نوار بالای موبایل */}
        <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/95 backdrop-blur lg:hidden">
          <div className="flex h-14 items-center justify-between gap-2 px-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex size-10 items-center justify-center rounded-xl text-ink-600 hover:bg-ink-100"
              aria-label="باز کردن منوی ادمین"
            >
              <IconMenu className="size-5" />
            </button>

            <span className="flex items-center gap-2 text-[14px] font-extrabold text-ink-900">
              <IconShield className="size-[18px] text-brand-600" />
              پنل ادمین
            </span>

            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="flex size-10 items-center justify-center rounded-xl text-ink-600 hover:bg-ink-100"
              aria-label="خروج از حساب"
            >
              <IconLogout className="size-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-3 py-4 sm:px-5 lg:px-8 lg:py-7">
          <div className="mx-auto w-full max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* کشوی ناوبری موبایل */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="منوی پنل ادمین"
            className="animate-fade-up absolute inset-y-0 end-0 flex w-[84%] max-w-xs flex-col bg-ink-900 p-4"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="text-[14.5px] font-extrabold text-white">پنل ادمین</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="بستن منو"
                className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-800 hover:text-white"
              >
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="scrollbar-none flex-1 overflow-y-auto">
              <AdminNavList onNavigate={() => setDrawerOpen(false)} />
            </div>

            <div className="safe-bottom mt-3 space-y-2">
              <Link
                to="/"
                className="flex h-11 items-center justify-center rounded-xl border border-ink-700 text-[13px] font-semibold text-ink-300"
              >
                بازگشت به سایت
              </Link>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false)
                  setLogoutOpen(true)
                }}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink-800 text-[13px] font-semibold text-ink-200"
              >
                <IconLogout className="size-4" />
                خروج از حساب
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={logoutOpen}
        title="خروج از حساب"
        description="برای ورود دوباره به پنل باید مجدداً وارد شوید."
        confirmLabel="خروج"
        tone="danger"
        loading={loggingOut}
        onConfirm={() => void handleLogout()}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  )
}
