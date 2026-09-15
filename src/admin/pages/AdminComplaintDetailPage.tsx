import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  fetchAdminComplaint,
  resolveAdminComplaint,
  startAdminComplaintReview,
} from '@/admin/api/adminApi'
import { DetailList, DetailRow } from '@/components/domain/DetailList'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { StoredFileList } from '@/components/domain/StoredFileRow'
import { UserProfileDialog, type ProfilePeek } from '@/components/domain/UserProfileDialog'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Avatar } from '@/components/ui/Avatar'
import { Button, LinkButton } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
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
import { deadlineInfo, formatDateTime, formatToman, toPersianDigits } from '@/lib/format'
import {
  complaintStatusMeta,
  metaOf,
  paymentStatusMeta,
  projectStatusMeta,
  taskStatusMeta,
} from '@/lib/labels'
import { AdminDeliveryList } from '../components/AdminDeliveryList'
import type { AdminParticipant, AdminResolveInput } from '../api/types'

/** سه تصمیمی که بک‌اند در ResolveComplaintRequest می‌پذیرد */
type DecisionKey = 'invalid' | 'valid-revision' | 'valid-cancel'

const DECISIONS: Record<
  DecisionKey,
  { label: string; title: string; description: string; tone: 'danger' | 'success'; confirm: string }
> = {
  invalid: {
    label: 'رد شکایت / نامعتبر',
    title: 'رد شکایت',
    description: 'شکایت نامعتبر تشخیص داده می‌شود و پروژه به روند قبلی خود بازمی‌گردد.',
    tone: 'danger',
    confirm: 'ثبت رد شکایت',
  },
  'valid-revision': {
    label: 'تأیید شکایت و درخواست اصلاح',
    title: 'تأیید شکایت و درخواست اصلاح',
    description: 'شکایت معتبر تشخیص داده می‌شود و پروژه برای ادامه فرآیند وارد مرحله بعدی می‌شود.',
    tone: 'success',
    confirm: 'ثبت تأیید شکایت',
  },
  'valid-cancel': {
    label: 'تأیید شکایت و لغو پروژه',
    title: 'تأیید شکایت و لغو پروژه',
    description: 'شکایت معتبر تشخیص داده می‌شود و پروژه به‌طور کامل لغو می‌شود.',
    tone: 'danger',
    confirm: 'تأیید و لغو پروژه',
  },
}

function toResolveInput(key: DecisionKey, adminResponse: string): AdminResolveInput {
  // `action` طبق قانون prohibited_if هرگز همراه decision=invalid ارسال نمی‌شود
  if (key === 'invalid') return { decision: 'invalid', admin_response: adminResponse }
  return {
    decision: 'valid',
    action: key === 'valid-cancel' ? 'cancel' : 'revision',
    admin_response: adminResponse,
  }
}

function ParticipantCard({
  title,
  person,
  onOpen,
}: {
  title: string
  person: AdminParticipant
  onOpen: () => void
}) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardBody className="space-y-3">
        {/* کلیک روی طرف پرونده، پروفایل کامل او را باز می‌کند (آواتار، رزومه، مشخصات) */}
        <button
          type="button"
          onClick={onOpen}
          className="-m-1 flex w-full items-center gap-3 rounded-xl p-1 text-start transition-colors hover:bg-ink-50"
        >
          <Avatar name={person.full_name} src={person.avatar} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-bold text-ink-800">{person.full_name}</p>
            <p className="truncate text-[11.5px] text-ink-400" dir="ltr">
              {person.mobile ? toPersianDigits(person.mobile) : '—'}
            </p>
          </div>
          <IconUser className="size-4 shrink-0 text-ink-400" />
        </button>

        <DetailList className="border-t border-ink-100 pt-1">
          <DetailRow
            label="شماره دانشجویی"
            value={person.student_number ? toPersianDigits(person.student_number) : '—'}
          />
          <DetailRow label="رشته تحصیلی" value={person.field_of_study || '—'} />
          <DetailRow label="دانشگاه" value={person.university_name || '—'} />
        </DetailList>
      </CardBody>
    </Card>
  )
}


/** پروندهٔ کامل یک شکایت + شروع بررسی + ثبت نتیجه */
export default function AdminComplaintDetailPage() {
  const { complaintId = '' } = useParams()
  const toast = useToast()

  const loader = useCallback(
    (signal: AbortSignal) => fetchAdminComplaint(complaintId, signal),
    [complaintId],
  )
  const resource = useApiResource(loader, [complaintId])

  useDocumentTitle(resource.data ? `${resource.data.complaint.title} — ادمین` : 'شکایت — ادمین')

  const [peek, setPeek] = useState<{ user: ProfilePeek; title: string } | null>(null)
  const [decision, setDecision] = useState<DecisionKey | null>(null)
  const [adminResponse, setAdminResponse] = useState('')

  const reviewMutation = useMutation(() => startAdminComplaintReview(complaintId), {
    onSuccess: (result) => {
      toast.success(result.message)
      resource.reload()
    },
    onError: (error) => toast.error(error.message),
  })

  const resolveMutation = useMutation(
    (key: DecisionKey) => resolveAdminComplaint(complaintId, toResolveInput(key, adminResponse.trim())),
    {
      onSuccess: (result) => {
        toast.success(result.message)
        setDecision(null)
        setAdminResponse('')
        // پاسخ resolve فقط پیام دارد؛ وضعیت جدید شکایت و پروژه را دوباره می‌خوانیم
        resource.reload()
      },
      onError: (error) => toast.error(error.message),
    },
  )

  if (resource.loading) {
    return (
      <div>
        <PageHeader title="شکایت" backTo="/admin/complaints" backLabel="همه شکایات" />
        <SkeletonDetail />
      </div>
    )
  }

  if (resource.error || !resource.data) {
    return (
      <div>
        <PageHeader title="شکایت" backTo="/admin/complaints" backLabel="همه شکایات" />
        {resource.error ? <ErrorState error={resource.error} onRetry={resource.reload} /> : null}
      </div>
    )
  }

  const { complaint, complainant, other_party, task, application, project, deliveries } =
    resource.data
  const complaintFiles = resource.data.complaint_files ?? []

  const isPending = complaint.status === 'pending'
  const isReviewing = complaint.status === 'reviewing'
  const isClosed = complaint.status === 'resolved' || complaint.status === 'rejected'

  /** بک‌اند حداقل ۱۰ و حداکثر ۵۰۰۰ کاراکتر می‌خواهد */
  const responseValue = adminResponse.trim()
  const responseValid = responseValue.length >= 10 && responseValue.length <= 5000
  const deadline = deadlineInfo(project.deadline)

  return (
    <div className="space-y-4">
      <PageHeader
        title={complaint.title}
        description={`شناسه شکایت: ${toPersianDigits(complaint.id)} · ثبت ${formatDateTime(
          complaint.created_at,
        )}`}
        backTo="/admin/complaints"
        backLabel="همه شکایات"
        action={
          isPending ? (
            <Button
              size="sm"
              onClick={() => void reviewMutation.run()}
              loading={reviewMutation.loading}
            >
              شروع بررسی
            </Button>
          ) : undefined
        }
      />

      {reviewMutation.error ? <ErrorState error={reviewMutation.error} compact /> : null}

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge meta={metaOf(complaintStatusMeta, complaint.status)} />
            <StatusBadge meta={metaOf(projectStatusMeta, project.status)} />
            <StatusBadge meta={metaOf(paymentStatusMeta, project.payment_status)} />
          </div>

          <div className="border-t border-ink-100 pt-4">
            <h2 className="mb-1.5 text-[14px] font-bold text-ink-900">شرح شکایت</h2>
            <p className="whitespace-pre-line text-[13.5px] leading-8 text-ink-600">
              {complaint.description}
            </p>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <ParticipantCard
          title="شاکی"
          person={complainant}
          onOpen={() => setPeek({ user: complainant, title: 'پروفایل شاکی' })}
        />
        <ParticipantCard
          title="طرف مقابل"
          person={other_party}
          onOpen={() => setPeek({ user: other_party, title: 'پروفایل طرف مقابل' })}
        />
      </div>

      <Card>
        <CardHeader
          title="تسک"
          description={task?.category?.name}
          action={
            task?.id ? (
              // GET /api/tasks/{id} عمومی است (بدون auth)، پس ادمین هم می‌تواند بازش کند
              <LinkButton to={`/tasks/${task.id}`} size="sm" variant="outline">
                باز کردن صفحهٔ تسک
              </LinkButton>
            ) : undefined
          }
        />
        <CardBody className="space-y-3">
          <p className="text-[14px] font-bold text-ink-900">{task?.title ?? '—'}</p>
          {task?.description ? (
            <p className="whitespace-pre-line text-[13px] leading-8 text-ink-600">
              {task.description}
            </p>
          ) : null}
          <DetailList className="border-t border-ink-100 pt-1">
            <DetailRow label="شناسه تسک" value={toPersianDigits(task?.id ?? '—')} />
            <DetailRow
              label="بودجه"
              value={
                task?.budget !== undefined ? (
                  <span className="text-emerald-700">{formatToman(task.budget)}</span>
                ) : (
                  '—'
                )
              }
            />
            <DetailRow
              label="وضعیت تسک"
              value={task ? <StatusBadge meta={metaOf(taskStatusMeta, task.status)} /> : '—'}
            />
          </DetailList>

          <div className="border-t border-ink-100 pt-3">
            <h3 className="mb-2 text-[13px] font-bold text-ink-800">فایل‌های تسک</h3>
            <StoredFileList
              files={task?.files ?? []}
              empty="برای این تسک فایلی پیوست نشده است."
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="درخواست همکاری" />
        <CardBody className="space-y-3">
          {application?.description ? (
            <p className="whitespace-pre-line text-[13px] leading-8 text-ink-600">
              {application.description}
            </p>
          ) : null}
          <DetailList className="border-t border-ink-100 pt-1">
            <DetailRow label="شناسه درخواست" value={toPersianDigits(application?.id ?? '—')} />
            <DetailRow
              label="تاریخ ارسال"
              value={application?.created_at ? formatDateTime(application.created_at) : '—'}
            />
            <DetailRow
              label="متقاضی"
              value={
                application?.user_id ? (
                  <button
                    type="button"
                    onClick={() =>
                      setPeek({
                        user:
                          application.user_id === complainant.id ? complainant : other_party,
                        title: 'پروفایل متقاضی',
                      })
                    }
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    {application.user_id === complainant.id
                      ? complainant.full_name
                      : other_party.full_name}
                  </button>
                ) : (
                  '—'
                )
              }
            />
          </DetailList>

          <div className="border-t border-ink-100 pt-3">
            <h3 className="mb-2 text-[13px] font-bold text-ink-800">فایل‌های درخواست همکاری</h3>
            <StoredFileList
              files={application?.files ?? []}
              empty="به این درخواست فایلی پیوست نشده است."
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="پروژه" />
        <CardBody>
          <DetailList>
            <DetailRow label="شناسه پروژه" value={toPersianDigits(project.id)} />
            <DetailRow
              label="مبلغ"
              icon={<IconMoney className="size-4" />}
              value={<span className="text-emerald-700">{formatToman(project.amount)}</span>}
            />
            <DetailRow
              label="مهلت تحویل"
              icon={<IconClock className="size-4" />}
              value={
                <span className={deadline.tone === 'danger' ? 'text-rose-600' : undefined}>
                  {formatDateTime(project.deadline)} · {deadline.label}
                </span>
              }
            />
            <DetailRow
              label="وضعیت پروژه"
              value={<StatusBadge meta={metaOf(projectStatusMeta, project.status)} />}
            />
            <DetailRow
              label="وضعیت پرداخت"
              value={<StatusBadge meta={metaOf(paymentStatusMeta, project.payment_status)} />}
            />
          </DetailList>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="تحویل‌های پروژه"
          description="تاریخچهٔ کامل تحویل‌ها، دلایل رد شدن و فایل‌ها"
        />
        <CardBody>
          <AdminDeliveryList deliveries={deliveries ?? []} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="فایل‌های شکایت"
          description="مدارکی که شاکی همراه شکایت ارسال کرده است"
        />
        <CardBody>
          <StoredFileList
            files={complaintFiles}
            empty="مدرکی همراه این شکایت ارسال نشده است."
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="پاسخ مدیر" />
        <CardBody>
          {complaint.admin_response ? (
            <p className="whitespace-pre-line text-[13.5px] leading-8 text-ink-700">
              {complaint.admin_response}
            </p>
          ) : (
            <p className="text-[13px] text-ink-400">هنوز پاسخی ثبت نشده است.</p>
          )}
        </CardBody>
      </Card>

      {isPending ? (
        <Alert tone="info" title="برای تصمیم‌گیری ابتدا بررسی را شروع کنید">
          تا وقتی شکایت در وضعیت «در انتظار بررسی» است، امکان ثبت نتیجه وجود ندارد.
        </Alert>
      ) : null}

      {isReviewing ? (
        <Card className="border-brand-200">
          <CardHeader
            title="ثبت نتیجه بررسی"
            description="یکی از سه تصمیم زیر را انتخاب کنید؛ در مرحلهٔ بعد پاسخ مدیر را می‌نویسید."
          />
          <CardBody className="space-y-3">
            <Alert tone="warning">
              نتیجهٔ بررسی برای هر دو طرف اعلان می‌سازد و وضعیت پروژه را تغییر می‌دهد. این کار قابل
              بازگشت نیست.
            </Alert>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                variant="danger"
                onClick={() => {
                  setAdminResponse('')
                  setDecision('invalid')
                }}
              >
                {DECISIONS.invalid.label}
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  setAdminResponse('')
                  setDecision('valid-revision')
                }}
              >
                {DECISIONS['valid-revision'].label}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setAdminResponse('')
                  setDecision('valid-cancel')
                }}
              >
                {DECISIONS['valid-cancel'].label}
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {isClosed ? (
        <Alert
          tone={complaint.status === 'resolved' ? 'success' : 'neutral'}
          title={
            complaint.status === 'resolved'
              ? 'این شکایت معتبر تشخیص داده شد'
              : 'این شکایت نامعتبر تشخیص داده شد'
          }
        >
          نتیجه ثبت شده و امکان بررسی یا تغییر دوباره وجود ندارد. وضعیت فعلی پروژه:{' '}
          <b>{metaOf(projectStatusMeta, project.status).label}</b>
        </Alert>
      ) : null}

      {/*
        پروفایل طرفین پرونده — AdminComplaintController::show برای هر دو نفر
        full_name, avatar, mobile, student_number, field_of_study, university_name
        را برمی‌گرداند. رزومه در این پاسخ نیست (به گزارش بک‌اند مراجعه کنید).
      */}
      <UserProfileDialog
        open={peek !== null}
        onClose={() => setPeek(null)}
        user={peek?.user ?? null}
        title={peek?.title ?? 'پروفایل کاربر'}
      />

      <Modal
        open={decision !== null}
        onClose={() => setDecision(null)}
        title={decision ? DECISIONS[decision].title : ''}
        description={decision ? DECISIONS[decision].description : undefined}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDecision(null)}
              disabled={resolveMutation.loading}
            >
              انصراف
            </Button>
            <Button
              variant={decision ? DECISIONS[decision].tone : 'primary'}
              loading={resolveMutation.loading}
              disabled={!responseValid}
              onClick={() => decision && void resolveMutation.run(decision)}
            >
              {decision ? DECISIONS[decision].confirm : 'ثبت'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {resolveMutation.error ? <ErrorState error={resolveMutation.error} compact /> : null}

          {decision === 'valid-cancel' ? (
            <Alert tone="danger" title="پروژه لغو می‌شود">
              با این تصمیم پروژه به وضعیت «لغو شده» می‌رود و ادامهٔ همکاری ممکن نخواهد بود.
            </Alert>
          ) : null}

          <Field
            label="پاسخ مدیر"
            required
            hint="بین ۱۰ تا ۵۰۰۰ کاراکتر — این متن برای هر دو طرف ارسال می‌شود"
            error={
              adminResponse.length > 0 && !responseValid
                ? 'پاسخ مدیر باید بین ۱۰ تا ۵۰۰۰ کاراکتر باشد.'
                : resolveMutation.error?.fieldError('admin_response')
            }
          >
            <Textarea
              value={adminResponse}
              onChange={(event) => setAdminResponse(event.target.value)}
              rows={6}
              maxLength={5000}
              invalid={adminResponse.length > 0 && !responseValid}
              placeholder="دلیل تصمیم و توضیح لازم برای طرفین را بنویسید…"
            />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
