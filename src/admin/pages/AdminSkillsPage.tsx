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
import type { AdminSkillRow } from '../api/types'

export default function AdminSkillsPage() {
  useDocumentTitle('مهارت‌ها — ادمین')
  const toast = useToast()

  const loader = useCallback(() => adminApi.skills(), [])
  const skills = useApiResource(loader, [])

  const [editing, setEditing] = useState<AdminSkillRow | 'new' | null>(null)
  const [removing, setRemoving] = useState<AdminSkillRow | null>(null)
  const [name, setName] = useState('')

  const saveMutation = useMutation(
    () =>
      editing === 'new'
        ? adminApi.createSkill(name.trim())
        : adminApi.updateSkill((editing as AdminSkillRow).id, name.trim()),
    {
      onSuccess: () => {
        toast.success(editing === 'new' ? 'مهارت ساخته شد.' : 'مهارت به‌روزرسانی شد.')
        setEditing(null)
        skills.reload()
      },
      onError: (error) => toast.error(error.message),
    },
  )

  const deleteMutation = useMutation(() => adminApi.deleteSkill(removing!.id), {
    onSuccess: () => {
      toast.success('مهارت حذف شد.')
      setRemoving(null)
      skills.reload()
    },
    onError: (error) => {
      toast.error(error.message)
      setRemoving(null)
    },
  })

  const openEditor = (row: AdminSkillRow | 'new') => {
    setEditing(row)
    setName(row === 'new' ? '' : row.name)
  }

  const columns: Array<AdminColumn<AdminSkillRow>> = [
    { key: 'id', header: 'شناسه', render: (row) => toPersianDigits(row.id), hideOnMobile: true },
    {
      key: 'name',
      header: 'نام مهارت',
      render: (row) => <span className="font-semibold text-ink-800">{row.name}</span>,
    },
    { key: 'tasks', header: 'تعداد تسک', render: (row) => formatNumber(row.tasks_count) },
    { key: 'users', header: 'تعداد کاربر', render: (row) => formatNumber(row.users_count) },
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
            disabled={row.tasks_count > 0 || row.users_count > 0}
            title={
              row.tasks_count > 0 || row.users_count > 0
                ? 'این مهارت به تسک یا کاربر وصل است و حذف آن رابطه‌ها را پاک می‌کند.'
                : undefined
            }
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
        title="مهارت‌ها"
        description="مدیریت فهرست مهارت‌های قابل انتخاب در تسک و پروفایل"
        action={
          <Button size="sm" icon={<IconPlus className="size-4" />} onClick={() => openEditor('new')}>
            مهارت جدید
          </Button>
        }
      />

      <MockNotice
        endpoints={[
          `GET ${plannedAdminEndpoints.skills()}`,
          `POST ${plannedAdminEndpoints.skills()}`,
          `PATCH ${plannedAdminEndpoints.skill('{skill}')}`,
          `DELETE ${plannedAdminEndpoints.skill('{skill}')}`,
        ]}
      />

      <Alert tone="warning" title="حذف مهارتِ در حال استفاده مسدود است">
        جدول‌های <code className="font-mono text-[11px]">skill_task</code> و{' '}
        <code className="font-mono text-[11px]">user_skills</code> با{' '}
        <code className="font-mono text-[11px]">cascadeOnDelete</code> تعریف شده‌اند؛ حذف یک مهارت
        رابطهٔ آن با تسک‌ها و پروفایل کاربران را هم پاک می‌کند. به همین دلیل حذف فقط برای مهارت بدون
        استفاده فعال است.
      </Alert>

      {skills.loading ? (
        <SkeletonList count={4} />
      ) : skills.error ? (
        <ErrorState error={skills.error} onRetry={skills.reload} />
      ) : (
        <AdminTable
          columns={columns}
          rows={skills.data ?? []}
          rowKey={(row) => row.id}
          emptyState={<EmptyState title="مهارتی ثبت نشده" />}
        />
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'مهارت جدید' : 'ویرایش مهارت'}
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
          <Field label="نام مهارت" required>
            <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={removing !== null}
        title="حذف مهارت"
        description={
          removing ? `مهارت «${removing.name}» حذف می‌شود. این عملیات قابل بازگشت نیست.` : undefined
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
