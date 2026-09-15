import { useEffect, useState } from 'react'
import { storedFileUrl } from '@/api/files'
import { cn } from '@/lib/cn'
import { initialsOf } from '@/lib/format'

/**
 * آواتار کاربر.
 *
 * بک‌اند در ستون `avatar` فقط مسیر ذخیره‌سازی را می‌دهد (مثل `users/avatars/x.jpg`)
 * و هیچ accessor ای برای `avatar_url` ندارد. همان قرارداد `Storage::url()` که خود
 * بک‌اند برای فایل‌های تسک و شکایت استفاده می‌کند اینجا هم اعمال می‌شود
 * (به `storedFileUrl` نگاه کنید).
 *
 * اگر تصویر به هر دلیلی بارگذاری نشد — نبودن فایل، تغییر disk، یا امضای لازم در
 * production — بی‌صدا به حروف اول نام برمی‌گردد، یعنی دقیقاً رفتار قبلی.
 */
export function Avatar({
  name,
  src,
  size = 'md',
  className,
}: {
  name?: string | null
  /** مقدار خام `avatar` از بک‌اند، یا یک URL کامل */
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const url = storedFileUrl(src)
  const [failed, setFailed] = useState(false)

  // با عوض شدن کاربر/تصویر، خطای قبلی نباید باقی بماند
  useEffect(() => setFailed(false), [url])

  const sizes = {
    sm: 'size-8 text-[11px]',
    md: 'size-10 text-[13px]',
    lg: 'size-16 text-lg',
  }

  const base = cn(
    'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-bold text-brand-700',
    sizes[size],
    className,
  )

  if (url && !failed) {
    return (
      <span className={base}>
        <img
          src={url}
          alt={name ? `تصویر پروفایل ${name}` : 'تصویر پروفایل'}
          loading="lazy"
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      </span>
    )
  }

  return (
    <span aria-hidden className={base}>
      {initialsOf(name)}
    </span>
  )
}
