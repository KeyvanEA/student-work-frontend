import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '@/api/client'
import { createComplaint } from '@/api/complaints'
import { fetchProjectDeliveries, submitDelivery } from '@/api/deliveries'
import { fetchProject, payProject } from '@/api/projects'
import { submitReview } from '@/api/reviews'
import { useAuth } from '@/auth/AuthContext'
import { DeliveryListRow } from '@/components/domain/DeliveryListRow'
import { DetailList, DetailRow } from '@/components/domain/DetailList'
import { FlowStepper, PROJECT_FLOW_STEPS, projectFlowIndex } from '@/components/domain/FlowStepper'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { UserProfileDialog, type ProfilePeek } from '@/components/domain/UserProfileDialog'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Avatar } from '@/components/ui/Avatar'
import { Button, LinkButton } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Field } from '@/components/ui/Field'
import { FileInput } from '@/components/ui/FileInput'
import { IconClock, IconMoney, IconSmile, IconUpload, IconWallet, IconWarning } from '@/components/ui/Icons'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { SkeletonDetail, SkeletonList } from '@/components/ui/Skeleton'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMutation } from '@/hooks/useMutation'
import { deadlineInfo, formatDateTime, formatToman, toPersianDigits } from '@/lib/format'
import { metaOf, paymentStatusMeta, projectStatusMeta } from '@/lib/labels'

export default function ProjectDetailPage() {
  const { projectId = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()

  const loader = useCallback((signal: AbortSignal) => fetchProject(projectId, signal), [projectId])
  const project = useApiResource(loader, [projectId])

  const [deliveriesPage, setDeliveriesPage] = useState(1)
  const deliveriesLoader = useCallback(
    (signal: AbortSignal) => fetchProjectDeliveries(projectId, deliveriesPage, signal),
    [projectId, deliveriesPage],
  )
  const deliveries = useApiResource(deliveriesLoader, [projectId, deliveriesPage], {
    enabled: Boolean(project.data),
  })

  const task = project.data?.application?.task
  useDocumentTitle(task?.title ? `پروژه: ${task.title}` : 'پروژه')

  const [deliveryOpen, setDeliveryOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [complaintOpen, setComplaintOpen] = useState(false)
  const [peek, setPeek] = useState<{ user: ProfilePeek; title: string } | null>(null)
  const [reviewChoice, setReviewChoice] = useState<boolean | null>(null)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [complaintTitle, setComplaintTitle] = useState('')
  const [complaintBody, setComplaintBody] = useState('')
  const [complaintFiles, setComplaintFiles] = useState<File[]>([])

  const deliveryMutation = useMutation(
    () => submitDelivery(projectId, { description: description.trim(), files }),
    {
      onSuccess: (result) => {
        toast.success(result.message)
        setDeliveryOpen(false)
        setDescription('')
        setFiles([])
        project.reload()
        setDeliveriesPage(1)
        deliveries.reload()
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

  const complaintMutation = useMutation(
    () =>
      createComplaint(projectId, {
        title: complaintTitle.trim(),
        description: complaintBody.trim(),
        files: complaintFiles,
      }),
    {
      onSuccess: (result) => {
        toast.success(result.message)
        setComplaintOpen(false)
        setComplaintTitle('')
        setComplaintBody('')
        setComplaintFiles([])
        project.reload()
      },
      onError: (error) => toast.error(error.message),
    },
  )

  const reviewMutation = useMutation(
    (isSatisfied: boolean) => submitReview(projectId, isSatisfied),
    {
      onSuccess: (result) => {
        toast.success(result.message)
        setReviewChoice(null)
        setReviewSubmitted(true)
      },
      onError: (error) => {
        toast.error(error.message)
        setReviewChoice(null)
        // ۴۰۹ یعنی قبلاً ثبت شده — همان را در UI منعکس می‌کنیم
        if (error.status === 409) setReviewSubmitted(true)
      },
    },
  )

  if (project.loading) {
    return (
      <div>
        <PageHeader title="پروژه" backTo="/projects/active/worker" backLabel="پروژه‌ها" />
        <SkeletonDetail />
      </div>
    )
  }

  if (project.error || !project.data) {
    return (
      <div className="space-y-4">
        <PageHeader title="پروژه" backTo="/projects/active/worker" backLabel="پروژه‌ها" />
        <ErrorState
          error={project.error ?? new ApiError(404, 'پروژه پیدا نشد.')}
          onRetry={project.reload}
        />
        <Alert tone="info">
          فقط کارفرما و کارجوی همان پروژه اجازهٔ مشاهده دارند. فهرست پروژه‌های خودتان را از منوی
          «پروژه‌های فعال» یا «تاریخچه پروژه‌ها» ببینید.
        </Alert>
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
  const isPaid = data.payment_status === 'paid'

  const canSubmitDelivery =
    isWorker &&
    (data.status === 'in_progress' || data.status === 'revision_requested') &&
    !deadline.expired

  const canPay = isEmployer && data.status === 'completed' && !isPaid

  /**
   * قانون بک‌اند (DeliveryController::download):
   * کارجو همیشه می‌تواند دانلود کند؛ کارفرما فقط بعد از paid شدن پروژه.
   * بک‌اند همچنان منبع حقیقت است — این فقط بازتاب همان قانون در UI است.
   */
  const downloadBlocked = isEmployer && !isPaid
  const canDownload = !downloadBlocked

  /** شرط بک‌اند برای ثبت شکایت (ComplaintController::store) */
  const canComplain =
    (isWorker && data.status === 'revision_requested') ||
    (isEmployer && data.status === 'submitted')

  /** شرط بک‌اند برای ثبت رضایت (ReviewController::store) */
  const canReview = (isWorker || isEmployer) && data.status === 'completed' && isPaid

  const descriptionValid = description.trim().length >= 10
  const filesValid =
    files.length >= 1 && files.length <= 3 && files.every((file) => file.size <= 20 * 1024 * 1024)
  const complaintValid =
    complaintTitle.trim().length >= 5 && complaintBody.trim().length >= 10

  const deliveryItems = deliveries.data?.data ?? []

  return (
    <div className="space-y-4">
      <PageHeader
        title={task?.title ?? `پروژه ${toPersianDigits(data.id)}`}
        description={`شناسه پروژه: ${toPersianDigits(data.id)}`}
        backTo={`/projects/${isPaid || data.status === 'cancelled' ? 'history' : 'active'}/${
          isWorker ? 'worker' : 'employer'
        }`}
        backLabel="بازگشت به فهرست پروژه‌ها"
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

          {isPaid ? (
            <p className="text-[13px] text-ink-500">
              پروژه تکمیل و دستمزد پرداخت شده است؛ فایل‌های تحویل قابل دانلود هستند.
            </p>
          ) : statusMeta.hint ? (
            <p className="text-[13px] text-ink-500">{statusMeta.hint}</p>
          ) : null}

          {data.status === 'disputed' ? (
            <Alert tone="danger" title="این پروژه در حال داوری است">
              تا زمانی که ادمین دربارهٔ شکایت ثبت‌شده تصمیم نگیرد، ثبت تحویل یا تایید/رد تحویل ممکن
              نیست. نتیجهٔ بررسی از طریق اعلان به شما اطلاع داده می‌شود.
            </Alert>
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

      {/*
        طرفین پروژه — در هر وضعیتی (فعال، تحویل‌شده، نیازمند اصلاح، تکمیل، پرداخت‌شده،
        تاریخچه) هر دو طرف قابل مشاهده‌اند. بک‌اند هر دو کاربر را در پاسخ پروژه
        برمی‌گرداند: application.user (کارجو) و application.task.user (کارفرما).
      */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ProjectPartyCard
          title="کارفرما"
          caption="ثبت‌کنندهٔ تسک"
          person={employer}
          isYou={isEmployer}
          onOpen={(user) => setPeek({ user, title: 'پروفایل کارفرما' })}
        />
        <ProjectPartyCard
          title="کارجو"
          caption="انجام‌دهندهٔ کار"
          person={worker}
          isYou={isWorker}
          onOpen={(user) => setPeek({ user, title: 'پروفایل کارجو' })}
        />
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

      {/* تحویل‌های پروژه — GET /api/projects/{id}/deliveries */}
      <Card>
        <CardHeader
          title="تحویل‌های پروژه"
          description="فهرست کامل تحویل‌ها همراه با وضعیت، دلیل رد شدن و فایل‌ها"
          action={
            canSubmitDelivery ? (
              <Button
                size="sm"
                icon={<IconUpload className="size-4" />}
                onClick={() => setDeliveryOpen(true)}
              >
                ثبت تحویل
              </Button>
            ) : undefined
          }
        />
        <CardBody className="space-y-4">
          {deliveries.loading ? (
            <SkeletonList count={2} />
          ) : deliveries.error ? (
            <ErrorState error={deliveries.error} onRetry={deliveries.reload} />
          ) : deliveryItems.length === 0 ? (
            <EmptyState
              title="هنوز تحویلی ثبت نشده"
              description={
                isWorker
                  ? 'وقتی کار آماده شد، فایل‌های خروجی را با دکمهٔ «ثبت تحویل» ارسال کنید.'
                  : 'وقتی کارجو تحویل را ثبت کند، اینجا نمایش داده می‌شود.'
              }
              icon={<IconUpload className="size-6" />}
            />
          ) : (
            <>
              <ul className={deliveries.refreshing ? 'space-y-3 opacity-60' : 'space-y-3'}>
                {deliveryItems.map((delivery) => (
                  <DeliveryListRow
                    key={delivery.id}
                    delivery={delivery}
                    projectId={data.id}
                    canDownload={canDownload}
                    downloadBlockedReason={
                      downloadBlocked
                        ? 'دانلود برای کارفرما فقط پس از پرداخت دستمزد پروژه فعال می‌شود.'
                        : undefined
                    }
                    canReview={isEmployer}
                  />
                ))}
              </ul>

              {deliveries.data ? (
                <Pagination
                  currentPage={deliveries.data.current_page}
                  lastPage={deliveries.data.last_page}
                  total={deliveries.data.total}
                  disabled={deliveries.refreshing}
                  onChange={setDeliveriesPage}
                />
              ) : null}
            </>
          )}

          {isWorker && !canSubmitDelivery && data.status !== 'completed' ? (
            <Alert tone="info">
              {deadline.expired
                ? 'مهلت تحویل این پروژه به پایان رسیده و بک‌اند اجازهٔ ثبت تحویل جدید نمی‌دهد.'
                : 'در وضعیت فعلی پروژه امکان ثبت تحویل جدید وجود ندارد.'}
            </Alert>
          ) : null}

          {downloadBlocked && deliveryItems.length > 0 ? (
            <Alert tone="warning" title="دانلود پس از پرداخت فعال می‌شود">
              پیش از پرداخت دستمزد، فقط پیش‌نمایش فایل‌ها در دسترس است. پس از پرداخت، دانلود هم فعال
              می‌شود.
            </Alert>
          ) : null}
        </CardBody>
      </Card>

      {/* پرداخت */}
      {isEmployer ? (
        <Card className={canPay ? 'border-emerald-200' : undefined}>
          <CardHeader title="پرداخت دستمزد" description="پرداخت در این نسخه شبیه‌سازی‌شده است." />
          <CardBody className="space-y-3">
            {isPaid ? (
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
              </>
            )}
          </CardBody>
        </Card>
      ) : null}

      {/* ثبت رضایت */}
      {canReview ? (
        <Card className="border-brand-200">
          <CardHeader
            title="ارزیابی همکاری"
            description={`رضایت خود را از همکاری با ${
              isWorker ? 'کارفرما' : 'کارجو'
            } ثبت کنید. این کار فقط یک بار ممکن است.`}
          />
          <CardBody className="space-y-3">
            {reviewSubmitted ? (
              <Alert tone="success" title="ارزیابی شما ثبت شده است">
                نتیجه در صفحهٔ «میزان رضایت» طرف مقابل نمایش داده می‌شود.
                <div className="mt-3">
                  <LinkButton to="/satisfaction" size="sm" variant="outline">
                    میزان رضایت من
                  </LinkButton>
                </div>
              </Alert>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="success"
                  icon={<IconSmile className="size-[18px]" />}
                  onClick={() => setReviewChoice(true)}
                >
                  راضی بودم
                </Button>
                <Button variant="danger" onClick={() => setReviewChoice(false)}>
                  راضی نبودم
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      ) : null}

      {/* ثبت شکایت */}
      {canComplain ? (
        <Card className="border-amber-200">
          <CardHeader
            title="ثبت شکایت"
            description="اگر پروژه طبق توافق پیش نرفته است، بررسی ادمین را درخواست کنید."
          />
          <CardBody className="space-y-3">
            <Alert tone="warning">
              با ثبت شکایت، پروژه به وضعیت <b>در حال داوری</b> می‌رود و تا تصمیم ادمین، ثبت یا بررسی
              تحویل متوقف می‌شود.
            </Alert>
            <Button
              variant="secondary"
              icon={<IconWarning className="size-[18px]" />}
              onClick={() => setComplaintOpen(true)}
            >
              ثبت شکایت برای این پروژه
            </Button>
          </CardBody>
        </Card>
      ) : null}

      {/* مودال ثبت تحویل */}
      <Modal
        open={deliveryOpen}
        onClose={() => setDeliveryOpen(false)}
        title="ثبت تحویل پروژه"
        description="فایل‌های خروجی و توضیح کار انجام‌شده را ارسال کنید."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeliveryOpen(false)}
              disabled={deliveryMutation.loading}
            >
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

      {/* مودال ثبت شکایت */}
      <Modal
        open={complaintOpen}
        onClose={() => setComplaintOpen(false)}
        title="ثبت شکایت برای این پروژه"
        description="موضوع و شرح دقیق ماجرا را بنویسید تا ادمین بتواند بررسی کند."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setComplaintOpen(false)}
              disabled={complaintMutation.loading}
            >
              انصراف
            </Button>
            <Button
              variant="danger"
              onClick={() => void complaintMutation.run()}
              loading={complaintMutation.loading}
              disabled={!complaintValid}
            >
              ارسال شکایت
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {complaintMutation.error ? <ErrorState error={complaintMutation.error} compact /> : null}

          <Field
            label="موضوع"
            required
            hint="بین ۵ تا ۲۵۵ کاراکتر"
            error={complaintMutation.error?.fieldError('title')}
          >
            <Input
              value={complaintTitle}
              onChange={(event) => setComplaintTitle(event.target.value)}
              maxLength={255}
              placeholder="مثلاً: خروجی تحویل‌شده با شرح تسک مطابقت ندارد"
            />
          </Field>

          <Field
            label="شرح ماجرا"
            required
            hint="حداقل ۱۰ کاراکتر — هرچه دقیق‌تر، بررسی سریع‌تر"
            error={complaintMutation.error?.fieldError('description')}
          >
            <Textarea
              value={complaintBody}
              onChange={(event) => setComplaintBody(event.target.value)}
              rows={6}
              maxLength={5000}
              placeholder="آنچه اتفاق افتاده را به ترتیب زمانی توضیح دهید…"
            />
          </Field>

          <Field label="مدارک و مستندات" error={complaintMutation.error?.fieldError('files')}>
            <FileInput
              files={complaintFiles}
              onChange={setComplaintFiles}
              max={5}
              maxSizeMb={20}
              hint="حداکثر ۵ فایل، هرکدام تا ۲۰ مگابایت"
            />
          </Field>
        </div>
      </Modal>

      <UserProfileDialog
        open={peek !== null}
        onClose={() => setPeek(null)}
        user={peek?.user ?? null}
        title={peek?.title ?? 'پروفایل کاربر'}
      />

      <ConfirmDialog
        open={paymentOpen}
        title="تایید پرداخت دستمزد"
        description={`مبلغ ${formatToman(
          data.amount,
        )} به‌عنوان دستمزد این پروژه ثبت می‌شود. این عملیات قابل بازگشت نیست.`}
        confirmLabel="پرداخت می‌کنم"
        tone="success"
        loading={paymentMutation.loading}
        onConfirm={() => void paymentMutation.run()}
        onCancel={() => setPaymentOpen(false)}
      >
        <Alert tone="info">
          این یک پرداخت شبیه‌سازی‌شده است؛ هیچ درگاه بانکی واقعی فراخوانی نمی‌شود و بک‌اند فقط
          <code className="mx-1 font-mono text-[11px]">payment_status</code> را به <b>paid</b> تغییر
          می‌دهد.
        </Alert>
      </ConfirmDialog>

      <ConfirmDialog
        open={reviewChoice !== null}
        title={reviewChoice ? 'ثبت رضایت' : 'ثبت نارضایتی'}
        description={
          reviewChoice
            ? 'رضایت شما از این همکاری ثبت می‌شود. این کار برای هر پروژه فقط یک بار ممکن است.'
            : 'نارضایتی شما از این همکاری ثبت می‌شود. این کار برای هر پروژه فقط یک بار ممکن است.'
        }
        confirmLabel="ثبت می‌کنم"
        tone={reviewChoice ? 'success' : 'danger'}
        loading={reviewMutation.loading}
        onConfirm={() => reviewChoice !== null && void reviewMutation.run(reviewChoice)}
        onCancel={() => setReviewChoice(null)}
      />
    </div>
  )
}

/** کارت یک طرف پروژه؛ کلیک روی آن پروفایل همان کاربر را باز می‌کند. */
function ProjectPartyCard({
  title,
  caption,
  person,
  isYou,
  onOpen,
}: {
  title: string
  caption: string
  person?: { id?: number; full_name?: string | null; avatar?: string | null } | null
  isYou: boolean
  onOpen: (user: ProfilePeek) => void
}) {
  const canOpen = Boolean(person?.id)

  return (
    <Card>
      <CardHeader title={title} />
      <CardBody className="p-0">
        <button
          type="button"
          disabled={!canOpen}
          onClick={() => person?.id && onOpen({ ...person, id: person.id })}
          className="flex w-full items-center gap-3 p-4 text-start transition-colors enabled:hover:bg-ink-50 disabled:cursor-default sm:p-5"
        >
          <Avatar name={person?.full_name} src={person?.avatar} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-bold text-ink-800">
              {person?.full_name ?? '—'}
              {isYou ? <span className="ms-1.5 text-[11px] text-ink-400">(شما)</span> : null}
            </p>
            <p className="text-[11.5px] text-ink-400">
              {caption}
              {canOpen ? ' · مشاهده پروفایل' : ''}
            </p>
          </div>
        </button>
      </CardBody>
    </Card>
  )
}
