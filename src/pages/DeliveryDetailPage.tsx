import { useCallback, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ApiError } from '@/api/client'
import { acceptDelivery, fetchDelivery, fetchProjectDeliveries, rejectDelivery } from '@/api/deliveries'
import { fetchProject } from '@/api/projects'
import { useAuth } from '@/auth/AuthContext'
import { DeliveryFileRow } from '@/components/domain/DeliveryFileRow'
import { DetailList, DetailRow } from '@/components/domain/DetailList'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Button, LinkButton } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Field } from '@/components/ui/Field'
import { IconClock, IconFile } from '@/components/ui/Icons'
import { Modal } from '@/components/ui/Modal'
import { SkeletonDetail } from '@/components/ui/Skeleton'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMutation } from '@/hooks/useMutation'
import { formatDateTime, toPersianDigits } from '@/lib/format'
import { deliveryStatusMeta, metaOf } from '@/lib/labels'

export default function DeliveryDetailPage() {
  useDocumentTitle('جزئیات تحویل')
  const { deliveryId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const { user } = useAuth()

  /**
   * پاسخ GET /api/deliveries/{id} هیچ ارجاعی به پروژه ندارد، بنابراین نقش کاربر و
   * وضعیت پرداخت از خودِ پروژه خوانده می‌شود. وقتی این صفحه از داخل پروژه باز شود،
   * شناسهٔ پروژه در query هست.
   */
  const projectIdParam = searchParams.get('project')

  const deliveryLoader = useCallback(
    (signal: AbortSignal) => fetchDelivery(deliveryId, signal),
    [deliveryId],
  )
  const delivery = useApiResource(deliveryLoader, [deliveryId])

  const projectLoader = useCallback(
    (signal: AbortSignal) => fetchProject(projectIdParam ?? '', signal),
    [projectIdParam],
  )
  const project = useApiResource(projectLoader, [projectIdParam], {
    enabled: Boolean(projectIdParam),
  })

  /**
   * `rejection_reason` فقط در فهرست تحویل‌های پروژه برمی‌گردد، نه در نمایش یک تحویل.
   * وقتی شناسهٔ پروژه را داریم، صفحهٔ اول همان فهرست را می‌گیریم تا دلیل رد شدن را
   * از داده واقعی نشان دهیم (نه از حدس).
   */
  const siblingsLoader = useCallback(
    (signal: AbortSignal) => fetchProjectDeliveries(projectIdParam ?? '', 1, signal),
    [projectIdParam],
  )
  const siblings = useApiResource(siblingsLoader, [projectIdParam], {
    enabled: Boolean(projectIdParam),
  })

  const [action, setAction] = useState<'accept' | 'reject' | null>(null)
  const [reason, setReason] = useState('')

  const acceptMutation = useMutation(() => acceptDelivery(deliveryId), {
    onSuccess: (result) => {
      toast.success(result.message)
      setAction(null)
      delivery.reload()
      if (projectIdParam) {
        project.reload()
        siblings.reload()
      }
    },
    onError: (error) => {
      toast.error(error.message)
      setAction(null)
    },
  })

  const rejectMutation = useMutation(() => rejectDelivery(deliveryId, reason.trim()), {
    onSuccess: (result) => {
      toast.success(result.message)
      setAction(null)
      setReason('')
      delivery.reload()
      if (projectIdParam) {
        project.reload()
        siblings.reload()
      }
    },
    onError: (error) => toast.error(error.message),
  })

  if (delivery.loading) {
    return (
      <div>
        <PageHeader title="جزئیات تحویل" backTo="/projects/active/worker" backLabel="پروژه‌ها" />
        <SkeletonDetail />
      </div>
    )
  }

  if (delivery.error || !delivery.data) {
    return (
      <div>
        <PageHeader title="جزئیات تحویل" backTo="/projects/active/worker" backLabel="پروژه‌ها" />
        <ErrorState
          error={delivery.error ?? new ApiError(404, 'تحویل موردنظر پیدا نشد.')}
          onRetry={delivery.reload}
        />
      </div>
    )
  }

  const data = delivery.data
  const meta = metaOf(deliveryStatusMeta, data.status)

  const projectData = project.data
  const isEmployer = Boolean(user && projectData?.application?.task?.user_id === user.id)
  const isWorker = Boolean(user && projectData?.application?.user_id === user.id)
  const isPaid = projectData?.payment_status === 'paid'

  /**
   * قانون بک‌اند (DeliveryController::download):
   * کارجو همیشه می‌تواند دانلود کند؛ کارفرما فقط بعد از paid شدن پروژه.
   * وقتی زمینهٔ پروژه در دسترس نیست، دکمه فعال می‌ماند و بک‌اند تصمیم می‌گیرد.
   */
  const downloadBlocked = Boolean(projectData) && isEmployer && !isPaid
  const canDownload = !downloadBlocked

  const canReview = isEmployer && data.status === 'pending' && projectData?.status === 'submitted'
  const reasonValid = reason.trim().length >= 10 && reason.trim().length <= 5000

  const rejectionReason =
    siblings.data?.data.find((item) => item.id === data.id)?.rejection_reason ?? null

  return (
    <div className="space-y-4">
      <PageHeader
        title={`تحویل ${toPersianDigits(data.id)}`}
        backTo={projectIdParam ? `/projects/${projectIdParam}` : '/projects/active/worker'}
        backLabel={projectIdParam ? 'بازگشت به پروژه' : 'پروژه‌ها'}
      />

      {!projectIdParam ? (
        <Alert tone="info">
          این صفحه را از داخل صفحهٔ پروژه باز کنید تا نقش شما، وضعیت پرداخت و دلیل رد شدن هم نمایش
          داده شود. دسترسی دانلود در هر حال توسط بک‌اند بررسی می‌شود.
        </Alert>
      ) : project.error ? (
        <ErrorState error={project.error} compact onRetry={project.reload} />
      ) : null}

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge meta={meta} />
            {isEmployer ? (
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11.5px] font-bold text-brand-700">
                نقش شما: کارفرما
              </span>
            ) : isWorker ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11.5px] font-bold text-emerald-700">
                نقش شما: کارجو
              </span>
            ) : null}
          </div>

          <div>
            <h2 className="mb-1.5 text-[14px] font-bold text-ink-900">توضیح تحویل</h2>
            <p className="whitespace-pre-line text-[13.5px] leading-8 text-ink-600">
              {data.description}
            </p>
          </div>

          <DetailList className="border-t border-ink-100 pt-2">
            <DetailRow
              label="زمان ثبت تحویل"
              icon={<IconClock className="size-4" />}
              value={formatDateTime(data.submitted_at)}
            />
            <DetailRow label="تعداد ویرایش" value={toPersianDigits(data.edit_count)} />
            <DetailRow
              label="تعداد فایل"
              icon={<IconFile className="size-4" />}
              value={toPersianDigits(data.files?.length ?? 0)}
            />
          </DetailList>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="فایل‌های تحویل"
          description="پیش‌نمایش و دانلود از endpoint امن بک‌اند انجام می‌شود."
        />
        <CardBody>
          {!data.files || data.files.length === 0 ? (
            <EmptyState title="فایلی ثبت نشده" description="این تحویل هیچ فایلی ندارد." />
          ) : (
            <ul className="space-y-2">
              {data.files.map((file) => (
                <DeliveryFileRow
                  key={file.id}
                  file={file}
                  deliveryId={data.id}
                  canDownload={canDownload}
                  downloadBlockedReason={
                    downloadBlocked
                      ? 'دانلود برای کارفرما فقط پس از پرداخت دستمزد پروژه فعال می‌شود.'
                      : undefined
                  }
                />
              ))}
            </ul>
          )}

          {downloadBlocked && projectIdParam ? (
            <Alert tone="warning" className="mt-3" title="ابتدا دستمزد را پرداخت کنید">
              طبق قانون بک‌اند، کارفرما تنها پس از <b>paid</b> شدن پروژه اجازهٔ دانلود دارد. پیش از آن
              فقط پیش‌نمایش فعال است.
              <div className="mt-3">
                <LinkButton to={`/projects/${projectIdParam}`} size="sm" variant="outline">
                  رفتن به صفحه پرداخت
                </LinkButton>
              </div>
            </Alert>
          ) : null}
        </CardBody>
      </Card>

      {data.status === 'rejected' ? (
        <Alert tone="danger" title="این تحویل رد شده است">
          کارجو باید نسخهٔ اصلاح‌شده را دوباره ثبت کند.
          {rejectionReason ? (
            <p className="mt-2 whitespace-pre-line text-[12.5px] leading-6">
              <b>دلیل رد شدن:</b> {rejectionReason}
            </p>
          ) : projectIdParam ? (
            <p className="mt-2 text-[12px] opacity-80">
              دلیل رد شدن در فهرست تحویل‌های همین پروژه نمایش داده می‌شود.
            </p>
          ) : null}
        </Alert>
      ) : null}

      {canReview ? (
        <Card className="border-brand-200">
          <CardHeader title="بررسی تحویل" description="تحویل را تایید یا با ذکر دلیل رد کنید." />
          <CardBody className="flex flex-wrap gap-2">
            <Button variant="success" onClick={() => setAction('accept')}>
              تایید تحویل
            </Button>
            <Button variant="danger" onClick={() => setAction('reject')}>
              رد تحویل
            </Button>
          </CardBody>
        </Card>
      ) : isEmployer && data.status === 'accepted' ? (
        <Alert tone="success" title="این تحویل تایید شده است">
          پروژه به وضعیت «تکمیل شده» رفته است؛ مرحلهٔ بعد پرداخت دستمزد است.
          {projectIdParam ? (
            <div className="mt-3">
              <LinkButton to={`/projects/${projectIdParam}`} size="sm" variant="outline">
                رفتن به پروژه
              </LinkButton>
            </div>
          ) : null}
        </Alert>
      ) : null}

      <ConfirmDialog
        open={action === 'accept'}
        title="تایید تحویل پروژه"
        description="با تایید این تحویل، پروژه تکمیل می‌شود و باید نسبت به پرداخت دستمزد اقدام کنید."
        confirmLabel="بله، تایید کن"
        tone="success"
        loading={acceptMutation.loading}
        onConfirm={() => void acceptMutation.run()}
        onCancel={() => setAction(null)}
      />

      <Modal
        open={action === 'reject'}
        onClose={() => setAction(null)}
        title="رد کردن تحویل"
        description="دلیل رد شدن یا اصلاحیهٔ لازم را بنویسید تا کارجو بتواند اصلاح کند."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setAction(null)}
              disabled={rejectMutation.loading}
            >
              انصراف
            </Button>
            <Button
              variant="danger"
              onClick={() => void rejectMutation.run()}
              loading={rejectMutation.loading}
              disabled={!reasonValid}
            >
              رد کردن تحویل
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {rejectMutation.error ? <ErrorState error={rejectMutation.error} compact /> : null}

          <Alert tone="warning">
            بک‌اند حداکثر <b>۳ بار</b> رد کردن را برای هر پروژه مجاز می‌داند؛ پس از آن باید شکایت ثبت
            شود.
          </Alert>

          <Field
            label="دلیل رد شدن"
            required
            hint="بین ۱۰ تا ۵۰۰۰ کاراکتر"
            error={
              reason.length > 0 && !reasonValid
                ? 'دلیل باید حداقل ۱۰ کاراکتر باشد.'
                : rejectMutation.error?.fieldError('rejection_reason')
            }
          >
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="مثلاً: بخش دوم تمرین حل نشده و فایل خروجی ناقص است."
              maxLength={5000}
              invalid={reason.length > 0 && !reasonValid}
            />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
