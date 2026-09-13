import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { SkeletonList } from '@/components/ui/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDate, toPersianDigits } from '@/lib/format'
import { adminApi } from '../api/adminApi'
import { plannedAdminEndpoints } from '../api/plannedEndpoints'
import { AdminFilters, AdminTable, type AdminColumn } from '../components/AdminTable'
import { MockNotice } from '../components/MockNotice'
import type { AdminUserRow } from '../api/types'

export default function AdminUsersPage() {
  useDocumentTitle('کاربران — ادمین')
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [active, setActive] = useState<'all' | 'active' | 'inactive'>('all')

  const loader = useCallback(
    () => adminApi.users({ page, search, active }),
    [page, search, active],
  )
  const users = useApiResource(loader, [page, search, active])

  const columns: Array<AdminColumn<AdminUserRow>> = [
    { key: 'id', header: 'شناسه', render: (row) => toPersianDigits(row.id), hideOnMobile: true },
    {
      key: 'name',
      header: 'نام و نام خانوادگی',
      render: (row) => <span className="font-semibold text-ink-800">{row.full_name}</span>,
    },
    {
      key: 'mobile',
      header: 'موبایل',
      render: (row) => (
        <span dir="ltr" className="font-mono text-[12px]">
          {toPersianDigits(row.mobile)}
        </span>
      ),
    },
    {
      key: 'student_number',
      header: 'شماره دانشجویی',
      render: (row) => toPersianDigits(row.student_number),
      hideOnMobile: true,
    },
    { key: 'field', header: 'رشته', render: (row) => row.field_of_study, hideOnMobile: true },
    { key: 'university', header: 'دانشگاه', render: (row) => row.university_name },
    {
      key: 'is_active',
      header: 'وضعیت',
      render: (row) => (
        <Badge tone={row.is_active ? 'success' : 'neutral'} dot>
          {row.is_active ? 'فعال' : 'غیرفعال'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'تاریخ عضویت',
      render: (row) => formatDate(row.created_at),
      hideOnMobile: true,
    },
  ]

  return (
    <div className="space-y-4">
      <PageHeader title="کاربران" description="مشاهده و مدیریت وضعیت کاربران سامانه" />

      <MockNotice
        endpoints={[
          `GET ${plannedAdminEndpoints.users()}`,
          `GET ${plannedAdminEndpoints.user('{user}')}`,
          `PATCH ${plannedAdminEndpoints.userStatus('{user}')}`,
        ]}
      />

      <AdminFilters>
        <Field label="جستجو" className="sm:col-span-2">
          <Input
            value={search}
            placeholder="نام، موبایل، شماره دانشجویی یا دانشگاه…"
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
        </Field>
        <Field label="وضعیت حساب">
          <Select
            value={active}
            onChange={(event) => {
              setActive(event.target.value as typeof active)
              setPage(1)
            }}
          >
            <option value="all">همه</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
          </Select>
        </Field>
      </AdminFilters>

      {users.loading ? (
        <SkeletonList count={4} />
      ) : users.error ? (
        <ErrorState error={users.error} onRetry={users.reload} />
      ) : (
        <>
          <AdminTable
            columns={columns}
            rows={users.data?.data ?? []}
            rowKey={(row) => row.id}
            onRowClick={(row) => navigate(`/admin/users/${row.id}`)}
            emptyState={
              <EmptyState title="کاربری پیدا نشد" description="فیلترها را تغییر دهید." />
            }
          />

          {users.data ? (
            <Pagination
              currentPage={users.data.current_page}
              lastPage={users.data.last_page}
              total={users.data.total}
              disabled={users.refreshing}
              onChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
