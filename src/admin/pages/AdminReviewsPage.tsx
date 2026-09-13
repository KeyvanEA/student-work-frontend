import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
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
import { adminApi } from '../api/adminApi'
import { plannedAdminEndpoints } from '../api/plannedEndpoints'
import { AdminFilters, AdminTable, type AdminColumn } from '../components/AdminTable'
import { MockNotice } from '../components/MockNotice'
import type { AdminReviewRow } from '../api/types'

export default function AdminReviewsPage() {
  useDocumentTitle('رضایت‌ها — ادمین')

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [satisfied, setSatisfied] = useState<'all' | 'yes' | 'no'>('all')

  const loader = useCallback(
    () => adminApi.reviews({ page, search, satisfied }),
    [page, search, satisfied],
  )
  const reviews = useApiResource(loader, [page, search, satisfied])

  const columns: Array<AdminColumn<AdminReviewRow>> = [
    { key: 'id', header: 'شناسه', render: (row) => toPersianDigits(row.id), hideOnMobile: true },
    {
      key: 'project',
      header: 'پروژه',
      render: (row) => (
        <Link
          to={`/admin/projects/${row.project_id}`}
          className="font-semibold text-brand-600 hover:underline"
        >
          {row.project_title}
        </Link>
      ),
    },
    { key: 'reviewer', header: 'ثبت‌کننده', render: (row) => row.reviewer.full_name },
    { key: 'reviewed', header: 'دربارهٔ', render: (row) => row.reviewed_user.full_name },
    {
      key: 'is_satisfied',
      header: 'نتیجه',
      render: (row) => (
        <Badge tone={row.is_satisfied ? 'success' : 'danger'} dot>
          {row.is_satisfied ? 'رضایت' : 'نارضایتی'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'تاریخ',
      render: (row) => formatDate(row.created_at),
      hideOnMobile: true,
    },
  ]

  return (
    <div className="space-y-4">
      <PageHeader title="رضایت‌ها" description="ارزیابی‌های ثبت‌شده بین کارفرما و کارجو" />

      <MockNotice
        endpoints={[
          `GET ${plannedAdminEndpoints.reviews()}`,
          `GET ${plannedAdminEndpoints.review('{review}')}`,
        ]}
      />

      <Alert tone="info">
        ارزیابی در MVP فقط دو حالت رضایت/نارضایتی دارد و ادمین اجازهٔ حذف آن را ندارد.
      </Alert>

      <AdminFilters>
        <Field label="جستجو" className="sm:col-span-2 lg:col-span-3">
          <Input
            value={search}
            placeholder="عنوان پروژه یا نام کاربران…"
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
        </Field>
        <Field label="نتیجه">
          <Select
            value={satisfied}
            onChange={(event) => {
              setSatisfied(event.target.value as typeof satisfied)
              setPage(1)
            }}
          >
            <option value="all">همه</option>
            <option value="yes">رضایت</option>
            <option value="no">نارضایتی</option>
          </Select>
        </Field>
      </AdminFilters>

      {reviews.loading ? (
        <SkeletonList count={3} />
      ) : reviews.error ? (
        <ErrorState error={reviews.error} onRetry={reviews.reload} />
      ) : (
        <>
          <AdminTable
            columns={columns}
            rows={reviews.data?.data ?? []}
            rowKey={(row) => row.id}
            emptyState={<EmptyState title="ارزیابی‌ای پیدا نشد" description="فیلترها را تغییر دهید." />}
          />

          {reviews.data ? (
            <Pagination
              currentPage={reviews.data.current_page}
              lastPage={reviews.data.last_page}
              total={reviews.data.total}
              disabled={reviews.refreshing}
              onChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
