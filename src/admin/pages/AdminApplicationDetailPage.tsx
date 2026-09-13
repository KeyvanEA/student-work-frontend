import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DetailList, DetailRow } from '@/components/domain/DetailList'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { SkeletonDetail } from '@/components/ui/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDateTime, formatNumber, toPersianDigits } from '@/lib/format'
import { applicationStatusMeta, metaOf } from '@/lib/labels'
import { adminApi } from '../api/adminApi'
import { plannedAdminEndpoints } from '../api/plannedEndpoints'
import { MockNotice } from '../components/MockNotice'

export default function AdminApplicationDetailPage() {
  const { applicationId = '' } = useParams()
  useDocumentTitle('درخواست همکاری — ادمین')

  const loader = useCallback(() => adminApi.application(Number(applicationId)), [applicationId])
  const application = useApiResource(loader, [applicationId])

  if (application.loading) {
    return (
      <div>
        <PageHeader title="درخواست همکاری" backTo="/admin/applications" backLabel="همه درخواست‌ها" />
        <SkeletonDetail />
      </div>
    )
  }

  if (application.error || !application.data) {
    return (
      <div>
        <PageHeader title="درخواست همکاری" backTo="/admin/applications" backLabel="همه درخواست‌ها" />
        {application.error ? (
          <ErrorState error={application.error} onRetry={application.reload} />
        ) : null}
      </div>
    )
  }

  const data = application.data

  return (
    <div className="space-y-4">
      <PageHeader
        title={`درخواست همکاری ${toPersianDigits(data.id)}`}
        description={data.task.title}
        backTo="/admin/applications"
        backLabel="همه درخواست‌ها"
      />

      <MockNotice endpoints={[`GET ${plannedAdminEndpoints.application('{application}')}`]} />

      <Card>
        <CardBody className="space-y-4">
          <StatusBadge meta={metaOf(applicationStatusMeta, data.status)} />
          <div className="border-t border-ink-100 pt-4">
            <h2 className="mb-1.5 text-[14px] font-bold text-ink-900">متن درخواست</h2>
            <p className="whitespace-pre-line text-[13.5px] leading-8 text-ink-600">
              {data.description}
            </p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="اطلاعات درخواست" />
        <CardBody>
          <DetailList>
            <DetailRow
              label="تسک"
              value={
                <Link to={`/admin/tasks/${data.task.id}`} className="font-semibold text-brand-600 hover:underline">
                  {data.task.title}
                </Link>
              }
            />
            <DetailRow
              label="کارجو"
              value={
                <Link
                  to={`/admin/users/${data.applicant.id}`}
                  className="font-semibold text-brand-600 hover:underline"
                >
                  {data.applicant.full_name}
                </Link>
              }
            />
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
            <DetailRow label="تاریخ ارسال" value={formatDateTime(data.created_at)} />
            <DetailRow label="تعداد فایل پیوست" value={formatNumber(data.files_count)} />
            <DetailRow
              label="پروژه ساخته‌شده"
              value={
                data.project_id ? (
                  <Link
                    to={`/admin/projects/${data.project_id}`}
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    پروژه {toPersianDigits(data.project_id)}
                  </Link>
                ) : (
                  '—'
                )
              }
            />
          </DetailList>
        </CardBody>
      </Card>
    </div>
  )
}
