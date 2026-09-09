import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label?: ReactNode
  htmlFor?: string
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-ink-700">
          {label}
          {required ? <span className="ms-1 text-rose-600">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="flex items-start gap-1 text-[12px] font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-[12px] leading-5 text-ink-500">{hint}</p>
      ) : null}
    </div>
  )
}

export const controlClasses = (invalid?: boolean) =>
  cn(
    'w-full rounded-xl border bg-white px-3.5 text-sm text-ink-900 placeholder:text-ink-400',
    'transition-colors focus:outline-none focus:ring-4',
    invalid
      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
      : 'border-ink-200 focus:border-brand-500 focus:ring-brand-100',
    'disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400',
  )
