import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string
  description?: ReactNode
  action?: ReactNode
  icon?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white/70 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
        {icon ?? (
          <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <h3 className="text-[15px] font-bold text-ink-800">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-[13px] leading-6 text-ink-500">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
