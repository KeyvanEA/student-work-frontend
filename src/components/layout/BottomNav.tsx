import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { isNavActive, primaryNav } from './navItems'

export function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 backdrop-blur lg:hidden"
      aria-label="ناوبری اصلی"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1 pt-1">
        {primaryNav.map((item) => {
          const active = isNavActive(item, pathname)
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10.5px] font-semibold transition-colors',
                  active ? 'text-brand-600' : 'text-ink-400 hover:text-ink-600',
                )}
              >
                <item.Icon className={cn('size-[22px]', active && 'stroke-[2.1]')} />
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
