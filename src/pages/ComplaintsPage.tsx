import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyComplaints, fetchRelatedComplaints } from '@/api/complaints'
import { SegmentedTabs } from '@/components/domain/SegmentedTabs'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { IconBack, IconWarning } from '@/components/ui/Icons'
import { Pagination } from '@/components/ui/Pagination'
import { SkeletonList } from '@/components/ui/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDate, toPersianDigits } from '@/lib/format'
import { complaintStatusMeta, metaOf } from '@/lib/labels'

export type ComplaintScope = 'mine' | 'related'

type Scope = ComplaintScope

const SCOPES: Scope[] = ['mine', 'related']

const TITLE: Record<Scope, string> = {
  mine: 'شکایات من',
  related: 'شکایات مربوط به پروژه‌های من',
}

const DESCRIPTION: Record<Scope, string> = {
  mine: 'شکایت‌هایی که خودتان ثبت کرده‌اید',
  related: 'شکایت‌هایی که طرف مقابل روی پروژه‌های شما ثبت کرده است',
}

/**
 * فهرست شکایات — GET /api/complaints و GET /api/complaints/related
 * دامنه به‌صورت prop می‌آید تا مسیرهای ثابت با /complaints/:complaintId تداخل نکنند.
 */
export default function ComplaintsPage({ scope: validScope }: { scope: ComplaintScope }) {
  /**
   * شمارهٔ صفحه به دامنهٔ جاری گره خورده است؛ این کامپوننت بین /complaints/mine و
   * /complaints/related دوباره mount نمی‌شود و بدون این گره شمارهٔ صفحه از تب قبلی می‌ماند.
   */
  const [pageState, setPageState] = useState<{ scope: ComplaintScope; page: number }>({
    scope: validScope,
    page: 1,
  })
  const page = pageState.scope === validScope ? pageState.page : 1

  const loader = useCallback(
    (signal: AbortSignal) =>
      validScope === 'related'
        ? fetchRelatedComplaints(page, signal)
        : fetchMyComplaints(page, signal),
    [validScope, page],
  )
  const complaints = useApiResource(loader, [validScope, page])

  useDocumentTitle(TITLE[validScope])

  const items = complaints.data?.data ?? []

  return (
    <div className="space-y-4">
      <PageHeader title={TITLE[validScope]} description={DESCRIPTION[validScope]} />

      <SegmentedTabs
        ariaLabel="نوع شکایت"
        items={SCOPES.map((item) => ({
          to: `/complaints/${item}`,
          label: item === 'mine' ? 'شکایات من' : 'مربوط به پروژه‌های من',
          active: item === validScope,
        }))}
      />

      <Alert tone="info">
        ثبت شکایت جدید از داخل صفحهٔ همان پروژه انجام می‌شود؛ بک‌اند فقط در وضعیت‌های مشخصی اجازهٔ
        ثبت شکایت می‌دهد (کارجو وقتی پروژه «نیازمند اصلاح» است و کارفرما وقتی پروژه «تحویل شده» است).
      </Alert>

      {validScope === 'related' ? (
        <Alert tone="warning">
          مشاهدهٔ متن کامل این شکایت‌ها در بک‌اند فعلی فقط برای ثبت‌کنندهٔ شکایت مجاز است؛ بنابراین
          اینجا تنها خلاصهٔ هر شکایت نمایش داده می‌شود.
        </Alert>
      ) : null}

      {complaints.loading ? (
        <SkeletonList count={3} />
      ) : complaints.error ? (
        <ErrorState error={complaints.error} onRetry={complaints.reload} />
      ) : items.length === 0 ? (
        <EmptyState
          title={validScope === 'mine' ? 'شکایتی ثبت نکرده‌اید' : 'شکایتی روی پروژه‌های شما نیست'}
          description={
            validScope === 'mine'
              ? 'اگر پروژه‌ای طبق توافق پیش نرفت، از صفحهٔ همان پروژه شکایت ثبت کنید.'
              : 'اگر طرف مقابل روی یکی از پروژه‌های شما شکایت ثبت کند، اینجا نمایش داده می‌شود.'
          }
          icon={<IconWarning className="size-6" />}
        />
      ) : (
        <>
          <p className="text-[12.5px] text-ink-500">
            {toPersianDigits(complaints.data?.total ?? items.length)} شکایت
          </p>

          <ul className={complaints.refreshing ? 'space-y-3 opacity-60' : 'space-y-3'}>
            {items.map((complaint) => (
              <li
                key={complaint.id}
                className="rounded-2xl border border-ink-200/80 bg-white p-4 shadow-[var(--shadow-soft)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="min-w-0 flex-1 truncate text-[14.5px] font-bold text-ink-900">
                    {complaint.title}
                  </h3>
                  <StatusBadge meta={metaOf(complaintStatusMeta, complaint.status)} />
                </div>

                <p className="mt-1.5 text-[11.5px] text-ink-400">
                  شناسه {toPersianDigits(complaint.id)} · ثبت {formatDate(complaint.created_at)}
                </p>

                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 pt-3">
                  <Link
                    to={`/projects/${complaint.project_id}`}
                    className="text-[12.5px] font-semibold text-ink-500 hover:text-brand-600"
                  >
                    پروژه {toPersianDigits(complaint.project_id)}
                  </Link>

                  {validScope === 'mine' ? (
                    <Link
                      to={`/complaints/${complaint.id}`}
                      className="inline-flex items-center gap-1 text-[12.5px] font-bold text-brand-600 hover:text-brand-700"
                    >
                      مشاهده جزئیات
                      <IconBack className="size-4" />
                    </Link>
                  ) : (
                    <span className="text-[12px] text-ink-400">جزئیات فقط برای ثبت‌کننده</span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {complaints.data ? (
            <Pagination
              currentPage={complaints.data.current_page}
              lastPage={complaints.data.last_page}
              total={complaints.data.total}
              disabled={complaints.refreshing}
              onChange={(next) => {
                setPageState({ scope: validScope, page: next })
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
