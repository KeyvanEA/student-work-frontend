import { useCallback, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Field } from '@/components/ui/Field'
import { IconPlus } from '@/components/ui/Icons'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { SkeletonList } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMutation } from '@/hooks/useMutation'
import { formatDate, formatNumber, toPersianDigits } from '@/lib/format'
import { adminApi } from '../api/adminApi'
import { plannedAdminEndpoints } from '../api/plannedEndpoints'
import { AdminTable, type AdminColumn } from '../components/AdminTable'
import { MockNotice } from '../components/MockNotice'
import type { AdminCategoryRow } from '../api/types'

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s‌]+/g, '-')
    .replace(/[^\w؀-ۿ-]/g, '')
}

export default function AdminCategoriesPage() {
  useDocumentTitle('دسته‌بندی‌ها — ادمین')
  const toast = useToast()

  const loader = useCallback(() => adminApi.categories(), [])
  const categories = useApiResource(loader, [])

  const [editing, setEditing] = useState<AdminCategoryRow | 'new' | null>(null)
  const [removing, setRemoving] = useState<AdminCategoryRow | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  const saveMutation = useMutation(
    () =>
      editing === 'new'
        ? adminApi.createCategory(name.trim(), slug.trim() || slugify(name))
        : adminApi.updateCategory(
            (editing as AdminCategoryRow).id,
            name.trim(),
            slug.trim() || slugify(name),
          ),
    {
      onSuccess: () => {
        toast.success(editing === 'new' ? 'دسته‌بندی ساخته شد.' : 'دسته‌بندی به‌روزرسانی شد.')
        setEditing(null)
        categories.reload()
      },
      onError: (error) => toast.error(error.message),
    },
  )

  const deleteMutation = useMutation(() => adminApi.deleteCategory(removing!.id), {
    onSuccess: () => {
      toast.success('دسته‌بندی حذف شد.')
      setRemoving(null)
      categories.reload()
    },
    onError: (error) => {
      toast.error(error.message)
      setRemoving(null)
    },
  })

  const openEditor = (row: AdminCategoryRow | 'new') => {
    setEditing(row)
    setName(row === 'new' ? '' : row.name)
    setSlug(row === 'new' ? '' : row.slug)
  }

  const columns: Array<AdminColumn<AdminCategoryRow>> = [
    { key: 'id', header: 'شناسه', render: (row) => toPersianDigits(row.id), hideOnMobile: true },
    {
      key: 'name',
      header: 'نام',
      render: (row) => <span className="font-semibold text-ink-800">{row.name}</span>,
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (row) => (
        <span dir="ltr" className="font-mono text-[12px] text-ink-500">
          {row.slug}
        </span>
      ),
    },
    { key: 'tasks', header: 'تعداد تسک', render: (row) => formatNumber(row.tasks_count) },
    {
      key: 'created_at',
      header: 'تاریخ ساخت',
      render: (row) => formatDate(row.created_at),
      hideOnMobile: true,
    },
    {
      key: 'actions',
      header: 'عملیات',
      render: (row) => (
        <div className="flex flex-wrap justify-end gap-1.5">
          <Button size="sm" variant="ghost" onClick={() => openEditor(row)}>
            ویرایش
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="!text-rose-600 hover:!bg-rose-50"
            disabled={row.tasks_count > 0}
            title={row.tasks_count > 0 ? 'این دسته‌بندی تسک دارد و حذف آن خطرناک است.' : undefined}
            onClick={() => setRemoving(row)}
          >
            حذف
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="دسته‌بندی‌ها"
        description="مدیریت دسته‌بندی تسک‌ها"
        action={
          <Button size="sm" icon={<IconPlus className="size-4" />} onClick={() => openEditor('new')}>
            دسته‌بندی جدید
          </Button>
        }
      />

      <MockNotice
        endpoints={[
          `GET ${plannedAdminEndpoints.categories()}`,
          `POST ${plannedAdminEndpoints.categories()}`,
          `PATCH ${plannedAdminEndpoints.category('{category}')}`,
          `DELETE ${plannedAdminEndpoints.category('{category}')}`,
        ]}
      />

      <Alert tone="warning" title="حذف دسته‌بندی دارای تسک مسدود است">
        در دیتابیس، <code className="font-mono text-[11px]">tasks.category_id</code> با{' '}
        <code className="font-mono text-[11px]">cascadeOnDelete</code> تعریف شده؛ یعنی حذف یک
        دسته‌بندی همهٔ تسک‌های آن را هم پاک می‌کند. بنابراین دکمهٔ حذف فقط برای دسته‌بندی بدون تسک
        فعال است. اگر قرار است دسته‌بندی‌های قدیمی از دسترس خارج شوند، مسیر درست افزودن ستون
        فعال/غیرفعال در بک‌اند است، نه حذف.
      </Alert>

      {categories.loading ? (
        <SkeletonList count={4} />
      ) : categories.error ? (
        <ErrorState error={categories.error} onRetry={categories.reload} />
      ) : (
        <AdminTable
          columns={columns}
          rows={categories.data ?? []}
          rowKey={(row) => row.id}
          emptyState={<EmptyState title="دسته‌بندی‌ای ثبت نشده" />}
        />
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'دسته‌بندی جدید' : 'ویرایش دسته‌بندی'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={saveMutation.loading}>
              انصراف
            </Button>
            <Button
              onClick={() => void saveMutation.run()}
              loading={saveMutation.loading}
              disabled={name.trim().length < 2}
            >
              ذخیره
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {saveMutation.error ? <ErrorState error={saveMutation.error} compact /> : null}

          <Field label="نام دسته‌بندی" required>
            <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} />
          </Field>

          <Field label="Slug" hint="اگر خالی بماند از روی نام ساخته می‌شود.">
            <Input
              value={slug}
              dir="ltr"
              onChange={(event) => setSlug(event.target.value)}
              placeholder={slugify(name) || 'category-slug'}
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={removing !== null}
        title="حذف دسته‌بندی"
        description={
          removing
            ? `دسته‌بندی «${removing.name}» حذف می‌شود. این عملیات قابل بازگشت نیست.`
            : undefined
        }
        confirmLabel="حذف کن"
        tone="danger"
        loading={deleteMutation.loading}
        onConfirm={() => void deleteMutation.run()}
        onCancel={() => setRemoving(null)}
      />
    </div>
  )
}
