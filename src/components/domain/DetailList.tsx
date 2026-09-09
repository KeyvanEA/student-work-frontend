import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function DetailList({ children, className }: { children: ReactNode; className?: string }) {
  return <dl className={cn('divide-y divide-ink-100', className)}>{children}</dl>
}

export function DetailRow({
  label,
  value,
  icon,
}: {
  label: string
  value: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="flex items-center gap-2 text-[13px] text-ink-500">
        {icon}
        {label}
      </dt>
      <dd className="text-end text-[13px] font-semibold text-ink-800">{value}</dd>
    </div>
  )
}
