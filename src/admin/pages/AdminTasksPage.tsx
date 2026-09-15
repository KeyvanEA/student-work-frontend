import { useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchAdminTasks } from '@/admin/api/adminApi'
import { SegmentedTabs } from '@/components/domain/SegmentedTabs'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { IconTasks } from '@/components/ui/Icons'
import { Pagination } from '@/components/ui/Pagination'
import { SkeletonList } from '@/components/ui/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { deadlineInfo, formatDate, formatToman, toPersianDigits } from '@/lib/format'
import { metaOf, taskStatusMeta } from '@/lib/labels'
import { AdminTable, type AdminColumn } from '../components/AdminTable'
import type { AdminTaskFilter, AdminTaskListItem } from '../api/types'

const FILTERS: AdminTaskFilter[] = ['pending', 'open', 'rejected', 'all']

const FILTER_LABEL: Record<AdminTaskFilter, string> = {
  pending: 'در انتظار بررسی',
  open: 'منتشرشده',
  rejected: 'ردشده',
  all: 'همه',
}

function isFilter(value: string | null): value is AdminTaskFilter {
  return value !== null && (FILTERS as string[]).includes(value)
}

/** فهرست تسک‌ها برای بررسی ادمین — GET /api/admin/tasks[?status=…] */
export default function AdminTasksPage() {
  useDocumentTitle('مدیریت تسک‌ها — ادمین')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const statusParam = searchParams.get('status')
  /** بک‌اند بدون پارامتر هم روی تسک‌های در انتظار بررسی متمرکز است */
  const status: AdminTaskFilter = isFilter(statusParam) ? statusParam : 'pending'

  /** شمارهٔ صفحه به فیلتر جاری گره خورده تا با تغییر فیلتر به صفحهٔ ۱ برگردد */
  const [pageState, setPageState] = useState<{ status: AdminTaskFilter; page: number }>({
    status,
    page: 1,
  })
  const page = pageState.status === status ? pageState.page : 1

  const loader = useCallback(
    (signal: AbortSignal) => fetchAdminTasks({ status, page }, signal),
    [status, page],
  )
  const tasks = useApiResource(loader, [status, page])

  const items = tasks.data?.data ?? []

  const columns: Array<AdminColumn<AdminTaskListItem>> = [
    {
      key: 'id',
      header: 'شناسه',
      render: (row) => toPersianDigits(row.id),
      hideOnMobile: true,
    },
    {
      key: 'title',
      header: 'عنوان تسک',
      render: (row) => <span className="font-semibold text-ink-800">{row.title}</span>,
    },
    {
      key: 'employer',
      header: 'کارفرما',
      render: (row) => row.user?.full_name ?? `کاربر ${toPersianDigits(row.user_id)}`,
    },
    {
      key: 'category',
      header: 'دسته‌بندی',
      render: (row) => row.category?.name ?? '—',
      hideOnMobile: true,
    },
    {
      key: 'budget',
      header: 'بودجه',
      render: (row) => <span className="text-emerald-700">{formatToman(row.budget)}</span>,
    },
    {
      key: 'deadline',
      header: 'مهلت',
      render: (row) => {
        const deadline = deadlineInfo(row.deadline)
        return (
          <span className={deadline.tone === 'danger' ? 'text-rose-600' : undefined}>
            {formatDate(row.deadline)}
          </span>
        )
      },
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (row) => <StatusBadge meta={metaOf(taskStatusMeta, row.status)} />,
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
        title="مدیریت تسک‌ها"
        description="بررسی تسک‌های ثبت‌شده و تصمیم‌گیری دربارهٔ انتشار آن‌ها"
      />

      <SegmentedTabs
        ariaLabel="فیلتر وضعیت تسک"
        items={FILTERS.map((item) => ({
          to: item === 'pending' ? '/admin/tasks' : `/admin/tasks?status=${item}`,
          label: FILTER_LABEL[item],
          active: item === status,
        }))}
      />

      {tasks.loading ? (
        <SkeletonList count={4} />
      ) : tasks.error ? (
        <ErrorState error={tasks.error} onRetry={tasks.reload} />
      ) : (
        <>
          {items.length > 0 ? (
            <p className="text-[12.5px] text-ink-500">
              {toPersianDigits(tasks.data?.total ?? items.length)} تسک
            </p>
          ) : null}

          <AdminTable
            columns={columns}
            rows={items}
            rowKey={(row) => row.id}
            onRowClick={(row) => navigate(`/admin/tasks/${row.id}`)}
            emptyState={
              <EmptyState
                title={
                  status === 'pending'
                    ? 'تسکی در انتظار بررسی نیست'
                    : `تسکی با وضعیت «${FILTER_LABEL[status]}» نیست`
                }
                description="با تغییر فیلتر وضعیت، تسک‌های دیگر را ببینید."
                icon={<IconTasks className="size-6" />}
              />
            }
          />

          {tasks.data ? (
            <Pagination
              currentPage={tasks.data.current_page}
              lastPage={tasks.data.last_page}
              total={tasks.data.total}
              disabled={tasks.refreshing}
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
