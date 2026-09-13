import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '@/api/client'
import { acceptApplication, fetchApplication, rejectApplication } from '@/api/applications'
import { useAuth } from '@/auth/AuthContext'
import { DetailList, DetailRow } from '@/components/domain/DetailList'
import { SkillChips } from '@/components/domain/SkillChips'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Avatar } from '@/components/ui/Avatar'
import { Button, LinkButton } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ErrorState } from '@/components/ui/ErrorState'
import { IconClock, IconFile, IconTasks } from '@/components/ui/Icons'
import { SkeletonDetail } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMutation } from '@/hooks/useMutation'
import { formatDateTime, toPersianDigits } from '@/lib/format'
import { applicationStatusMeta, metaOf } from '@/lib/labels'

export default function ApplicationDetailPage() {
  useDocumentTitle('جزئیات درخواست همکاری')
  const { applicationId = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()

  const loader = useCallback(
    (signal: AbortSignal) => fetchApplication(applicationId, signal),
    [applicationId],
  )
  const application = useApiResource(loader, [applicationId])

  const [action, setAction] = useState<'accept' | 'reject' | null>(null)

  const acceptMutation = useMutation(() => acceptApplication(applicationId), {
    onSuccess: (result) => {
      toast.success(result.message)
      setAction(null)
      // بک‌اند پروژهٔ تازه‌ساخته‌شده را برمی‌گرداند؛ مستقیماً واردش می‌شویم.
      if (result.project?.id) {
        navigate(`/projects/${result.project.id}`, { replace: true })
        return
      }
      application.reload()
    },
    onError: (error) => {
      toast.error(error.message)
      setAction(null)
    },
  })

  const rejectMutation = useMutation(() => rejectApplication(applicationId), {
    onSuccess: (result) => {
      toast.success(result.message)
      setAction(null)
      application.reload()
    },
    onError: (error) => {
      toast.error(error.message)
      setAction(null)
    },
  })

  if (application.loading) {
    return (
      <div>
        <PageHeader title="جزئیات درخواست همکاری" />
        <SkeletonDetail />
      </div>
    )
  }

  if (application.error || !application.data) {
    const error = application.error ?? new ApiError(404, 'درخواست همکاری پیدا نشد.')
    return (
      <div>
        <PageHeader title="جزئیات درخواست همکاری" backTo="/applications/sent" backLabel="درخواست‌های همکاری" />
        <ErrorState error={error} onRetry={application.reload} />
      </div>
    )
  }

  const data = application.data
  const meta = metaOf(applicationStatusMeta, data.status)
  const pending = data.status === 'pending'
  const isTaskOwner = Boolean(user && data.task?.user_id === user.id)
  const isApplicant = Boolean(user && data.user_id === user.id)

  return (
    <div className="space-y-4">
      <PageHeader
        title="جزئیات درخواست همکاری"
        backTo={
          isTaskOwner && data.task_id
            ? `/tasks/${data.task_id}/applications`
            : isApplicant
              ? '/applications/sent'
              : '/applications/received'
        }
        backLabel="بازگشت به درخواست‌ها"
      />

      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-start gap-3">
            <Avatar name={data.user?.full_name} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[16px] font-bold text-ink-900">
                  {data.user?.full_name ?? `کاربر ${toPersianDigits(data.user_id)}`}
                </h2>
                <StatusBadge meta={meta} />
              </div>
              <p className="mt-1 text-[11.5px] text-ink-400">
                شناسه درخواست {toPersianDigits(data.id)} · ارسال {formatDateTime(data.created_at)}
              </p>
              {data.user?.skills && data.user.skills.length > 0 ? (
                <div className="mt-3">
                  <SkillChips skills={data.user.skills} />
                </div>
              ) : null}
            </div>
          </div>

          <div className="border-t border-ink-100 pt-4">
            <h3 className="mb-1.5 text-[14px] font-bold text-ink-900">متن درخواست</h3>
            <p className="whitespace-pre-line text-[13.5px] leading-8 text-ink-600">
              {data.description}
            </p>
          </div>
        </CardBody>
      </Card>

      {data.files && data.files.length > 0 ? (
        <Card>
          <CardHeader
            title="نمونه‌کارها و پیوست‌ها"
            description="نشانی فایل‌ها را خود بک‌اند در پاسخ می‌دهد."
          />
          <CardBody className="space-y-2">
            {data.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 p-3"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <IconFile className="size-5 shrink-0 text-ink-400" />
                  <span className="truncate text-[13px] text-ink-700" dir="ltr">
                    {file.file_path.split('/').pop()}
                  </span>
                </span>
                {file.download_url ? (
                  <a
                    href={file.download_url}
                    download
                    className="shrink-0 text-[12.5px] font-semibold text-brand-600 hover:underline"
                  >
                    دانلود
                  </a>
                ) : (
                  <span className="shrink-0 text-[12px] text-ink-400">نشانی فایل موجود نیست</span>
                )}
              </div>
            ))}
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardBody>
          <DetailList>
            <DetailRow
              label="تسک مرتبط"
              icon={<IconTasks className="size-4" />}
              value={
                data.task_id ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/tasks/${data.task_id}`)}
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    {data.task?.title ?? `مشاهده تسک ${toPersianDigits(data.task_id)}`}
                  </button>
                ) : (
                  '—'
                )
              }
            />
            <DetailRow
              label="وضعیت"
              icon={<IconClock className="size-4" />}
              value={<StatusBadge meta={meta} />}
            />
          </DetailList>
        </CardBody>
      </Card>

      {pending && isTaskOwner ? (
        <Card className="border-brand-200">
          <CardBody className="flex flex-wrap gap-2">
            <Button variant="success" onClick={() => setAction('accept')}>
              پذیرش و شروع پروژه
            </Button>
            <Button variant="secondary" onClick={() => setAction('reject')}>
              رد کردن درخواست
            </Button>
          </CardBody>
        </Card>
      ) : data.status === 'accepted' ? (
        <Alert tone="success" title="این درخواست پذیرفته شده است">
          پروژهٔ مربوط به این درخواست ساخته شده است. آن را در فهرست پروژه‌های فعال خود ببینید.
          {/* پاسخ نمایش درخواست، شناسهٔ پروژه را برنمی‌گرداند؛ بنابراین به‌جای حدس زدن،
              کاربر را به فهرست واقعی پروژه‌ها می‌فرستیم. */}
          <div className="mt-3 flex flex-wrap gap-2">
            <LinkButton
              to={isTaskOwner ? '/projects/active/employer' : '/projects/active/worker'}
              size="sm"
              variant="outline"
            >
              مشاهده پروژه
            </LinkButton>
          </div>
        </Alert>
      ) : null}

      <ConfirmDialog
        open={action === 'accept'}
        title="پذیرش درخواست همکاری"
        description="با پذیرش این درخواست، پروژه ساخته می‌شود، سایر درخواست‌های این تسک رد می‌شوند و مستقیماً وارد صفحهٔ پروژه می‌شوید."
        confirmLabel="بله، بپذیر"
        tone="success"
        loading={acceptMutation.loading}
        onConfirm={() => void acceptMutation.run()}
        onCancel={() => setAction(null)}
      />

      <ConfirmDialog
        open={action === 'reject'}
        title="رد کردن درخواست همکاری"
        description="این درخواست رد می‌شود و قابل بازگشت نیست."
        confirmLabel="بله، رد کن"
        tone="danger"
        loading={rejectMutation.loading}
        onConfirm={() => void rejectMutation.run()}
        onCancel={() => setAction(null)}
      />
    </div>
  )
}
