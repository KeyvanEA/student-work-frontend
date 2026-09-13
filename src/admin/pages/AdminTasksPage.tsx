import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { SkeletonList } from '@/components/ui/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDate, formatToman, toPersianDigits } from '@/lib/format'
import { metaOf, taskStatusMeta } from '@/lib/labels'
import { adminApi } from '../api/adminApi'
import { plannedAdminEndpoints } from '../api/plannedEndpoints'
import { AdminFilters, AdminTable, type AdminColumn } from '../components/AdminTable'
import { MockNotice } from '../components/MockNotice'
import type { AdminTaskRow } from '../api/types'

const TASK_STATUSES = ['open', 'assigned', 'completed', 'cancelled', 'expired'] as const

export default function AdminTasksPage() {
  useDocumentTitle('تسک‌ها — ادمین')
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [categoryId, setCategoryId] = useState<string>('all')

  const categoriesLoader = useCallback(() => adminApi.categories(), [])
  const categories = useApiResource(categoriesLoader, [])

  const loader = useCallback(
    () =>
      adminApi.tasks({
        page,
        search,
        status,
        categoryId: categoryId === 'all' ? 'all' : Number(categoryId),
      }),
    [page, search, status, categoryId],
  )
  const tasks = useApiResource(loader, [page, search, status, categoryId])

  const columns: Array<AdminColumn<AdminTaskRow>> = [
    { key: 'id', header: 'شناسه', render: (row) => toPersianDigits(row.id), hideOnMobile: true },
    {
      key: 'title',
      header: 'عنوان',
      render: (row) => <span className="font-semibold text-ink-800">{row.title}</span>,
    },
    { key: 'owner', header: 'کارفرما', render: (row) => row.owner.full_name },
    { key: 'category', header: 'دسته‌بندی', render: (row) => row.category.name },
    {
      key: 'budget',
      header: 'بودجه',
      render: (row) => <span className="text-emerald-700">{formatToman(row.budget)}</span>,
    },
    {
      key: 'deadline',
      header: 'مهلت',
      render: (row) => formatDate(row.deadline),
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (row) => <StatusBadge meta={metaOf(taskStatusMeta, row.status)} />,
    },
  ]

  return (
    <div className="space-y-4">
      <PageHeader title="تسک‌ها" description="پایش و نظارت بر تسک‌های ثبت‌شده" />

      <MockNotice
        endpoints={[
          `GET ${plannedAdminEndpoints.tasks()}`,
          `GET ${plannedAdminEndpoints.task('{task}')}`,
          `PATCH ${plannedAdminEndpoints.taskCancel('{task}')}`,
        ]}
      />

      <AdminFilters>
        <Field label="جستجو" className="sm:col-span-2">
          <Input
            value={search}
            placeholder="عنوان تسک یا نام کارفرما…"
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
        </Field>
        <Field label="وضعیت">
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(1)
            }}
          >
            <option value="all">همه</option>
            {TASK_STATUSES.map((item) => (
              <option key={item} value={item}>
                {metaOf(taskStatusMeta, item).label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="دسته‌بندی">
          <Select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value)
              setPage(1)
            }}
          >
            <option value="all">همه</option>
            {(categories.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Field>
      </AdminFilters>

      {tasks.loading ? (
        <SkeletonList count={4} />
      ) : tasks.error ? (
        <ErrorState error={tasks.error} onRetry={tasks.reload} />
      ) : (
        <>
          <AdminTable
            columns={columns}
            rows={tasks.data?.data ?? []}
            rowKey={(row) => row.id}
            onRowClick={(row) => navigate(`/admin/tasks/${row.id}`)}
            emptyState={<EmptyState title="تسکی پیدا نشد" description="فیلترها را تغییر دهید." />}
          />

          {tasks.data ? (
            <Pagination
              currentPage={tasks.data.current_page}
              lastPage={tasks.data.last_page}
              total={tasks.data.total}
              disabled={tasks.refreshing}
              onChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
