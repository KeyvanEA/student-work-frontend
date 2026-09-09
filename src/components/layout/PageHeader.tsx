import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IconBack } from '@/components/ui/Icons'
import { cn } from '@/lib/cn'

export function PageHeader({
  title,
  description,
  action,
  backTo,
  backLabel,
  className,
}: {
  title: string
  description?: ReactNode
  action?: ReactNode
  backTo?: string
  backLabel?: string
  className?: string
}) {
  return (
    <div className={cn('mb-5', className)}>
      {backTo ? (
        <Link
          to={backTo}
          className="mb-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-ink-500 hover:text-brand-600"
        >
          <IconBack className="size-4" />
          {backLabel ?? 'بازگشت'}
        </Link>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-ink-900 sm:text-[26px]">{title}</h1>
          {description ? (
            <p className="mt-1.5 text-[13.5px] leading-7 text-ink-500">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  )
}
