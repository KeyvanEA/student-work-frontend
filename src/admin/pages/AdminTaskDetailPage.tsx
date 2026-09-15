import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { approveAdminTask, fetchAdminTask, rejectAdminTask } from '@/admin/api/adminApi'
import { DetailList, DetailRow } from '@/components/domain/DetailList'
import { SkillChips } from '@/components/domain/SkillChips'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { StoredFileList } from '@/components/domain/StoredFileRow'
import { UserProfileDialog } from '@/components/domain/UserProfileDialog'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ErrorState } from '@/components/ui/ErrorState'
import { Field } from '@/components/ui/Field'
import { IconClock, IconMoney, IconUser } from '@/components/ui/Icons'
import { Modal } from '@/components/ui/Modal'
import { SkeletonDetail } from '@/components/ui/Skeleton'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMutation } from '@/hooks/useMutation'
import { deadlineInfo, formatDate, formatDateTime, formatToman, toPersianDigits } from '@/lib/format'
import { metaOf, taskStatusMeta } from '@/lib/labels'

/** پروندهٔ کامل یک تسک + تایید یا رد آن — GET/PATCH /api/admin/tasks/{task} */
export default function AdminTaskDetailPage() {
  const { taskId = '' } = useParams()
  const toast = useToast()

  const loader = useCallback((signal: AbortSignal) => fetchAdminTask(taskId, signal), [taskId])
  const resource = useApiResource(loader, [taskId])

  useDocumentTitle(resource.data ? `${resource.data.task.title} — ادمین` : 'تسک — ادمین')

  const [employerOpen, setEmployerOpen] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')

  const approveMutation = useMutation(() => approveAdminTask(taskId), {
    onSuccess: (result) => {
      toast.success(result.message)
      setApproveOpen(false)
      // پاسخ فقط وضعیت جدید را دارد؛ خود تسک دوباره خوانده می‌شود
      resource.reload()
    },
    onError: (error) => toast.error(error.message),
  })

  const rejectMutation = useMutation(() => rejectAdminTask(taskId, reason.trim()), {
    onSuccess: (result) => {
      toast.success(result.message)
      setRejectOpen(false)
      setReason('')
      resource.reload()
    },
    onError: (error) => toast.error(error.message),
  })

  if (resource.loading) {
    return (
      <div>
        <PageHeader title="تسک" backTo="/admin/tasks" backLabel="همه تسک‌ها" />
        <SkeletonDetail />
      </div>
    )
  }

  if (resource.error || !resource.data) {
    return (
      <div>
        <PageHeader title="تسک" backTo="/admin/tasks" backLabel="همه تسک‌ها" />
        {resource.error ? <ErrorState error={resource.error} onRetry={resource.reload} /> : null}
      </div>
    )
  }

  const task = resource.data.task
  const employer = task.user
  const isPending = task.status === 'pending'
  const deadline = deadlineInfo(task.deadline)

  /** بک‌اند در RejectTaskRequest بین ۱۰ تا ۵۰۰۰ کاراکتر می‌خواهد */
  const reasonValue = reason.trim()
  const reasonValid = reasonValue.length >= 10 && reasonValue.length <= 5000

  return (
    <div className="space-y-4">
      <PageHeader
        title={task.title}
        description={`شناسه تسک: ${toPersianDigits(task.id)} · ثبت ${formatDateTime(
          task.created_at,
        )}`}
        backTo="/admin/tasks"
        backLabel="همه تسک‌ها"
      />

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge meta={metaOf(taskStatusMeta, task.status)} />
            {task.category ? (
              <span className="rounded-full bg-ink-100 px-2.5 py-1 text-[12px] font-semibold text-ink-600">
                {task.category.name}
              </span>
            ) : null}
          </div>

          <div className="border-t border-ink-100 pt-4">
            <h2 className="mb-1.5 text-[14px] font-bold text-ink-900">شرح تسک</h2>
            <p className="whitespace-pre-line text-[13.5px] leading-8 text-ink-600">
              {task.description}
            </p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="کارفرما" />
        <CardBody>
          <button
            type="button"
            onClick={() => setEmployerOpen(true)}
            disabled={!employer}
            className="-m-1 flex w-full items-center gap-3 rounded-xl p-1 text-start transition-colors enabled:hover:bg-ink-50 disabled:cursor-default"
          >
            <Avatar name={employer?.full_name} src={employer?.avatar} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-bold text-ink-800">
                {employer?.full_name ?? `کاربر ${toPersianDigits(task.user_id)}`}
              </p>
              <p className="truncate text-[11.5px] text-ink-400" dir="ltr">
                {employer?.mobile ? toPersianDigits(employer.mobile) : '—'}
              </p>
            </div>
            <IconUser className="size-4 shrink-0 text-ink-400" />
          </button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="مشخصات تسک" />
        <CardBody className="space-y-3">
          <DetailList>
            <DetailRow
              label="بودجه"
              icon={<IconMoney className="size-4" />}
              value={<span className="text-emerald-700">{formatToman(task.budget)}</span>}
            />
            <DetailRow
              label="مهلت تحویل"
              icon={<IconClock className="size-4" />}
              value={
                <span className={deadline.tone === 'danger' ? 'text-rose-600' : undefined}>
                  {formatDate(task.deadline)} · {deadline.label}
                </span>
              }
            />
            <DetailRow label="دسته‌بندی" value={task.category?.name ?? '—'} />
            <DetailRow
              label="وضعیت"
              value={<StatusBadge meta={metaOf(taskStatusMeta, task.status)} />}
            />
          </DetailList>

          <div className="border-t border-ink-100 pt-3">
            <h3 className="mb-2 text-[13px] font-bold text-ink-800">مهارت‌های موردنیاز</h3>
            <SkillChips skills={task.skills ?? []} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="فایل‌های تسک" description="پیوست‌هایی که کارفرما همراه تسک فرستاده است" />
        <CardBody>
          <StoredFileList files={task.files ?? []} empty="برای این تسک فایلی پیوست نشده است." />
        </CardBody>
      </Card>

      {task.rejection_reason ? (
        <Card>
          <CardHeader title="دلیل رد شدن" />
          <CardBody>
            <p className="whitespace-pre-line text-[13.5px] leading-8 text-ink-700">
              {task.rejection_reason}
            </p>
          </CardBody>
        </Card>
      ) : null}

      {isPending ? (
        <Card className="border-brand-200">
          <CardHeader
            title="تصمیم دربارهٔ انتشار"
            description="با تایید، تسک عمومی می‌شود و کاربران می‌توانند درخواست همکاری بدهند."
          />
          <CardBody className="space-y-3">
            <Alert tone="warning">
              نتیجهٔ بررسی برای کارفرما اعلان می‌سازد و بعد از ثبت، قابل تغییر نیست.
            </Alert>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="success" onClick={() => setApproveOpen(true)}>
                تایید و انتشار تسک
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setReason('')
                  rejectMutation.reset()
                  setRejectOpen(true)
                }}
              >
                رد کردن تسک
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Alert
          tone={task.status === 'rejected' ? 'danger' : 'neutral'}
          title="این تسک در انتظار بررسی نیست"
        >
          فقط تسک‌هایی که وضعیت «در انتظار تایید ادمین» دارند تایید یا رد می‌شوند. وضعیت فعلی:{' '}
          <b>{metaOf(taskStatusMeta, task.status).label}</b>
        </Alert>
      )}

      <UserProfileDialog
        open={employerOpen}
        onClose={() => setEmployerOpen(false)}
        user={employer ? { ...employer, id: employer.id ?? task.user_id } : null}
        title="پروفایل کارفرما"
      />

      <ConfirmDialog
        open={approveOpen}
        title="تایید و انتشار تسک"
        description="تسک عمومی می‌شود و کاربران می‌توانند برای آن درخواست همکاری بفرستند."
        confirmLabel="تایید و انتشار"
        tone="success"
        loading={approveMutation.loading}
        onConfirm={() => void approveMutation.run()}
        onCancel={() => {
          setApproveOpen(false)
          approveMutation.reset()
        }}
      >
        {approveMutation.error ? <ErrorState error={approveMutation.error} compact /> : null}
      </ConfirmDialog>

      <Modal
        open={rejectOpen}
        onClose={() => (rejectMutation.loading ? undefined : setRejectOpen(false))}
        title="رد کردن تسک"
        description="تسک منتشر نمی‌شود و دلیل شما برای کارفرما ارسال می‌شود."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setRejectOpen(false)}
              disabled={rejectMutation.loading}
            >
              انصراف
            </Button>
            <Button
              variant="danger"
              loading={rejectMutation.loading}
              disabled={!reasonValid}
              onClick={() => void rejectMutation.run()}
            >
              ثبت رد تسک
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {rejectMutation.error ? <ErrorState error={rejectMutation.error} compact /> : null}

          <Field
            label="دلیل رد کردن"
            required
            hint="بین ۱۰ تا ۵۰۰۰ کاراکتر — این متن برای کارفرما ارسال می‌شود"
            error={
              reason.length > 0 && !reasonValid
                ? 'دلیل رد کردن باید بین ۱۰ تا ۵۰۰۰ کاراکتر باشد.'
                : rejectMutation.error?.fieldError('rejection_reason')
            }
          >
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={6}
              maxLength={5000}
              invalid={reason.length > 0 && !reasonValid}
              placeholder="بنویسید چرا این تسک منتشر نمی‌شود و کارفرما چه چیزی را باید اصلاح کند…"
            />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
