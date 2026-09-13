import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DetailList, DetailRow } from '@/components/domain/DetailList'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { Field } from '@/components/ui/Field'
import { IconFile } from '@/components/ui/Icons'
import { Modal } from '@/components/ui/Modal'
import { SkeletonDetail } from '@/components/ui/Skeleton'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMutation } from '@/hooks/useMutation'
import { formatBytes, formatDateTime, formatToman, toPersianDigits } from '@/lib/format'
import {
  complaintStatusMeta,
  metaOf,
  paymentStatusMeta,
  projectStatusMeta,
} from '@/lib/labels'
import { adminApi } from '../api/adminApi'
import { plannedAdminEndpoints } from '../api/plannedEndpoints'
import { AdminDeliveryList } from '../components/AdminDeliveryList'
import { MockNotice } from '../components/MockNotice'
import type { ComplaintDecision } from '../api/types'

export default function AdminComplaintDetailPage() {
  const { complaintId = '' } = useParams()
  const toast = useToast()

  const loader = useCallback(() => adminApi.complaint(Number(complaintId)), [complaintId])
  const complaint = useApiResource(loader, [complaintId])

  useDocumentTitle(complaint.data ? `${complaint.data.title} — ادمین` : 'شکایت — ادمین')

  const [decisionOpen, setDecisionOpen] = useState<ComplaintDecision | null>(null)
  const [response, setResponse] = useState('')
  const [cancelProject, setCancelProject] = useState(false)

  const reviewMutation = useMutation(() => adminApi.startComplaintReview(Number(complaintId)), {
    onSuccess: () => {
      toast.success('بررسی این شکایت شروع شد.')
      complaint.reload()
    },
    onError: (error) => toast.error(error.message),
  })

  const decisionMutation = useMutation(
    (decision: ComplaintDecision) =>
      adminApi.decideComplaint(Number(complaintId), {
        decision,
        admin_response: response.trim(),
        cancelProject,
      }),
    {
      onSuccess: () => {
        toast.success('نتیجه بررسی ثبت شد.')
        setDecisionOpen(null)
        setResponse('')
        setCancelProject(false)
        complaint.reload()
      },
      onError: (error) => toast.error(error.message),
    },
  )

  if (complaint.loading) {
    return (
      <div>
        <PageHeader title="شکایت" backTo="/admin/complaints" backLabel="همه شکایات" />
        <SkeletonDetail />
      </div>
    )
  }

  if (complaint.error || !complaint.data) {
    return (
      <div>
        <PageHeader title="شکایت" backTo="/admin/complaints" backLabel="همه شکایات" />
        {complaint.error ? <ErrorState error={complaint.error} onRetry={complaint.reload} /> : null}
      </div>
    )
  }

  const data = complaint.data
  const isOpen = data.status === 'pending' || data.status === 'reviewing'
  const responseValid = response.trim().length >= 10

  /**
   * شکایت کارفرما وقتی پروژه «تحویل شده» است ثبت می‌شود و شکایت کارجو وقتی پروژه
   * «نیازمند اصلاح» است. نتیجهٔ داوری، پروژه را به همان مسیر برمی‌گرداند.
   */
  const complainantRole = data.complainant_role === 'employer' ? 'کارفرما' : 'کارجو'

  return (
    <div className="space-y-4">
      <PageHeader
        title={data.title}
        description={`شناسه شکایت: ${toPersianDigits(data.id)} · ثبت ${formatDateTime(
          data.created_at,
        )}`}
        backTo="/admin/complaints"
        backLabel="همه شکایات"
        action={
          data.status === 'pending' ? (
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

      <MockNotice
        endpoints={[
          `GET ${plannedAdminEndpoints.complaint('{complaint}')}`,
          `PATCH ${plannedAdminEndpoints.complaintReview('{complaint}')}`,
          `PATCH ${plannedAdminEndpoints.complaintDecision('{complaint}')}`,
        ]}
      />

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge meta={metaOf(complaintStatusMeta, data.status)} />
            <StatusBadge meta={metaOf(projectStatusMeta, data.project.status)} />
            <StatusBadge meta={metaOf(paymentStatusMeta, data.project.payment_status)} />
          </div>

          <div className="border-t border-ink-100 pt-4">
            <h2 className="mb-1.5 text-[14px] font-bold text-ink-900">شرح شکایت</h2>
            <p className="whitespace-pre-line text-[13.5px] leading-8 text-ink-600">
              {data.description}
            </p>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="طرفین پرونده" />
          <CardBody>
            <DetailList>
              <DetailRow
                label="شاکی"
                value={
                  <Link
                    to={`/admin/users/${data.complainant.id}`}
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    {data.complainant.full_name}
                  </Link>
                }
              />
              <DetailRow
                label="طرف مقابل"
                value={
                  <Link
                    to={`/admin/users/${data.other_participant.id}`}
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    {data.other_participant.full_name}
                  </Link>
                }
              />
              <DetailRow label="نقش شاکی" value={complainantRole} />
            </DetailList>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="زمینهٔ پرونده" />
          <CardBody>
            <DetailList>
              <DetailRow
                label="پروژه"
                value={
                  <Link
                    to={`/admin/projects/${data.project.id}`}
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    پروژه {toPersianDigits(data.project.id)}
                  </Link>
                }
              />
              <DetailRow
                label="تسک"
                value={
                  <Link
                    to={`/admin/tasks/${data.task.id}`}
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    {data.task.title}
                  </Link>
                }
              />
              <DetailRow
                label="درخواست همکاری"
                value={
                  <Link
                    to={`/admin/applications/${data.application.id}`}
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    درخواست {toPersianDigits(data.application.id)}
                  </Link>
                }
              />
              <DetailRow
                label="مبلغ پروژه"
                value={<span className="text-emerald-700">{formatToman(data.project.amount)}</span>}
              />
              <DetailRow label="مهلت تحویل" value={formatDateTime(data.project.deadline)} />
            </DetailList>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="مدارک پیوست شکایت" />
        <CardBody>
          {data.attachments.length === 0 ? (
            <p className="text-[13px] text-ink-400">مدرکی پیوست نشده است.</p>
          ) : (
            <ul className="space-y-2">
              {data.attachments.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center gap-2.5 rounded-xl border border-ink-200 p-3 text-[13px] text-ink-700"
                >
                  <IconFile className="size-5 shrink-0 text-ink-400" />
                  <span className="min-w-0 flex-1 truncate">{file.original_name}</span>
                  <span className="shrink-0 text-[11.5px] text-ink-400">
                    {formatBytes(file.size)} · {file.mime_type}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="تاریخچه تحویل‌ها و رد شدن‌ها"
          description="برای داوری، مسیر کامل تحویل‌های این پروژه را ببینید."
        />
        <CardBody>
          <AdminDeliveryList deliveries={data.deliveries} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="پاسخ ادمین" />
        <CardBody>
          {data.admin_response ? (
            <p className="whitespace-pre-line text-[13.5px] leading-8 text-ink-700">
              {data.admin_response}
            </p>
          ) : (
            <p className="text-[13px] text-ink-400">هنوز پاسخی ثبت نشده است.</p>
          )}
        </CardBody>
      </Card>

      {isOpen ? (
        <Card className="border-brand-200">
          <CardHeader
            title="تصمیم‌گیری"
            description="نتیجهٔ بررسی، وضعیت پروژه را طبق Business Flow برمی‌گرداند."
          />
          <CardBody className="space-y-3">
            <Alert tone="info">
              اگر شکایت <b>وارد</b> باشد، پروژه به مسیر اصلاح یا تحویل برمی‌گردد (یا در صورت لزوم لغو
              می‌شود). اگر <b>وارد نباشد</b>، پروژه به وضعیت پیش از داوری بازمی‌گردد. در هر دو حالت
              باید برای کاربر مربوطه اعلان ساخته شود.
            </Alert>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="success"
                onClick={() => {
                  setResponse('')
                  setCancelProject(false)
                  setDecisionOpen('accept')
                }}
              >
                پذیرش شکایت
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setResponse('')
                  setCancelProject(false)
                  setDecisionOpen('reject')
                }}
              >
                رد شکایت
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : null}

      <Modal
        open={decisionOpen !== null}
        onClose={() => setDecisionOpen(null)}
        title={decisionOpen === 'accept' ? 'پذیرش شکایت' : 'رد شکایت'}
        description="پاسخ ادمین برای طرفین پرونده ثبت و از طریق اعلان اطلاع داده می‌شود."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDecisionOpen(null)}
              disabled={decisionMutation.loading}
            >
              انصراف
            </Button>
            <Button
              variant={decisionOpen === 'accept' ? 'success' : 'danger'}
              loading={decisionMutation.loading}
              disabled={!responseValid}
              onClick={() => decisionOpen && void decisionMutation.run(decisionOpen)}
            >
              ثبت نتیجه
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {decisionMutation.error ? <ErrorState error={decisionMutation.error} compact /> : null}

          <Field label="پاسخ ادمین" required hint="حداقل ۱۰ کاراکتر — برای طرفین نمایش داده می‌شود">
            <Textarea
              value={response}
              onChange={(event) => setResponse(event.target.value)}
              rows={6}
              placeholder="نتیجه بررسی و دلیل آن را بنویسید…"
            />
          </Field>

          {decisionOpen === 'accept' ? (
            <label className="flex items-start gap-2.5 rounded-xl border border-ink-200 p-3">
              <input
                type="checkbox"
                checked={cancelProject}
                onChange={(event) => setCancelProject(event.target.checked)}
                className="mt-0.5 size-4 accent-rose-600"
              />
              <span className="text-[12.5px] leading-6 text-ink-600">
                پروژه لغو شود
                <span className="mt-0.5 block text-[11.5px] text-ink-400">
                  اگر این گزینه انتخاب نشود، پروژه به مسیر عادی (اصلاح یا تحویل) برمی‌گردد.
                </span>
              </span>
            </label>
          ) : null}
        </div>
      </Modal>
    </div>
  )
}
