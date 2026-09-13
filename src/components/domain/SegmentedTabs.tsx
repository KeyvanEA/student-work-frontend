import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

export interface TabItem {
  to: string
  label: string
  active: boolean
}

/** نوار تب لینکی — برای تفکیک نقش/وضعیت در فهرست‌ها */
export function SegmentedTabs({ items, ariaLabel }: { items: TabItem[]; ariaLabel: string }) {
  return (
    <div
      className="scrollbar-none flex gap-1 overflow-x-auto rounded-xl bg-ink-200/60 p-1"
      role="tablist"
      aria-label={ariaLabel}
    >
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          role="tab"
          aria-selected={item.active}
          className={cn(
            'flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-center text-[13px] font-bold transition-colors',
            item.active ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500 hover:text-ink-700',
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}
