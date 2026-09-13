import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DetailList, DetailRow } from '@/components/domain/DetailList'
import { SkillChips } from '@/components/domain/SkillChips'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ErrorState } from '@/components/ui/ErrorState'
import { SkeletonDetail } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMutation } from '@/hooks/useMutation'
import { formatDateTime, formatNumber, formatToman, toPersianDigits } from '@/lib/format'
import { metaOf, taskStatusMeta } from '@/lib/labels'
import { adminApi } from '../api/adminApi'
import { plannedAdminEndpoints } from '../api/plannedEndpoints'
import { MockNotice } from '../components/MockNotice'

export default function AdminTaskDetailPage() {
  const { taskId = '' } = useParams()
  const toast = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const loader = useCallback(() => adminApi.task(Number(taskId)), [taskId])
  const task = useApiResource(loader, [taskId])

  useDocumentTitle(task.data ? `${task.data.title} — ادمین` : 'تسک — ادمین')

  const cancelMutation = useMutation(() => adminApi.cancelTask(Number(taskId)), {
    onSuccess: () => {
      toast.success('تسک لغو شد.')
      setConfirmOpen(false)
      task.reload()
    },
    onError: (error) => {
      toast.error(error.message)
      setConfirmOpen(false)
    },
  })

  if (task.loading) {
    return (
      <div>
        <PageHeader title="تسک" backTo="/admin/tasks" backLabel="همه تسک‌ها" />
        <SkeletonDetail />
      </div>
    )
  }

  if (task.error || !task.data) {
    return (
      <div>
        <PageHeader title="تسک" backTo="/admin/tasks" backLabel="همه تسک‌ها" />
        {task.error ? <ErrorState error={task.error} onRetry={task.reload} /> : null}
      </div>
    )
  }

  const data = task.data

  return (
    <div className="space-y-4">
      <PageHeader
        title={data.title}
        description={`شناسه تسک: ${toPersianDigits(data.id)}`}
        backTo="/admin/tasks"
        backLabel="همه تسک‌ها"
        action={
          data.status === 'open' ? (
            <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)}>
              لغو تسک
            </Button>
          ) : undefined
        }
      />

      <MockNotice
        endpoints={[
          `GET ${plannedAdminEndpoints.task('{task}')}`,
          `PATCH ${plannedAdminEndpoints.taskCancel('{task}')}`,
        ]}
      />

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge meta={metaOf(taskStatusMeta, data.status)} />
            <span className="rounded-full bg-ink-100 px-2.5 py-1 text-[12px] font-semibold text-ink-600">
              {data.category.name}
            </span>
          </div>
          <div className="border-t border-ink-100 pt-4">
            <h2 className="mb-1.5 text-[14px] font-bold text-ink-900">شرح کار</h2>
            <p className="whitespace-pre-line text-[13.5px] leading-8 text-ink-600">
              {data.description}
            </p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <DetailList>
            <DetailRow label="کارفرما" value={data.owner.full_name} />
            <DetailRow
              label="بودجه"
              value={<span className="text-emerald-700">{formatToman(data.budget)}</span>}
            />
            <DetailRow label="مهلت انجام" value={formatDateTime(data.deadline)} />
            <DetailRow label="تاریخ ثبت" value={formatDateTime(data.created_at)} />
            <DetailRow label="تعداد فایل پیوست" value={formatNumber(data.files_count)} />
            <DetailRow label="تعداد درخواست همکاری" value={formatNumber(data.applications_count)} />
          </DetailList>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="مهارت‌های موردنیاز" />
        <CardBody>
          <SkillChips skills={data.skills} empty="مهارتی ثبت نشده است." />
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="لغو تسک توسط ادمین"
        description="با لغو تسک، دیگر درخواست همکاری جدیدی روی آن ثبت نمی‌شود. این کار قابل بازگشت نیست."
        confirmLabel="بله، لغو کن"
        tone="danger"
        loading={cancelMutation.loading}
        onConfirm={() => void cancelMutation.run()}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
