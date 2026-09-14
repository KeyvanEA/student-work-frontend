import { useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchAdminComplaints } from '@/admin/api/adminApi'
import { SegmentedTabs } from '@/components/domain/SegmentedTabs'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { IconWarning } from '@/components/ui/Icons'
import { Pagination } from '@/components/ui/Pagination'
import { SkeletonList } from '@/components/ui/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDate, formatToman, toPersianDigits } from '@/lib/format'
import { complaintStatusMeta, metaOf } from '@/lib/labels'
import { AdminTable, type AdminColumn } from '../components/AdminTable'
import type { AdminComplaintListItem } from '../api/types'
import type { ComplaintStatus } from '@/types/models'

type Filter = ComplaintStatus | 'all'

const FILTERS: Filter[] = ['all', 'pending', 'reviewing', 'resolved', 'rejected']

const FILTER_LABEL: Record<Filter, string> = {
  all: 'همه',
  pending: 'در انتظار بررسی',
  reviewing: 'در حال بررسی',
  resolved: 'حل‌شده',
  rejected: 'ردشده',
}

function isFilter(value: string | null): value is Filter {
  return value !== null && (FILTERS as string[]).includes(value)
}

/** فهرست شکایات — GET /api/admin/complaints[?status=…] */
export default function AdminComplaintsPage() {
  useDocumentTitle('مدیریت شکایات — ادمین')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const statusParam = searchParams.get('status')
  const status: Filter = isFilter(statusParam) ? statusParam : 'all'

  /**
   * شمارهٔ صفحه به فیلتر جاری گره خورده است تا با عوض شدن فیلتر خود‌به‌خود به صفحهٔ ۱
   * برگردد — بدون effect اضافه و بدون درخواست دوباره.
   */
  const [pageState, setPageState] = useState<{ status: Filter; page: number }>({
    status,
    page: 1,
  })
  const page = pageState.status === status ? pageState.page : 1

  const loader = useCallback(
    (signal: AbortSignal) => fetchAdminComplaints({ status, page }, signal),
    [status, page],
  )
  const complaints = useApiResource(loader, [status, page])

  const items = complaints.data?.data ?? []

  const columns: Array<AdminColumn<AdminComplaintListItem>> = [
    {
      key: 'id',
      header: 'شناسه',
      render: (row) => toPersianDigits(row.id),
      hideOnMobile: true,
    },
    {
      key: 'title',
      header: 'موضوع شکایت',
      render: (row) => <span className="font-semibold text-ink-800">{row.title}</span>,
    },
    {
      key: 'complainant',
      header: 'شاکی',
      render: (row) => row.user?.full_name ?? `کاربر ${toPersianDigits(row.user_id)}`,
    },
    {
      key: 'task',
      header: 'تسک پروژه',
      render: (row) =>
        row.project?.application?.task?.title ?? `پروژه ${toPersianDigits(row.project_id)}`,
    },
    {
      key: 'amount',
      header: 'مبلغ پروژه',
      render: (row) => (
        <span className="text-emerald-700">
          {row.project ? formatToman(row.project.amount) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (row) => <StatusBadge meta={metaOf(complaintStatusMeta, row.status)} />,
    },
    {
      key: 'created_at',
      header: 'تاریخ ثبت',
      render: (row) => formatDate(row.created_at),
      hideOnMobile: true,
    },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="مدیریت شکایات"
        description="بررسی و داوری شکایت‌های ثبت‌شده روی پروژه‌ها"
      />

      <SegmentedTabs
        ariaLabel="فیلتر وضعیت شکایت"
        items={FILTERS.map((item) => ({
          to: item === 'all' ? '/admin/complaints' : `/admin/complaints?status=${item}`,
          label: FILTER_LABEL[item],
          active: item === status,
        }))}
      />

      {complaints.loading ? (
        <SkeletonList count={4} />
      ) : complaints.error ? (
        <ErrorState error={complaints.error} onRetry={complaints.reload} />
      ) : (
        <>
          {items.length > 0 ? (
            <p className="text-[12.5px] text-ink-500">
              {toPersianDigits(complaints.data?.total ?? items.length)} شکایت
            </p>
          ) : null}

          <AdminTable
            columns={columns}
            rows={items}
            rowKey={(row) => row.id}
            onRowClick={(row) => navigate(`/admin/complaints/${row.id}`)}
            emptyState={
              <EmptyState
                title={
                  status === 'all' ? 'شکایتی ثبت نشده است' : `شکایتی با وضعیت «${FILTER_LABEL[status]}» نیست`
                }
                description="با تغییر فیلتر وضعیت، شکایت‌های دیگر را ببینید."
                icon={<IconWarning className="size-6" />}
              />
            }
          />

          {complaints.data ? (
            <Pagination
              currentPage={complaints.data.current_page}
              lastPage={complaints.data.last_page}
              total={complaints.data.total}
              disabled={complaints.refreshing}
              onChange={(next) => {
                setPageState({ status, page: next })
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
