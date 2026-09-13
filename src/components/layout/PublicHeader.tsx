import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { Avatar } from '@/components/ui/Avatar'
import { IconTasks, IconHome, IconUser } from '@/components/ui/Icons'
import { cn } from '@/lib/cn'
import { Logo } from './Logo'

const PUBLIC_LINKS = [
  { to: '/', label: 'خانه', Icon: IconHome, exact: true },
  { to: '/tasks', label: 'مشاهده تسک‌ها', Icon: IconTasks, exact: false },
]

function isActive(pathname: string, to: string, exact: boolean) {
  return exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)
}

/** هدر سایت عمومی — Mobile-first، با منوی کشویی در موبایل */
export function PublicHeader() {
  const { pathname } = useLocation()
  const { user, isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)

  // با هر ناوبری منوی موبایل بسته شود
  useEffect(() => setOpen(false), [pathname])

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="ناوبری سایت">
          {PUBLIC_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              aria-current={isActive(pathname, link.to, link.exact) ? 'page' : undefined}
              className={cn(
                'rounded-xl px-3.5 py-2 text-[13.5px] font-semibold transition-colors',
                isActive(pathname, link.to, link.exact)
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-600 hover:bg-ink-100',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated && user ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-xl bg-brand-600 px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-brand-700"
              >
                ورود به داشبورد
              </Link>
              <Link
                to="/profile"
                aria-label="پروفایل من"
                className="flex items-center gap-2 rounded-xl border border-ink-200 px-2.5 py-1.5 transition-colors hover:bg-ink-50"
              >
                <Avatar name={user.full_name} size="sm" />
                <span className="max-w-28 truncate text-[12.5px] font-semibold text-ink-700">
                  {user.full_name}
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold text-ink-600 transition-colors hover:bg-ink-100"
              >
                ورود
              </Link>
              <Link
                to="/tasks/new"
                className="rounded-xl bg-brand-600 px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-brand-700"
              >
                ثبت تسک
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? 'بستن منو' : 'باز کردن منو'}
          className="flex size-10 items-center justify-center rounded-xl text-ink-600 hover:bg-ink-100 md:hidden"
        >
          <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
            {open ? (
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div className="border-t border-ink-100 bg-white md:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3" aria-label="ناوبری موبایل">
            {PUBLIC_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-colors',
                  isActive(pathname, link.to, link.exact)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-600 hover:bg-ink-100',
                )}
              >
                <link.Icon className="size-[18px]" />
                {link.label}
              </Link>
            ))}

            <div className="mt-2 flex flex-col gap-2 border-t border-ink-100 pt-3">
              {isAuthenticated && user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex h-11 items-center justify-center rounded-xl bg-brand-600 text-[13.5px] font-semibold text-white"
                  >
                    ورود به داشبورد
                  </Link>
                  <Link
                    to="/profile"
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-ink-200 text-[13.5px] font-semibold text-ink-700"
                  >
                    <IconUser className="size-[18px]" />
                    پروفایل من
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex h-11 items-center justify-center rounded-xl border border-brand-200 text-[13.5px] font-semibold text-brand-700"
                  >
                    ورود
                  </Link>
                  <Link
                    to="/tasks/new"
                    className="flex h-11 items-center justify-center rounded-xl bg-brand-600 text-[13.5px] font-semibold text-white"
                  >
                    ثبت تسک
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
