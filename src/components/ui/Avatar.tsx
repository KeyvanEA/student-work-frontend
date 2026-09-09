import { cn } from '@/lib/cn'
import { initialsOf } from '@/lib/format'

/**
 * آواتار متنی.
 * ⚠️ بک‌اند فقط مسیر ذخیره‌سازی خصوصی آواتار را برمی‌گرداند (disk=local) و
 * URL عمومی قابل نمایشی نمی‌دهد، بنابراین همیشه حروف اول نام نمایش داده می‌شود.
 * TODO(backend): در صورت افزودن avatar_url عمومی، اینجا <img> بگذارید.
 */
export function Avatar({
  name,
  size = 'md',
  className,
}: {
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizes = {
    sm: 'size-8 text-[11px]',
    md: 'size-10 text-[13px]',
    lg: 'size-16 text-lg',
  }
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700',
        sizes[size],
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  )
}
