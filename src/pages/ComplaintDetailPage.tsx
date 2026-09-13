import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { ApiError } from '@/api/client'
import { fetchComplaint } from '@/api/complaints'
import { DetailList, DetailRow } from '@/components/domain/DetailList'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { LinkButton } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { IconClock, IconFile, IconPackage } from '@/components/ui/Icons'
import { SkeletonDetail } from '@/components/ui/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatBytes, formatDateTime, toPersianDigits } from '@/lib/format'
import { complaintStatusMeta, metaOf } from '@/lib/labels'

/** جزئیات یک شکایت — GET /api/complaints/{id} (فقط برای ثبت‌کنندهٔ شکایت) */
export default function ComplaintDetailPage() {
  const { complaintId = '' } = useParams()

  const loader = useCallback(
    (signal: AbortSignal) => fetchComplaint(complaintId, signal),
    [complaintId],
  )
  const complaint = useApiResource(loader, [complaintId])

  useDocumentTitle(complaint.data?.title ?? 'جزئیات شکایت')

  if (complaint.loading) {
    return (
      <div>
        <PageHeader title="جزئیات شکایت" backTo="/complaints/mine" backLabel="شکایات من" />
        <SkeletonDetail />
      </div>
    )
  }

  if (complaint.error || !complaint.data) {
    const error = complaint.error ?? new ApiError(404, 'شکایت موردنظر پیدا نشد.')
    return (
      <div className="space-y-4">
        <PageHeader title="جزئیات شکایت" backTo="/complaints/mine" backLabel="شکایات من" />
        <ErrorState error={error} onRetry={complaint.reload} />
        {error.status === 403 ? (
          <Alert tone="warning" title="چرا این خطا را می‌بینید؟">
            بک‌اند مشاهدهٔ جزئیات یک شکایت را فقط به <b>ثبت‌کنندهٔ آن</b> می‌دهد. شکایت‌هایی که طرف
            مقابل روی پروژه‌های شما ثبت کرده، در فهرست «مربوط به پروژه‌های من» فقط به‌صورت خلاصه
            قابل مشاهده‌اند.
          </Alert>
        ) : null}
      </div>
    )
  }

  const data = complaint.data
  const meta = metaOf(complaintStatusMeta, data.status)
  const files = data.files ?? []

  return (
    <div className="space-y-4">
      <PageHeader
        title={data.title}
        description={`شناسه شکایت: ${toPersianDigits(data.id)}`}
        backTo="/complaints/mine"
        backLabel="شکایات من"
      />

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge meta={meta} />
            {meta.hint ? <span className="text-[12.5px] text-ink-500">{meta.hint}</span> : null}
          </div>

          <div className="border-t border-ink-100 pt-4">
            <h2 className="mb-1.5 text-[14px] font-bold text-ink-900">شرح شکایت</h2>
            <p className="whitespace-pre-line text-[13.5px] leading-8 text-ink-600">
              {data.description}
            </p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <DetailList>
            <DetailRow
              label="پروژه مرتبط"
              icon={<IconPackage className="size-4" />}
              value={
                <LinkButton to={`/projects/${data.project_id}`} size="sm" variant="ghost">
                  پروژه {toPersianDigits(data.project_id)}
                </LinkButton>
              }
            />
            <DetailRow
              label="زمان ثبت"
              icon={<IconClock className="size-4" />}
              value={formatDateTime(data.created_at)}
            />
            <DetailRow label="آخرین به‌روزرسانی" value={formatDateTime(data.updated_at)} />
          </DetailList>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="پاسخ ادمین" />
        <CardBody>
          {data.admin_response ? (
            <p className="whitespace-pre-line text-[13.5px] leading-8 text-ink-700">
              {data.admin_response}
            </p>
          ) : (
            <p className="text-[13px] text-ink-400">
              هنوز پاسخی از سوی ادمین ثبت نشده است. نتیجهٔ بررسی از طریق اعلان به شما اطلاع داده
              می‌شود.
            </p>
          )}
        </CardBody>
      </Card>

      {files.length > 0 ? (
        <Card>
          <CardHeader title="مدارک پیوست" description="فایل‌هایی که همراه شکایت ارسال کرده‌اید" />
          <CardBody>
            <ul className="space-y-2">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200 p-3"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <IconFile className="size-5 shrink-0 text-ink-400" />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-ink-700">
                        {file.original_name}
                      </span>
                      <span className="block text-[11.5px] text-ink-400">
                        {formatBytes(file.size)} · {file.mime_type}
                      </span>
                    </span>
                  </span>
                  {file.download_url ? (
                    <a
                      href={file.download_url}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-[12.5px] font-semibold text-brand-600 hover:underline"
                    >
                      باز کردن
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
