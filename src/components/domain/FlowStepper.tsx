import { cn } from '@/lib/cn'

export interface FlowStep {
  key: string
  label: string
}

/** نوار مراحل چرخهٔ کار — برای اینکه در ارائه معلوم باشد کجای Flow هستیم */
export function FlowStepper({
  steps,
  currentIndex,
  failedIndex,
}: {
  steps: FlowStep[]
  currentIndex: number
  failedIndex?: number
}) {
  return (
    <ol className="scrollbar-none flex items-center gap-1 overflow-x-auto pb-1" aria-label="مراحل پروژه">
      {steps.map((step, index) => {
        const done = index < currentIndex
        const active = index === currentIndex
        const failed = failedIndex === index

        return (
          <li key={step.key} className="flex shrink-0 items-center gap-1">
            <span
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11.5px] font-bold ring-1 ring-inset transition-colors',
                failed
                  ? 'bg-rose-50 text-rose-700 ring-rose-200'
                  : active
                    ? 'bg-brand-600 text-white ring-brand-600'
                    : done
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                      : 'bg-white text-ink-400 ring-ink-200',
              )}
            >
              <span
                className={cn(
                  'flex size-4 items-center justify-center rounded-full text-[9px]',
                  failed
                    ? 'bg-rose-600 text-white'
                    : active
                      ? 'bg-white/25 text-white'
                      : done
                        ? 'bg-emerald-600 text-white'
                        : 'bg-ink-200 text-ink-500',
                )}
                aria-hidden
              >
                {done && !failed ? '✓' : index + 1}
              </span>
              {step.label}
            </span>
            {index < steps.length - 1 ? (
              <span className={cn('h-px w-3', done ? 'bg-emerald-300' : 'bg-ink-200')} aria-hidden />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

export const PROJECT_FLOW_STEPS: FlowStep[] = [
  { key: 'in_progress', label: 'در حال انجام' },
  { key: 'submitted', label: 'تحویل شده' },
  { key: 'completed', label: 'تایید شده' },
  { key: 'paid', label: 'پرداخت شده' },
]

/** نگاشت وضعیت پروژه به شمارهٔ مرحله */
export function projectFlowIndex(status: string, paymentStatus: string): number {
  if (paymentStatus === 'paid') return 3
  if (status === 'completed') return 2
  if (status === 'submitted') return 1
  return 0
}
