import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchDelivery } from '@/api/deliveries'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { IconBack, IconClock, IconFile } from '@/components/ui/Icons'
import { Spinner } from '@/components/ui/Spinner'
import { useApiResource } from '@/hooks/useApiResource'
import { formatDateTime, toPersianDigits } from '@/lib/format'
import { deliveryStatusMeta, metaOf } from '@/lib/labels'
import { DeliveryFileRow } from './DeliveryFileRow'
import { StatusBadge } from './StatusBadge'
import type { DeliveryListItem } from '@/types/models'

/**
 * یک ردیف از فهرست GET /api/projects/{project}/deliveries.
 *
 * ⚠️ آن endpoint فایل‌ها را برنمی‌گرداند، بنابراین فایل‌ها فقط وقتی کاربر
 * «نمایش فایل‌ها» را بزند با GET /api/deliveries/{id} خوانده می‌شوند.
 */
export function DeliveryListRow({
  delivery,
  projectId,
  canDownload,
  downloadBlockedReason,
  canReview,
}: {
  delivery: DeliveryListItem
  projectId: number
  canDownload: boolean
  downloadBlockedReason?: string
  canReview: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  const loader = useCallback(
    (signal: AbortSignal) => fetchDelivery(delivery.id, signal),
    [delivery.id],
  )
  const detail = useApiResource(loader, [delivery.id], { enabled: expanded })

  const meta = metaOf(deliveryStatusMeta, delivery.status)

  return (
    <li className="rounded-2xl border border-ink-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[14px] font-bold text-ink-900">
              تحویل {toPersianDigits(delivery.id)}
            </h3>
            <StatusBadge meta={meta} />
          </div>
          <p className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] text-ink-400">
            <IconClock className="size-3.5" />
            {formatDateTime(delivery.submitted_at)}
            {delivery.edit_count > 0
              ? ` · ${toPersianDigits(delivery.edit_count)} ویرایش`
              : ''}
          </p>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-line text-[13px] leading-7 text-ink-600">
        {delivery.description}
      </p>

      {delivery.status === 'rejected' && delivery.rejection_reason ? (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5">
          <p className="text-[12.5px] font-bold text-rose-800">دلیل رد شدن</p>
          <p className="mt-1 whitespace-pre-line text-[12.5px] leading-6 text-rose-700">
            {delivery.rejection_reason}
          </p>
        </div>
      ) : null}

      <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
        <Button
          size="sm"
          variant="ghost"
          icon={<IconFile className="size-4" />}
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {expanded ? 'بستن فایل‌ها' : 'نمایش فایل‌ها'}
        </Button>

        <Link
          to={`/deliveries/${delivery.id}?project=${projectId}`}
          className="ms-auto inline-flex items-center gap-1 text-[12.5px] font-bold text-brand-600 hover:text-brand-700"
        >
          {canReview && delivery.status === 'pending' ? 'بررسی تحویل' : 'جزئیات تحویل'}
          <IconBack className="size-4" />
        </Link>
      </div>

      {expanded ? (
        <div className="mt-3">
          {detail.loading ? (
            <div className="flex items-center gap-2 py-4 text-ink-400">
              <Spinner size={16} />
              <span className="text-[12.5px]">در حال دریافت فایل‌ها…</span>
            </div>
          ) : detail.error ? (
            <ErrorState error={detail.error} compact onRetry={detail.reload} />
          ) : (detail.data?.files?.length ?? 0) === 0 ? (
            <p className="py-2 text-[12.5px] text-ink-400">فایلی برای این تحویل ثبت نشده است.</p>
          ) : (
            <ul className="space-y-2">
              {detail.data!.files.map((file) => (
                <DeliveryFileRow
                  key={file.id}
                  file={file}
                  deliveryId={delivery.id}
                  canDownload={canDownload}
                  downloadBlockedReason={downloadBlockedReason}
                />
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </li>
  )
}
