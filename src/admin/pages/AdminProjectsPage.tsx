import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
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
import { metaOf, paymentStatusMeta, projectStatusMeta } from '@/lib/labels'
import { adminApi } from '../api/adminApi'
import { plannedAdminEndpoints } from '../api/plannedEndpoints'
import { AdminFilters, AdminTable, type AdminColumn } from '../components/AdminTable'
import { MockNotice } from '../components/MockNotice'
import type { AdminProjectRow } from '../api/types'

const PROJECT_STATUSES = [
  'in_progress',
  'submitted',
  'revision_requested',
  'completed',
  'cancelled',
  'disputed',
] as const

export default function AdminProjectsPage() {
  useDocumentTitle('پروژه‌ها — ادمین')
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [paymentStatus, setPaymentStatus] = useState('all')

  const loader = useCallback(
    () => adminApi.projects({ page, search, status, paymentStatus }),
    [page, search, status, paymentStatus],
  )
  const projects = useApiResource(loader, [page, search, status, paymentStatus])

  const columns: Array<AdminColumn<AdminProjectRow>> = [
    { key: 'id', header: 'شناسه', render: (row) => toPersianDigits(row.id), hideOnMobile: true },
    {
      key: 'title',
      header: 'عنوان',
      render: (row) => <span className="font-semibold text-ink-800">{row.title}</span>,
    },
    { key: 'employer', header: 'کارفرما', render: (row) => row.employer.full_name },
    { key: 'worker', header: 'کارجو', render: (row) => row.worker.full_name },
    {
      key: 'amount',
      header: 'مبلغ',
      render: (row) => <span className="text-emerald-700">{formatToman(row.amount)}</span>,
    },
    {
      key: 'deadline',
      header: 'مهلت',
      render: (row) => formatDate(row.deadline),
      hideOnMobile: true,
    },
    {
      key: 'completed_at',
      header: 'تکمیل',
      render: (row) => (row.completed_at ? formatDate(row.completed_at) : '—'),
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (row) => <StatusBadge meta={metaOf(projectStatusMeta, row.status)} />,
    },
    {
      key: 'payment_status',
      header: 'پرداخت',
      render: (row) => <StatusBadge meta={metaOf(paymentStatusMeta, row.payment_status)} />,
    },
  ]

  return (
    <div className="space-y-4">
      <PageHeader title="پروژه‌ها" description="پایش پروژه‌های ساخته‌شده از درخواست‌های پذیرفته‌شده" />

      <MockNotice
        endpoints={[
          `GET ${plannedAdminEndpoints.projects()}`,
          `GET ${plannedAdminEndpoints.project('{project}')}`,
          `GET ${plannedAdminEndpoints.projectDeliveries('{project}')}`,
        ]}
      />

      <Alert tone="info">در MVP ادمین روی پروژه‌ها فقط نقش ناظر دارد.</Alert>

      <AdminFilters>
        <Field label="جستجو" className="sm:col-span-2">
          <Input
            value={search}
            placeholder="عنوان پروژه، کارفرما یا کارجو…"
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
        </Field>
        <Field label="وضعیت پروژه">
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(1)
            }}
          >
            <option value="all">همه</option>
            {PROJECT_STATUSES.map((item) => (
              <option key={item} value={item}>
                {metaOf(projectStatusMeta, item).label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="وضعیت پرداخت">
          <Select
            value={paymentStatus}
            onChange={(event) => {
              setPaymentStatus(event.target.value)
              setPage(1)
            }}
          >
            <option value="all">همه</option>
            <option value="unpaid">پرداخت نشده</option>
            <option value="paid">پرداخت شده</option>
          </Select>
        </Field>
      </AdminFilters>

      {projects.loading ? (
        <SkeletonList count={4} />
      ) : projects.error ? (
        <ErrorState error={projects.error} onRetry={projects.reload} />
      ) : (
        <>
          <AdminTable
            columns={columns}
            rows={projects.data?.data ?? []}
            rowKey={(row) => row.id}
            onRowClick={(row) => navigate(`/admin/projects/${row.id}`)}
            emptyState={<EmptyState title="پروژه‌ای پیدا نشد" description="فیلترها را تغییر دهید." />}
          />

          {projects.data ? (
            <Pagination
              currentPage={projects.data.current_page}
              lastPage={projects.data.last_page}
              total={projects.data.total}
              disabled={projects.refreshing}
              onChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
