import type { ComponentType, SVGProps } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { formatNumber } from '@/lib/format'
import type { Tone } from '@/lib/labels'

const TONES: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-600',
  info: 'bg-sky-50 text-sky-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-50 text-rose-700',
  brand: 'bg-brand-50 text-brand-700',
}

/** کارت شمارنده — عدد همیشه از API می‌آید، نه از حالت محلی */
export function StatCard({
  label,
  value,
  hint,
  to,
  tone = 'neutral',
  Icon,
}: {
  label: string
  value: number
  hint?: string
  to?: string
  tone?: Tone
  Icon?: ComponentType<SVGProps<SVGSVGElement>>
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12.5px] font-semibold leading-6 text-ink-500">{label}</p>
        {Icon ? (
          <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', TONES[tone])}>
            <Icon className="size-[18px]" />
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-extrabold text-ink-900">{formatNumber(value)}</p>
      {hint ? <p className="mt-1 text-[11.5px] leading-5 text-ink-400">{hint}</p> : null}
    </>
  )

  const className = cn(
    'block rounded-2xl border border-ink-200/80 bg-white p-4 shadow-[var(--shadow-soft)] transition-all',
    to && 'hover:border-brand-200 hover:shadow-[var(--shadow-lift)]',
  )

  return to ? (
    <Link to={to} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}
