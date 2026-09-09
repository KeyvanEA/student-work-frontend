import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useAuth } from '@/auth/AuthContext'
import { Avatar } from '@/components/ui/Avatar'
import { IconBell, IconBriefcase, IconPlus, IconSettings } from '@/components/ui/Icons'
import { Logo } from './Logo'
import { isNavActive, primaryNav } from './navItems'

const SECONDARY = [
  { to: '/my-work', label: 'کارهای من', Icon: IconBriefcase },
  { to: '/notifications', label: 'اعلان‌ها', Icon: IconBell },
  { to: '/settings', label: 'تنظیمات', Icon: IconSettings },
]

export function SideNav() {
  const { pathname } = useLocation()
  const { user, isAuthenticated } = useAuth()

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

      <nav className="mt-6 flex-1 space-y-1" aria-label="ناوبری کناری">
        {primaryNav.map((item) => {
          const active = isNavActive(item, pathname)
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-colors',
                active ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100',
              )}
            >
              <item.Icon className="size-[19px]" />
              {item.label}
            </Link>
          )
        })}

        <div className="!mt-5 border-t border-ink-100 pt-3">
          {SECONDARY.map((item) => {
            const active = pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-colors',
                  active ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-100',
                )}
              >
                <item.Icon className="size-[19px]" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {isAuthenticated && user ? (
        <Link
          to="/profile"
          className="mt-3 flex items-center gap-3 rounded-xl border border-ink-200 p-2.5 transition-colors hover:bg-ink-50"
        >
          <Avatar name={user.full_name} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-bold text-ink-800">{user.full_name}</span>
            <span className="block truncate text-[11px] text-ink-400">{user.university_name || 'دانشجو'}</span>
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
