import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '@/api/client'
import { submitDelivery } from '@/api/deliveries'
import { fetchProject, payProject } from '@/api/projects'
import { useAuth } from '@/auth/AuthContext'
import { DetailList, DetailRow } from '@/components/domain/DetailList'
import { FlowStepper, PROJECT_FLOW_STEPS, projectFlowIndex } from '@/components/domain/FlowStepper'
import { IdLookupCard } from '@/components/domain/IdLookupCard'
import { RecentEntries } from '@/components/domain/RecentEntries'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ErrorState } from '@/components/ui/ErrorState'
import { Field } from '@/components/ui/Field'
import { FileInput } from '@/components/ui/FileInput'
import { IconClock, IconMoney, IconUpload, IconWallet } from '@/components/ui/Icons'
import { Modal } from '@/components/ui/Modal'
import { SkeletonDetail } from '@/components/ui/Skeleton'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMutation } from '@/hooks/useMutation'
import { deadlineInfo, formatDateTime, formatToman, toPersianDigits } from '@/lib/format'
import { metaOf, paymentStatusMeta, projectStatusMeta } from '@/lib/labels'
import { rememberEntry } from '@/lib/recent'

export default function ProjectDetailPage() {
  const { projectId = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()

  const loader = useCallback((signal: AbortSignal) => fetchProject(projectId, signal), [projectId])
  const project = useApiResource(loader, [projectId])

  const task = project.data?.application?.task
  useDocumentTitle(task?.title ? `پروژه: ${task.title}` : 'پروژه')

  const [deliveryOpen, setDeliveryOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])

  useEffect(() => {
    if (project.data) {
      rememberEntry({
        id: project.data.id,
        kind: 'project',
        title: project.data.application?.task?.title ?? `پروژه #${project.data.id}`,
        subtitle: metaOf(projectStatusMeta, project.data.status).label,
      })
    }
  }, [project.data])

  const deliveryMutation = useMutation(
    () => submitDelivery(projectId, { description: description.trim(), files }),
    {
      onSuccess: (result) => {
        toast.success(result.message)
        setDeliveryOpen(false)
        setDescription('')
        setFiles([])
        project.reload()
      },
      onError: (error) => toast.error(error.message),
    },
  )

  const paymentMutation = useMutation(() => payProject(projectId), {
    onSuccess: (result) => {
      toast.success(result.message)
      setPaymentOpen(false)
      project.reload()
    },
    onError: (error) => {
      toast.error(error.message)
      setPaymentOpen(false)
    },
  })

  if (project.loading) {
    return (
      <div>
        <PageHeader title="پروژه" backTo="/projects" backLabel="همه پروژه‌ها" />
        <SkeletonDetail />
      </div>
    )
  }

  if (project.error || !project.data) {
    return (
      <div className="space-y-4">
        <PageHeader title="پروژه" backTo="/projects" backLabel="همه پروژه‌ها" />
        <ErrorState
          error={project.error ?? new ApiError(404, 'پروژه پیدا نشد.')}
          onRetry={project.reload}
        />
        <IdLookupCard
          title="شناسه دیگری را امتحان کنید"
          description="فقط کارفرما و کارجوی همان پروژه اجازهٔ مشاهده دارند."
          label="شناسه پروژه"
          placeholder="مثلاً ۱"
          basePath="/projects"
        />
      </div>
    )
  }

  const data = project.data
  const application = data.application
  const worker = application?.user
  const employer = application?.task?.user

  const isEmployer = Boolean(user && application?.task?.user_id === user.id)
  const isWorker = Boolean(user && application?.user_id === user.id)

  const statusMeta = metaOf(projectStatusMeta, data.status)
  const paymentMeta = metaOf(paymentStatusMeta, data.payment_status)
  const deadline = deadlineInfo(data.deadline)

  const canSubmitDelivery =
    isWorker && (data.status === 'in_progress' || data.status === 'revision_requested') && !deadline.expired
  const canPay = isEmployer && data.status === 'completed' && data.payment_status === 'unpaid'

  const descriptionValid = description.trim().length >= 10
  const filesValid = files.length >= 1 && files.length <= 3 && files.every((f) => f.size <= 20 * 1024 * 1024)

  return (
    <div className="space-y-4">
      <PageHeader
        title={task?.title ?? `پروژه ${toPersianDigits(data.id)}`}
        description={`شناسه پروژه: ${toPersianDigits(data.id)}`}
        backTo="/projects"
        backLabel="همه پروژه‌ها"
      />

      <Card>
        <CardBody className="space-y-4">
          <FlowStepper
            steps={PROJECT_FLOW_STEPS}
            currentIndex={projectFlowIndex(data.status, data.payment_status)}
            failedIndex={data.status === 'revision_requested' ? 1 : undefined}
          />

          <div className="flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
            <StatusBadge meta={statusMeta} />
            <StatusBadge meta={paymentMeta} />
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

          {data.payment_status === 'paid' ? (
            <p className="text-[13px] text-ink-500">
              پروژه تکمیل و دستمزد پرداخت شده است؛ فایل‌های تحویل قابل دانلود هستند.
            </p>
          ) : statusMeta.hint ? (
            <p className="text-[13px] text-ink-500">{statusMeta.hint}</p>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <DetailList>
            <DetailRow
              label="مبلغ پروژه"
              icon={<IconMoney className="size-4" />}
              value={<span className="text-emerald-700">{formatToman(data.amount)}</span>}
            />
            <DetailRow
              label="مهلت تحویل"
              icon={<IconClock className="size-4" />}
              value={
                <span className={deadline.tone === 'danger' ? 'text-rose-600' : undefined}>
                  {formatDateTime(data.deadline)} · {deadline.label}
                </span>
              }
            />
            <DetailRow label="شروع پروژه" value={formatDateTime(data.started_at)} />
            <DetailRow
              label="تکمیل پروژه"
              value={data.completed_at ? formatDateTime(data.completed_at) : 'هنوز تکمیل نشده'}
            />
            <DetailRow
              label="وضعیت پرداخت"
              icon={<IconWallet className="size-4" />}
              value={<StatusBadge meta={paymentMeta} />}
            />
          </DetailList>
        </CardBody>
      </Card>

      {/* طرفین پروژه */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader title="کارفرما" />
          <CardBody className="flex items-center gap-3">
            <Avatar name={employer?.full_name} size="md" />
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-bold text-ink-800">
                {employer?.full_name ?? '—'}
              </p>
              <p className="text-[11.5px] text-ink-400">ثبت‌کنندهٔ تسک</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="کارجو" />
          <CardBody className="flex items-center gap-3">
            <Avatar name={worker?.full_name} size="md" />
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-bold text-ink-800">
                {worker?.full_name ?? '—'}
              </p>
              <p className="text-[11.5px] text-ink-400">انجام‌دهندهٔ کار</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* تسک مرتبط */}
      {task ? (
        <Card>
          <CardHeader
            title="تسک مرتبط"
            description={task.category?.name}
            action={
              task.id ? (
                <Button size="sm" variant="ghost" onClick={() => navigate(`/tasks/${task.id}`)}>
                  مشاهده تسک
                </Button>
              ) : undefined
            }
          />
          <CardBody className="space-y-3">
            <p className="text-[14px] font-bold text-ink-900">{task.title}</p>
            {task.description ? (
              <p className="whitespace-pre-line text-[13px] leading-8 text-ink-600">
                {task.description}
              </p>
            ) : null}
          </CardBody>
        </Card>
      ) : null}

      {/* متن درخواست همکاری */}
      {application?.description ? (
        <Card>
          <CardHeader title="درخواست همکاری پذیرفته‌شده" />
          <CardBody>
            <p className="whitespace-pre-line text-[13px] leading-8 text-ink-600">
              {application.description}
            </p>
          </CardBody>
        </Card>
      ) : null}

      {/* تحویل‌ها */}
      <Card>
        <CardHeader
          title="تحویل‌های پروژه"
          description="مشاهده جزئیات، پیش‌نمایش و دانلود فایل‌ها"
          action={
            canSubmitDelivery ? (
              <Button size="sm" icon={<IconUpload className="size-4" />} onClick={() => setDeliveryOpen(true)}>
                ثبت تحویل
              </Button>
            ) : undefined
          }
        />
        <CardBody className="space-y-4">
          <Alert tone="warning">
            بک‌اند endpoint ای برای <b>فهرست تحویل‌های یک پروژه</b> ندارد (فقط{' '}
            <code className="font-mono text-[11px]">GET /api/deliveries/{'{'}id{'}'}</code>). شناسهٔ
            تحویل را وارد کنید یا از فهرست زیر که در همین مرورگر ثبت شده استفاده کنید.
            {/* TODO(backend): GET /api/projects/{id}/deliveries و برگرداندن delivery id در پاسخ ثبت تحویل */}
          </Alert>

          <IdLookupCard
            title="باز کردن تحویل با شناسه"
            description="اطلاعات تحویل از API واقعی خوانده می‌شود."
            label="شناسه تحویل"
            placeholder="مثلاً ۱"
            basePath="/deliveries"
            queryString={`project=${data.id}`}
          />

          <RecentEntries
            kind="delivery"
            emptyTitle="هنوز تحویلی باز نکرده‌اید"
            emptyDescription="پس از ثبت تحویل، شناسهٔ آن را در کادر بالا وارد کنید."
          />
        </CardBody>
      </Card>

      {/* پرداخت */}
      {isEmployer ? (
        <Card className={canPay ? 'border-emerald-200' : undefined}>
          <CardHeader title="پرداخت دستمزد" description="پرداخت در این نسخه شبیه‌سازی‌شده است." />
          <CardBody className="space-y-3">
            {data.payment_status === 'paid' ? (
              <Alert tone="success" title="دستمزد پرداخت شده است">
                اکنون می‌توانید فایل‌های تحویل را دانلود کنید.
              </Alert>
            ) : data.status !== 'completed' ? (
              <Alert tone="info">
                پرداخت فقط زمانی فعال می‌شود که تحویل کارجو را تایید کرده باشید و پروژه به وضعیت
                «تکمیل شده» برسد.
              </Alert>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
                  <span className="text-[13px] font-semibold text-emerald-800">مبلغ قابل پرداخت</span>
                  <span className="text-[15px] font-extrabold text-emerald-800">
                    {formatToman(data.amount)}
                  </span>
                </div>
                <Button
                  variant="success"
                  block
                  icon={<IconWallet className="size-[18px]" />}
                  onClick={() => setPaymentOpen(true)}
                >
                  پرداخت دستمزد
                </Button>
                {/* TODO: درگاه پرداخت واقعی وجود ندارد؛ بک‌اند فقط payment_status را paid می‌کند. */}
              </>
            )}
          </CardBody>
        </Card>
      ) : null}

      {isWorker && !canSubmitDelivery && data.status !== 'completed' ? (
        <Alert tone="info">
          {deadline.expired
            ? 'مهلت تحویل این پروژه به پایان رسیده و بک‌اند اجازهٔ ثبت تحویل جدید نمی‌دهد.'
            : 'در وضعیت فعلی پروژه امکان ثبت تحویل جدید وجود ندارد.'}
        </Alert>
      ) : null}

      {/* مودال ثبت تحویل */}
      <Modal
        open={deliveryOpen}
        onClose={() => setDeliveryOpen(false)}
        title="ثبت تحویل پروژه"
        description="فایل‌های خروجی و توضیح کار انجام‌شده را ارسال کنید."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeliveryOpen(false)} disabled={deliveryMutation.loading}>
              انصراف
            </Button>
            <Button
              onClick={() => void deliveryMutation.run()}
              loading={deliveryMutation.loading}
              disabled={!descriptionValid || !filesValid}
            >
              ارسال تحویل
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {deliveryMutation.error ? <ErrorState error={deliveryMutation.error} compact /> : null}

          <Field
            label="توضیح تحویل"
            required
            hint="حداقل ۱۰ کاراکتر"
            error={
              description.length > 0 && !descriptionValid
                ? 'توضیح باید حداقل ۱۰ کاراکتر باشد.'
                : deliveryMutation.error?.fieldError('description')
            }
          >
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="چه کاری انجام شده، چه فایلی ارسال شده و چه نکاتی لازم است بدانید…"
              maxLength={5000}
              invalid={description.length > 0 && !descriptionValid}
            />
          </Field>

          <Field
            label="فایل‌های خروجی"
            required
            error={
              files.length === 0
                ? 'حداقل یک فایل الزامی است.'
                : deliveryMutation.error?.fieldError('files')
            }
          >
            <FileInput
              files={files}
              onChange={setFiles}
              max={3}
              maxSizeMb={20}
              hint="حداکثر ۳ فایل، هرکدام تا ۲۰ مگابایت"
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={paymentOpen}
        title="تایید پرداخت دستمزد"
        description={`مبلغ ${formatToman(data.amount)} به‌عنوان دستمزد این پروژه ثبت می‌شود. این عملیات قابل بازگشت نیست.`}
        confirmLabel="پرداخت می‌کنم"
        tone="success"
        loading={paymentMutation.loading}
        onConfirm={() => void paymentMutation.run()}
        onCancel={() => setPaymentOpen(false)}
      >
        <Alert tone="info">
          این یک پرداخت شبیه‌سازی‌شده است؛ هیچ درگاه بانکی واقعی فراخوانی نمی‌شود و بک‌اند فقط
          <code className="mx-1 font-mono text-[11px]">payment_status</code> را به{' '}
          <b>paid</b> تغییر می‌دهد.
        </Alert>
      </ConfirmDialog>
    </div>
  )
}
