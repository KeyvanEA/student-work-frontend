import { useCallback, useState } from 'react'
import { fetchApplications } from '@/api/applications'
import { ApplicationListCard } from '@/components/domain/ApplicationListCard'
import { SegmentedTabs } from '@/components/domain/SegmentedTabs'
import { PageHeader } from '@/components/layout/PageHeader'
import { LinkButton } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Pagination } from '@/components/ui/Pagination'
import { SkeletonList } from '@/components/ui/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { toPersianDigits } from '@/lib/format'
import type { ApplicationListType } from '@/types/models'

const TYPES: ApplicationListType[] = ['sent', 'received']

const TITLE: Record<ApplicationListType, string> = {
  sent: 'درخواست‌های ارسال‌شده',
  received: 'درخواست‌های دریافت‌شده',
}

const DESCRIPTION: Record<ApplicationListType, string> = {
  sent: 'درخواست‌های همکاری که برای تسک‌های دیگران فرستاده‌اید',
  received: 'درخواست‌های همکاری که برای تسک‌های شما ارسال شده است',
}

/**
 * فهرست درخواست‌های همکاری — GET /api/applications?type=sent|received
 * نوع فهرست به‌صورت prop می‌آید تا مسیرهای ثابت با /applications/:applicationId تداخل نکنند.
 */
export default function ApplicationsPage({ type: validType }: { type: ApplicationListType }) {
  const [page, setPage] = useState(1)

  const loader = useCallback(
    (signal: AbortSignal) => fetchApplications(validType, page, signal),
    [validType, page],
  )
  const applications = useApiResource(loader, [validType, page])

  useDocumentTitle(TITLE[validType])

  const items = applications.data?.data ?? []

  return (
    <div className="space-y-4">
      <PageHeader title={TITLE[validType]} description={DESCRIPTION[validType]} />

      <SegmentedTabs
        ariaLabel="نوع درخواست همکاری"
        items={TYPES.map((item) => ({
          to: `/applications/${item}`,
          label: item === 'sent' ? 'ارسال‌شده' : 'دریافت‌شده',
          active: item === validType,
        }))}
      />

      {applications.loading ? (
        <SkeletonList count={3} />
      ) : applications.error ? (
        <ErrorState error={applications.error} onRetry={applications.reload} />
      ) : items.length === 0 ? (
        <EmptyState
          title={validType === 'sent' ? 'درخواستی نفرستاده‌اید' : 'درخواستی دریافت نکرده‌اید'}
          description={
            validType === 'sent'
              ? 'از صفحهٔ تسک‌های باز، برای کاری که مناسب شماست درخواست همکاری بفرستید.'
              : 'وقتی کارجویی برای یکی از تسک‌های شما درخواست بفرستد، اینجا نمایش داده می‌شود.'
          }
          action={
            <LinkButton to={validType === 'sent' ? '/tasks' : '/my-tasks'} size="sm">
              {validType === 'sent' ? 'مرور تسک‌های باز' : 'تسک‌های من'}
            </LinkButton>
          }
        />
      ) : (
        <>
          <p className="text-[12.5px] text-ink-500">
            {toPersianDigits(applications.data?.total ?? items.length)} درخواست
          </p>

          <div className={applications.refreshing ? 'space-y-3 opacity-60' : 'space-y-3'}>
            {items.map((application) => (
              <ApplicationListCard
                key={application.id}
                application={application}
                type={validType}
              />
            ))}
          </div>

          {applications.data ? (
            <Pagination
              currentPage={applications.data.current_page}
              lastPage={applications.data.last_page}
              total={applications.data.total}
              disabled={applications.refreshing}
              onChange={(next) => {
                setPage(next)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
