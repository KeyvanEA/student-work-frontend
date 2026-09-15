import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '@/api/client'
import { cn } from '@/lib/cn'
import { applyToTask } from '@/api/applications'
import { cancelTask, fetchTask } from '@/api/tasks'
import { useAuth } from '@/auth/AuthContext'
import { DetailList, DetailRow } from '@/components/domain/DetailList'
import { SkillChips } from '@/components/domain/SkillChips'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { StoredFileList } from '@/components/domain/StoredFileRow'
import { UserProfileDialog } from '@/components/domain/UserProfileDialog'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Avatar } from '@/components/ui/Avatar'
import { Button, LinkButton } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ErrorState } from '@/components/ui/ErrorState'
import { Field } from '@/components/ui/Field'
import { FileInput } from '@/components/ui/FileInput'
import { IconClock, IconMoney, IconTasks, IconUser } from '@/components/ui/Icons'
import { Modal } from '@/components/ui/Modal'
import { SkeletonDetail } from '@/components/ui/Skeleton'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMutation } from '@/hooks/useMutation'
import { deadlineInfo, formatDate, formatToman, toPersianDigits } from '@/lib/format'
import { metaOf, taskStatusMeta } from '@/lib/labels'

export default function TaskDetailPage() {
  const { taskId = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user, isAuthenticated } = useAuth()

  const loader = useCallback((signal: AbortSignal) => fetchTask(taskId, signal), [taskId])
  const task = useApiResource(loader, [taskId])

  useDocumentTitle(task.data?.title)

  const [applyOpen, setApplyOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [employerOpen, setEmployerOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const applyMutation = useMutation(
    () => applyToTask(taskId, { description: description.trim(), files }),
    {
      onSuccess: (result) => {
        toast.success(result.message)
        setApplyOpen(false)
        setDescription('')
        setFiles([])
        task.reload()
        navigate('/applications/sent')
      },
    },
  )

  const cancelMutation = useMutation(() => cancelTask(taskId), {
    onSuccess: (result) => {
      toast.success(result.message)
      setCancelOpen(false)
      task.reload()
    },
    onError: (error) => {
      toast.error(error.message)
      setCancelOpen(false)
    },
  })

  if (task.loading) {
    return (
      <div>
        <PageHeader title="جزئیات تسک" backTo="/tasks" backLabel="همه تسک‌ها" />
        <SkeletonDetail />
      </div>
    )
  }

  if (task.error || !task.data) {
    return (
      <div>
        <PageHeader title="جزئیات تسک" backTo="/tasks" backLabel="همه تسک‌ها" />
        <ErrorState
          error={task.error ?? new ApiError(404, 'تسک موردنظر پیدا نشد.')}
          onRetry={task.reload}
        />
      </div>
    )
  }

  const data = task.data
  const isOwner = Boolean(user && user.id === data.user_id)
  const isOpen = data.status === 'open'
  const deadline = deadlineInfo(data.deadline)
  const canApply = !isOwner && isAuthenticated && isOpen
  const descriptionValid = description.trim().length >= 10
  const filesValid = files.every((file) => file.size <= 10 * 1024 * 1024)

  return (
    <div className="space-y-4">
      <PageHeader title={data.title} backTo="/tasks" backLabel="همه تسک‌ها" />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge meta={metaOf(taskStatusMeta, data.status)} />
        {data.category ? (
          <span className="rounded-full bg-ink-100 px-2.5 py-1 text-[12px] font-semibold text-ink-600">
            {data.category.name}
          </span>
        ) : null}
        <span className="text-[11.5px] text-ink-400">شناسه تسک: {toPersianDigits(data.id)}</span>
      </div>

      {!isOpen ? (
        <Alert tone={data.status === 'cancelled' ? 'danger' : 'info'}>
          {metaOf(taskStatusMeta, data.status).hint ??
            'این تسک دیگر پذیرای درخواست همکاری جدید نیست.'}
        </Alert>
      ) : null}

      <Card>
        <CardBody className="space-y-4">
          {/* کارفرما — پروفایل او از همان داده‌ای که بک‌اند در پاسخ تسک داده باز می‌شود */}
          <button
            type="button"
            onClick={() => setEmployerOpen(true)}
            disabled={!data.user}
            className="-m-1 flex w-full items-center gap-3 rounded-xl border-b border-ink-100 p-1 pb-4 text-start transition-colors enabled:hover:bg-ink-50 disabled:cursor-default"
          >
            <Avatar name={data.user?.full_name} src={data.user?.avatar} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-bold text-ink-900">
                {data.user?.full_name ?? 'کارفرما'}
              </p>
              <p className="text-[11.5px] text-ink-400">
                کارفرمای این تسک{data.user ? ' · مشاهده پروفایل' : ''}
              </p>
            </div>
            {data.user ? <IconUser className="size-4 shrink-0 text-ink-400" /> : null}
          </button>

          <div>
            <h2 className="mb-1.5 text-[14px] font-bold text-ink-900">شرح کار</h2>
            <p className="whitespace-pre-line text-[13.5px] leading-8 text-ink-600">
              {data.description}
            </p>
          </div>

          {data.skills && data.skills.length > 0 ? (
            <div>
              <h2 className="mb-2 text-[14px] font-bold text-ink-900">مهارت‌های موردنیاز</h2>
              <SkillChips skills={data.skills} />
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <DetailList>
            <DetailRow
              label="بودجه"
              icon={<IconMoney className="size-4" />}
              value={<span className="text-emerald-700">{formatToman(data.budget)}</span>}
            />
            <DetailRow
              label="مهلت انجام"
              icon={<IconClock className="size-4" />}
              value={
                <span className={deadline.tone === 'danger' ? 'text-rose-600' : undefined}>
                  {formatDate(data.deadline)} · {deadline.label}
                </span>
              }
            />
            <DetailRow
              label="دسته‌بندی"
              icon={<IconTasks className="size-4" />}
              value={data.category?.name ?? '—'}
            />
            <DetailRow
              label="تاریخ ثبت"
              icon={<IconUser className="size-4" />}
              value={formatDate(data.created_at)}
            />
          </DetailList>
        </CardBody>
      </Card>

      {data.files && data.files.length > 0 ? (
        <Card>
          <CardHeader
            title="فایل‌های پیوست تسک"
            description="نشانی کامل فایل را خود بک‌اند در پاسخ می‌دهد."
          />
          <CardBody>
            <StoredFileList files={data.files} />
          </CardBody>
        </Card>
      ) : null}

      {/* اقدامات — فقط وقتی دکمهٔ اصلی وجود دارد روی موبایل چسبان می‌شود */}
      <div className={cn(canApply && 'sticky bottom-20 z-10 lg:static')}>
        <Card className="border-brand-200">
          <CardBody className="flex flex-wrap items-center gap-2">
            {isOwner ? (
              <>
                <LinkButton to={`/tasks/${data.id}/applications`} size="md">
                  درخواست‌های همکاری
                </LinkButton>
                {isOpen ? (
                  <Button variant="secondary" onClick={() => setCancelOpen(true)}>
                    لغو تسک
                  </Button>
                ) : null}
              </>
            ) : !isAuthenticated ? (
              <>
                <p className="me-auto text-[13px] text-ink-500">
                  برای ارسال درخواست همکاری وارد شوید.
                </p>
                <Button onClick={() => navigate('/login', { state: { from: `/tasks/${data.id}` } })}>
                  ورود
                </Button>
              </>
            ) : isOpen ? (
              <Button block onClick={() => setApplyOpen(true)}>
                ارسال درخواست همکاری
              </Button>
            ) : (
              <p className="text-[13px] text-ink-500">
                امکان ارسال درخواست همکاری برای این تسک وجود ندارد.
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* فرم درخواست همکاری */}
      <Modal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        title="ارسال درخواست همکاری"
        description="توضیح دهید چرا برای این کار مناسب هستید."
        footer={
          <>
            <Button variant="secondary" onClick={() => setApplyOpen(false)} disabled={applyMutation.loading}>
              انصراف
            </Button>
            <Button
              onClick={() => void applyMutation.run()}
              loading={applyMutation.loading}
              disabled={!descriptionValid || !filesValid}
            >
              ارسال درخواست
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {applyMutation.error ? <ErrorState error={applyMutation.error} compact /> : null}

          <Field
            label="متن درخواست"
            required
            hint="حداقل ۱۰ و حداکثر ۵۰۰۰ کاراکتر"
            error={
              description.length > 0 && !descriptionValid
                ? 'متن درخواست باید حداقل ۱۰ کاراکتر باشد.'
                : applyMutation.error?.fieldError('description')
            }
          >
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="تجربه و توانایی خود را برای انجام این کار بنویسید…"
              maxLength={5000}
              invalid={description.length > 0 && !descriptionValid}
            />
          </Field>

          <Field label="فایل‌های پیوست (اختیاری)" error={applyMutation.error?.fieldError('files')}>
            <FileInput files={files} onChange={setFiles} max={3} maxSizeMb={10} />
          </Field>
        </div>
      </Modal>

      <UserProfileDialog
        open={employerOpen}
        onClose={() => setEmployerOpen(false)}
        user={data.user ? { ...data.user, id: data.user.id ?? data.user_id } : null}
        title="پروفایل کارفرما"
      />

      <ConfirmDialog
        open={cancelOpen}
        title="لغو تسک"
        description="با لغو تسک، دیگر درخواست همکاری جدیدی دریافت نمی‌کنید. این کار قابل بازگشت نیست."
        confirmLabel="بله، لغو کن"
        tone="danger"
        loading={cancelMutation.loading}
        onConfirm={() => void cancelMutation.run()}
        onCancel={() => setCancelOpen(false)}
      />
    </div>
  )
}
