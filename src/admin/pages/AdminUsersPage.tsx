import { useCallback, useState, type FormEvent } from 'react'
import { deleteAdminUser, fetchAdminUsers } from '@/admin/api/adminApi'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { IconSearch, IconUsers } from '@/components/ui/Icons'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { SkeletonList } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMutation } from '@/hooks/useMutation'
import { formatDate, toEnglishDigits, toPersianDigits } from '@/lib/format'
import type { StatusMeta } from '@/lib/labels'
import { AdminTable, type AdminColumn } from '../components/AdminTable'
import type { AdminUserListItem } from '../api/types'

/** بک‌اند برای کاربر وضعیت متنی ندارد؛ فقط is_active برمی‌گرداند */
const ACTIVE_META: StatusMeta = { label: 'فعال', tone: 'success' }
const INACTIVE_META: StatusMeta = { label: 'غیرفعال', tone: 'neutral' }

function isAdmin(user: AdminUserListItem): boolean {
  return (user.roles ?? []).some((role) => role.name === 'admin')
}

/** فهرست کاربران + جست‌وجو با شماره موبایل + حذف — GET/DELETE /api/admin/users */
export default function AdminUsersPage() {
  useDocumentTitle('مدیریت کاربران — ادمین')
  const toast = useToast()

  /** متن داخل input جدا از عبارت جست‌وجوشده است تا با هر کاراکتر درخواست نرود */
  const [term, setTerm] = useState('')
  const [search, setSearch] = useState<{ mobile: string; page: number }>({ mobile: '', page: 1 })
  const [target, setTarget] = useState<AdminUserListItem | null>(null)

  const loader = useCallback(
    (signal: AbortSignal) => fetchAdminUsers({ mobile: search.mobile, page: search.page }, signal),
    [search],
  )
  const users = useApiResource(loader, [search])

  const deleteMutation = useMutation((user: AdminUserListItem) => deleteAdminUser(user.id), {
    onSuccess: (result) => {
      toast.success(result.message)
      setTarget(null)
      // فهرست ممکن است یک ردیف کم شده باشد؛ همان صفحه دوباره خوانده می‌شود
      users.reload()
    },
    onError: (error) => toast.error(error.message),
  })

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    // بک‌اند فقط رقم می‌پذیرد، پس ارقام فارسی قبل از ارسال انگلیسی می‌شوند
    setSearch({ mobile: toEnglishDigits(term).replace(/\D/g, ''), page: 1 })
  }

  const clearSearch = () => {
    setTerm('')
    setSearch({ mobile: '', page: 1 })
  }

  const items = users.data?.data ?? []

  const columns: Array<AdminColumn<AdminUserListItem>> = [
    {
      key: 'id',
      header: 'شناسه',
      render: (row) => toPersianDigits(row.id),
      hideOnMobile: true,
    },
    {
      key: 'full_name',
      header: 'نام و نام خانوادگی',
      render: (row) => <span className="font-semibold text-ink-800">{row.full_name}</span>,
    },
    {
      key: 'mobile',
      header: 'شماره موبایل',
      render: (row) => (
        <span dir="ltr" className="text-ink-700">
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
    {
      key: 'is_active',
      header: 'وضعیت',
      render: (row) => <StatusBadge meta={row.is_active ? ACTIVE_META : INACTIVE_META} />,
    },
    {
      key: 'created_at',
      header: 'تاریخ عضویت',
      render: (row) => formatDate(row.created_at),
      hideOnMobile: true,
    },
    {
      key: 'actions',
      header: 'حذف',
      render: (row) =>
        isAdmin(row) ? (
          <span className="text-[12px] text-ink-400">حساب ادمین</span>
        ) : (
          <Button
            size="sm"
            variant="danger"
            onClick={() => setTarget(row)}
            disabled={deleteMutation.loading}
          >
            حذف کاربر
          </Button>
        ),
    },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="مدیریت کاربران"
        description="جست‌وجوی کاربران با شماره موبایل و حذف حساب کاربری"
      />

      <form
        onSubmit={submitSearch}
        className="flex flex-col gap-2 rounded-2xl border border-ink-200 bg-white p-4 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center"
      >
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="شماره موبایل کاربر، مثلاً ۰۹۱۲…"
          inputMode="numeric"
          dir="ltr"
          aria-label="جست‌وجو با شماره موبایل"
          className="sm:flex-1"
        />
        <div className="flex gap-2">
          <Button type="submit" icon={<IconSearch className="size-4" />} className="sm:w-auto">
            جست‌وجو
          </Button>
          {search.mobile ? (
            <Button type="button" variant="secondary" onClick={clearSearch} className="sm:w-auto">
              پاک کردن
            </Button>
          ) : null}
        </div>
      </form>

      {users.loading ? (
        <SkeletonList count={5} />
      ) : users.error ? (
        <ErrorState error={users.error} onRetry={users.reload} />
      ) : (
        <>
          {items.length > 0 ? (
            <p className="text-[12.5px] text-ink-500">
              {toPersianDigits(users.data?.total ?? items.length)} کاربر
              {search.mobile ? ` با شماره شامل «${toPersianDigits(search.mobile)}»` : null}
            </p>
          ) : null}

          <AdminTable
            columns={columns}
            rows={items}
            rowKey={(row) => row.id}
            emptyState={
              <EmptyState
                title={search.mobile ? 'کاربری با این شماره پیدا نشد' : 'کاربری ثبت نشده است'}
                description={
                  search.mobile
                    ? 'شماره موبایل را بررسی کنید یا جست‌وجو را پاک کنید.'
                    : 'هنوز هیچ کاربری در سامانه ثبت‌نام نکرده است.'
                }
                icon={<IconUsers className="size-6" />}
              />
            }
          />

          {users.data ? (
            <Pagination
              currentPage={users.data.current_page}
              lastPage={users.data.last_page}
              total={users.data.total}
              disabled={users.refreshing}
              onChange={(next) => {
                setSearch((current) => ({ ...current, page: next }))
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          ) : null}
        </>
      )}

      <ConfirmDialog
        open={target !== null}
        title="حذف کاربر"
        description={
          target
            ? `${target.full_name} با شماره ${toPersianDigits(target.mobile)} حذف می‌شود.`
            : undefined
        }
        confirmLabel="حذف کاربر"
        tone="danger"
        loading={deleteMutation.loading}
        onConfirm={() => target && void deleteMutation.run(target)}
        onCancel={() => {
          setTarget(null)
          deleteMutation.reset()
        }}
      >
        <div className="space-y-3">
          {deleteMutation.error ? <ErrorState error={deleteMutation.error} compact /> : null}
          <Alert tone="danger" title="این کار قابل بازگشت نیست">
            اگر این کاربر در هیچ پروژه‌ای نباشد، حساب و تسک‌ها و درخواست‌های همکاری‌اش کامل حذف
            می‌شود. اگر سابقهٔ پروژه داشته باشد، برای اینکه تاریخچهٔ طرف مقابل از بین نرود، حساب او
            فقط غیرفعال می‌شود. نتیجهٔ نهایی بعد از تایید به شما اعلام می‌شود.
          </Alert>
        </div>
      </ConfirmDialog>
    </div>
  )
}
