import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { SkeletonList } from '@/components/ui/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { toPersianDigits } from '@/lib/format'
import { adminApi } from '../api/adminApi'
import { plannedAdminEndpoints } from '../api/plannedEndpoints'
import { AdminDeliveryList } from '../components/AdminDeliveryList'
import { MockNotice } from '../components/MockNotice'

export default function AdminProjectDeliveriesPage() {
  const { projectId = '' } = useParams()
  useDocumentTitle('تحویل‌های پروژه — ادمین')

  const loader = useCallback(() => adminApi.projectDeliveries(Number(projectId)), [projectId])
  const deliveries = useApiResource(loader, [projectId])

  return (
    <div className="space-y-4">
      <PageHeader
        title={`تحویل‌های پروژه ${toPersianDigits(projectId)}`}
        description="تاریخچه کامل تحویل‌ها، دلایل رد شدن و فایل‌ها"
        backTo={`/admin/projects/${projectId}`}
        backLabel="بازگشت به پروژه"
      />

      <MockNotice endpoints={[`GET ${plannedAdminEndpoints.projectDeliveries('{project}')}`]} />

      {deliveries.loading ? (
        <SkeletonList count={3} />
      ) : deliveries.error ? (
        <ErrorState error={deliveries.error} onRetry={deliveries.reload} />
      ) : (
        <Card>
          <CardBody>
            <AdminDeliveryList deliveries={deliveries.data ?? []} />
          </CardBody>
        </Card>
      )}
    </div>
  )
}
