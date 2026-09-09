import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { Tone } from '@/lib/labels'

const TONES: Record<Tone, string> = {
  neutral: 'bg-ink-50 border-ink-200 text-ink-700',
  info: 'bg-sky-50 border-sky-200 text-sky-800',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  danger: 'bg-rose-50 border-rose-200 text-rose-800',
  brand: 'bg-brand-50 border-brand-200 text-brand-800',
}

export function Alert({
  tone = 'info',
  title,
  children,
  className,
  action,
}: {
  tone?: Tone
  title?: ReactNode
  children?: ReactNode
  className?: string
  action?: ReactNode
}) {
  return (
    <div className={cn('rounded-xl border px-4 py-3', TONES[tone], className)} role="status">
      {title ? <p className="text-[13px] font-bold">{title}</p> : null}
      {children ? <div className="mt-1 text-[13px] leading-6">{children}</div> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  )
}
