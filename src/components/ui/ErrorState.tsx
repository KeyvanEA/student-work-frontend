import { ApiError } from '@/api/client'
import { Button } from './Button'
import { cn } from '@/lib/cn'

/** عنوان مناسب برای هر کد وضعیت (بند ۹ نیازمندی‌ها) */
function titleForStatus(status: number): string {
  switch (status) {
    case 0:
      return 'ارتباط با سرور برقرار نشد'
    case 401:
      return 'نیاز به ورود مجدد'
    case 403:
      return 'دسترسی ندارید'
    case 404:
      return 'پیدا نشد'
    case 409:
      return 'تداخل در وضعیت'
    case 422:
      return 'اطلاعات معتبر نیست'
    case 500:
      return 'خطای سرور'
    default:
      return 'خطایی رخ داد'
  }
}

export function ErrorState({
  error,
  onRetry,
  className,
  compact = false,
}: {
  error: ApiError
  onRetry?: () => void
  className?: string
  compact?: boolean
}) {
  const status = error.status
  const isServerFault = status === 0 || status >= 500

  return (
    <div
      role="alert"
      className={cn(
        'rounded-2xl border border-rose-200 bg-rose-50 text-rose-800',
        compact ? 'px-4 py-3' : 'px-6 py-8 text-center',
        className,
      )}
    >
      <div className={cn('flex gap-3', compact ? 'items-start' : 'flex-col items-center')}>
        <svg
          className={cn('shrink-0 text-rose-500', compact ? 'mt-0.5 size-5' : 'size-9')}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5" strokeLinecap="round" />
          <path d="M12 16.2h.01" strokeLinecap="round" />
        </svg>
        <div className={cn('min-w-0', compact ? 'text-start' : '')}>
          <p className="text-[14px] font-bold">
            {titleForStatus(status)}
            {status > 0 ? <span className="ms-2 text-[11px] font-medium opacity-70">HTTP {status}</span> : null}
          </p>
          <p className="mt-1 text-[13px] leading-6">{error.message}</p>
          {error.errors ? (
            <ul className="mt-2 space-y-0.5 text-[12px]">
              {Object.entries(error.errors).map(([field, messages]) => (
                <li key={field}>• {messages[0]}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {onRetry && isServerFault ? (
        <div className={cn(compact ? 'mt-3' : 'mt-4')}>
          <Button size="sm" variant="outline" onClick={onRetry}>
            تلاش دوباره
          </Button>
        </div>
      ) : null}
    </div>
  )
}
