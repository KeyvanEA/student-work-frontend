import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DetailList, DetailRow } from '@/components/domain/DetailList'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { PageHeader } from '@/components/layout/PageHeader'
import { LinkButton } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { SkeletonDetail } from '@/components/ui/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDateTime, formatNumber, formatToman, toPersianDigits } from '@/lib/format'
import { metaOf, paymentStatusMeta, projectStatusMeta } from '@/lib/labels'
import { adminApi } from '../api/adminApi'
import { plannedAdminEndpoints } from '../api/plannedEndpoints'
import { MockNotice } from '../components/MockNotice'

export default function AdminProjectDetailPage() {
  const { projectId = '' } = useParams()

  const loader = useCallback(() => adminApi.project(Number(projectId)), [projectId])
  const project = useApiResource(loader, [projectId])

  useDocumentTitle(project.data ? `${project.data.title} — ادمین` : 'پروژه — ادمین')

  if (project.loading) {
    return (
      <div>
        <PageHeader title="پروژه" backTo="/admin/projects" backLabel="همه پروژه‌ها" />
        <SkeletonDetail />
      </div>
    )
  }

  if (project.error || !project.data) {
    return (
      <div>
        <PageHeader title="پروژه" backTo="/admin/projects" backLabel="همه پروژه‌ها" />
        {project.error ? <ErrorState error={project.error} onRetry={project.reload} /> : null}
      </div>
    )
  }

  const data = project.data

  return (
    <div className="space-y-4">
      <PageHeader
        title={data.title}
        description={`شناسه پروژه: ${toPersianDigits(data.id)}`}
        backTo="/admin/projects"
        backLabel="همه پروژه‌ها"
        action={
          <LinkButton to={`/admin/projects/${data.id}/deliveries`} size="sm" variant="outline">
            تحویل‌های پروژه
          </LinkButton>
        }
      />

      <MockNotice endpoints={[`GET ${plannedAdminEndpoints.project('{project}')}`]} />

      <Card>
        <CardBody className="flex flex-wrap items-center gap-2">
          <StatusBadge meta={metaOf(projectStatusMeta, data.status)} />
          <StatusBadge meta={metaOf(paymentStatusMeta, data.payment_status)} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="اطلاعات پروژه" />
        <CardBody>
          <DetailList>
            <DetailRow
              label="کارفرما"
              value={
                <Link
                  to={`/admin/users/${data.employer.id}`}
                  className="font-semibold text-brand-600 hover:underline"
                >
                  {data.employer.full_name}
                </Link>
              }
            />
            <DetailRow
              label="کارجو"
              value={
                <Link
                  to={`/admin/users/${data.worker.id}`}
                  className="font-semibold text-brand-600 hover:underline"
                >
                  {data.worker.full_name}
                </Link>
              }
            />
            <DetailRow
              label="مبلغ"
              value={<span className="text-emerald-700">{formatToman(data.amount)}</span>}
            />
            <DetailRow label="شروع" value={formatDateTime(data.started_at)} />
            <DetailRow label="مهلت تحویل" value={formatDateTime(data.deadline)} />
            <DetailRow
              label="تکمیل"
              value={data.completed_at ? formatDateTime(data.completed_at) : '—'}
            />
            <DetailRow
              label="تسک"
              value={
                <Link
                  to={`/admin/tasks/${data.task_id}`}
                  className="font-semibold text-brand-600 hover:underline"
                >
                  تسک {toPersianDigits(data.task_id)}
                </Link>
              }
            />
            <DetailRow
              label="درخواست همکاری"
              value={
                <Link
                  to={`/admin/applications/${data.application_id}`}
                  className="font-semibold text-brand-600 hover:underline"
                >
                  درخواست {toPersianDigits(data.application_id)}
                </Link>
              }
            />
            <DetailRow label="تعداد تحویل" value={formatNumber(data.deliveries_count)} />
            <DetailRow label="تعداد شکایت" value={formatNumber(data.complaints_count)} />
          </DetailList>
        </CardBody>
      </Card>
    </div>
  )
}
