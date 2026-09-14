import { StatusBadge } from '@/components/domain/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconFile, IconUpload } from '@/components/ui/Icons'
import { formatBytes, formatDateTime, toPersianDigits } from '@/lib/format'
import { deliveryStatusMeta, metaOf } from '@/lib/labels'
import type { AdminDelivery } from '../api/types'

/**
 * تاریخچهٔ تحویل‌های پروژه در پروندهٔ شکایت.
 *
 * ⚠️ بک‌اند در مسیرهای ادمین برای فایل‌های تحویل هیچ URL دانلود/پیش‌نمایشی نمی‌دهد
 * (فقط مدل خام فایل)، بنابراین اینجا فقط مشخصات فایل نمایش داده می‌شود و لینکی
 * ساخته نمی‌شود.
 */
export function AdminDeliveryList({ deliveries }: { deliveries: AdminDelivery[] }) {
  if (deliveries.length === 0) {
    return (
      <EmptyState
        title="تحویلی ثبت نشده"
        description="برای این پروژه هیچ تحویلی ارسال نشده است."
        icon={<IconUpload className="size-6" />}
      />
    )
  }

  return (
    <ul className="space-y-3">
      {deliveries.map((delivery) => (
        <li key={delivery.id} className="rounded-2xl border border-ink-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[14px] font-bold text-ink-900">
              تحویل {toPersianDigits(delivery.id)}
            </h3>
            <div className="flex items-center gap-2">
              {delivery.edit_count > 0 ? (
                <span className="text-[11.5px] text-ink-400">
                  {toPersianDigits(delivery.edit_count)} ویرایش
                </span>
              ) : null}
              <StatusBadge meta={metaOf(deliveryStatusMeta, delivery.status)} />
            </div>
          </div>

          <p className="mt-1 text-[11.5px] text-ink-400">{formatDateTime(delivery.submitted_at)}</p>

          <p className="mt-2.5 whitespace-pre-line text-[13px] leading-7 text-ink-600">
            {delivery.description}
          </p>

          {delivery.rejection_reason ? (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5">
              <p className="text-[12.5px] font-bold text-rose-800">دلیل رد شدن</p>
              <p className="mt-1 whitespace-pre-line text-[12.5px] leading-6 text-rose-700">
                {delivery.rejection_reason}
              </p>
            </div>
          ) : null}

          {delivery.files && delivery.files.length > 0 ? (
            <ul className="mt-3 space-y-1.5 border-t border-ink-100 pt-3">
              {delivery.files.map((file) => (
                <li key={file.id} className="flex items-center gap-2.5 text-[12.5px] text-ink-600">
                  <IconFile className="size-4 shrink-0 text-ink-400" />
                  <span className="min-w-0 flex-1 truncate">{file.original_name}</span>
                  <span className="shrink-0 text-[11.5px] text-ink-400">
                    {formatBytes(file.size)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
