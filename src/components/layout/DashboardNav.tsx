import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { IconChevronDown } from '@/components/ui/Icons'
import { dashboardNav, isNavItemActive, isPathActive, type NavItem } from './navItems'

/**
 * بدنهٔ ناوبری داشبورد.
 * همین کامپوننت هم در Sidebar دسکتاپ و هم در کشوی موبایل رندر می‌شود تا
 * ناوبری دسکتاپ و موبایل همیشه هماهنگ بمانند.
 */
export function DashboardNav({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation()

  return (
    <nav className="space-y-1" aria-label="ناوبری داشبورد">
      {dashboardNav.map((item) =>
        item.children ? (
          <NavGroup key={item.key} item={item} pathname={pathname} onNavigate={onNavigate} />
        ) : (
          <Link
            key={item.key}
            to={item.to!}
            onClick={onNavigate}
            aria-current={isNavItemActive(item, pathname) ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-colors',
              isNavItemActive(item, pathname)
                ? 'bg-brand-50 text-brand-700'
                : 'text-ink-600 hover:bg-ink-100',
            )}
          >
            <item.Icon className="size-[19px] shrink-0" />
            <span className="min-w-0 truncate">{item.label}</span>
          </Link>
        ),
      )}
    </nav>
  )
}

function NavGroup({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem
  pathname: string
  onNavigate?: () => void
}) {
  const active = isNavItemActive(item, pathname)
  const [open, setOpen] = useState(active)

  // گروهی که مسیر جاری داخلش است همیشه باز می‌ماند
  useEffect(() => {
    if (active) setOpen(true)
  }, [active])

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-colors',
          active ? 'text-brand-700' : 'text-ink-600 hover:bg-ink-100',
        )}
      >
        <item.Icon className="size-[19px] shrink-0" />
        <span className="min-w-0 flex-1 truncate text-start">{item.label}</span>
        <IconChevronDown
          className={cn('size-4 shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <ul className="mt-0.5 space-y-0.5 border-e-2 border-ink-100 pe-3 ms-4">
          {item.children!.map((child) => {
            const childActive = isPathActive(pathname, child.to)
            return (
              <li key={child.to}>
                <Link
                  to={child.to}
                  onClick={onNavigate}
                  aria-current={childActive ? 'page' : undefined}
                  className={cn(
                    'block rounded-lg px-3 py-2 text-[12.5px] font-semibold transition-colors',
                    childActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-ink-500 hover:bg-ink-100 hover:text-ink-700',
                  )}
                >
                  {child.label}
                </Link>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
