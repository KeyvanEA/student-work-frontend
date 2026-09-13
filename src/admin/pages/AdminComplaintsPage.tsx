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
import { formatDate, toPersianDigits } from '@/lib/format'
import { complaintStatusMeta, metaOf } from '@/lib/labels'
import { adminApi } from '../api/adminApi'
import { plannedAdminEndpoints } from '../api/plannedEndpoints'
import { AdminFilters, AdminTable, type AdminColumn } from '../components/AdminTable'
import { MockNotice } from '../components/MockNotice'
import type { AdminComplaintRow } from '../api/types'

const COMPLAINT_STATUSES = ['pending', 'reviewing', 'resolved', 'rejected'] as const

export default function AdminComplaintsPage() {
  useDocumentTitle('شکایات — ادمین')
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const loader = useCallback(
    () => adminApi.complaints({ page, search, status, from: from || undefined, to: to || undefined }),
    [page, search, status, from, to],
  )
  const complaints = useApiResource(loader, [page, search, status, from, to])

  const columns: Array<AdminColumn<AdminComplaintRow>> = [
    { key: 'id', header: 'شناسه', render: (row) => toPersianDigits(row.id), hideOnMobile: true },
    {
      key: 'title',
      header: 'موضوع',
      render: (row) => <span className="font-semibold text-ink-800">{row.title}</span>,
    },
    { key: 'complainant', header: 'شاکی', render: (row) => row.complainant.full_name },
    {
      key: 'project',
      header: 'پروژه',
      render: (row) => `پروژه ${toPersianDigits(row.project_id)}`,
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
        title="شکایات"
        description="بررسی و داوری شکایت‌های ثبت‌شده روی پروژه‌ها"
      />

      <MockNotice
        endpoints={[
          `GET ${plannedAdminEndpoints.complaints()}`,
          `GET ${plannedAdminEndpoints.complaint('{complaint}')}`,
          `PATCH ${plannedAdminEndpoints.complaintReview('{complaint}')}`,
          `PATCH ${plannedAdminEndpoints.complaintDecision('{complaint}')}`,
        ]}
      />

      <AdminFilters>
        <Field label="جستجو">
          <Input
            value={search}
            placeholder="موضوع، شاکی یا شناسه پروژه…"
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
            {COMPLAINT_STATUSES.map((item) => (
              <option key={item} value={item}>
                {metaOf(complaintStatusMeta, item).label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="از تاریخ">
          <Input
            type="date"
            dir="ltr"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value)
              setPage(1)
            }}
          />
        </Field>
        <Field label="تا تاریخ">
          <Input
            type="date"
            dir="ltr"
            value={to}
            onChange={(event) => {
              setTo(event.target.value)
              setPage(1)
            }}
          />
        </Field>
      </AdminFilters>

      {complaints.loading ? (
        <SkeletonList count={4} />
      ) : complaints.error ? (
        <ErrorState error={complaints.error} onRetry={complaints.reload} />
      ) : (
        <>
          <AdminTable
            columns={columns}
            rows={complaints.data?.data ?? []}
            rowKey={(row) => row.id}
            onRowClick={(row) => navigate(`/admin/complaints/${row.id}`)}
            emptyState={<EmptyState title="شکایتی پیدا نشد" description="فیلترها را تغییر دهید." />}
          />

          {complaints.data ? (
            <Pagination
              currentPage={complaints.data.current_page}
              lastPage={complaints.data.last_page}
              total={complaints.data.total}
              disabled={complaints.refreshing}
              onChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
