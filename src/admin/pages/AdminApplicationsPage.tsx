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
import { formatDate, toPersianDigits } from '@/lib/format'
import { applicationStatusMeta, metaOf } from '@/lib/labels'
import { adminApi } from '../api/adminApi'
import { plannedAdminEndpoints } from '../api/plannedEndpoints'
import { AdminFilters, AdminTable, type AdminColumn } from '../components/AdminTable'
import { MockNotice } from '../components/MockNotice'
import type { AdminApplicationRow } from '../api/types'

const APPLICATION_STATUSES = ['pending', 'contacted', 'accepted', 'rejected'] as const

export default function AdminApplicationsPage() {
  useDocumentTitle('درخواست‌های همکاری — ادمین')
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const loader = useCallback(
    () => adminApi.applications({ page, search, status }),
    [page, search, status],
  )
  const applications = useApiResource(loader, [page, search, status])

  const columns: Array<AdminColumn<AdminApplicationRow>> = [
    { key: 'id', header: 'شناسه', render: (row) => toPersianDigits(row.id), hideOnMobile: true },
    {
      key: 'task',
      header: 'تسک',
      render: (row) => <span className="font-semibold text-ink-800">{row.task.title}</span>,
    },
    { key: 'applicant', header: 'کارجو', render: (row) => row.applicant.full_name },
    { key: 'employer', header: 'کارفرما', render: (row) => row.employer.full_name },
    {
      key: 'status',
      header: 'وضعیت',
      render: (row) => <StatusBadge meta={metaOf(applicationStatusMeta, row.status)} />,
    },
    {
      key: 'created_at',
      header: 'تاریخ ارسال',
      render: (row) => formatDate(row.created_at),
      hideOnMobile: true,
    },
  ]

  return (
    <div className="space-y-4">
      <PageHeader title="درخواست‌های همکاری" description="پایش درخواست‌های ثبت‌شده روی تسک‌ها" />

      <MockNotice
        endpoints={[
          `GET ${plannedAdminEndpoints.applications()}`,
          `GET ${plannedAdminEndpoints.application('{application}')}`,
        ]}
      />

      <Alert tone="info">
        در MVP ادمین فقط نقش ناظر دارد؛ پذیرش یا رد درخواست همکاری به‌جای کارفرما انجام نمی‌شود.
      </Alert>

      <AdminFilters>
        <Field label="جستجو" className="sm:col-span-2 lg:col-span-3">
          <Input
            value={search}
            placeholder="عنوان تسک، نام کارجو یا کارفرما…"
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
            {APPLICATION_STATUSES.map((item) => (
              <option key={item} value={item}>
                {metaOf(applicationStatusMeta, item).label}
              </option>
            ))}
          </Select>
        </Field>
      </AdminFilters>

      {applications.loading ? (
        <SkeletonList count={4} />
      ) : applications.error ? (
        <ErrorState error={applications.error} onRetry={applications.reload} />
      ) : (
        <>
          <AdminTable
            columns={columns}
            rows={applications.data?.data ?? []}
            rowKey={(row) => row.id}
            onRowClick={(row) => navigate(`/admin/applications/${row.id}`)}
            emptyState={
              <EmptyState title="درخواستی پیدا نشد" description="فیلترها را تغییر دهید." />
            }
          />

          {applications.data ? (
            <Pagination
              currentPage={applications.data.current_page}
              lastPage={applications.data.last_page}
              total={applications.data.total}
              disabled={applications.refreshing}
              onChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
