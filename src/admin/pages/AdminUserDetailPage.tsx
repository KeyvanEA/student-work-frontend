import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DetailList, DetailRow } from '@/components/domain/DetailList'
import { SkillChips } from '@/components/domain/SkillChips'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ErrorState } from '@/components/ui/ErrorState'
import { SkeletonDetail } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMutation } from '@/hooks/useMutation'
import { formatDate, formatNumber, toPersianDigits } from '@/lib/format'
import { adminApi } from '../api/adminApi'
import { plannedAdminEndpoints } from '../api/plannedEndpoints'
import { MockNotice } from '../components/MockNotice'

export default function AdminUserDetailPage() {
  const { userId = '' } = useParams()
  const toast = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const loader = useCallback(() => adminApi.user(Number(userId)), [userId])
  const user = useApiResource(loader, [userId])

  useDocumentTitle(user.data ? `${user.data.full_name} — ادمین` : 'کاربر — ادمین')

  const statusMutation = useMutation(
    (isActive: boolean) => adminApi.setUserStatus(Number(userId), isActive),
    {
      onSuccess: () => {
        toast.success('وضعیت حساب کاربر به‌روزرسانی شد.')
        setConfirmOpen(false)
        user.reload()
      },
      onError: (error) => {
        toast.error(error.message)
        setConfirmOpen(false)
      },
    },
  )

  if (user.loading) {
    return (
      <div>
        <PageHeader title="کاربر" backTo="/admin/users" backLabel="همه کاربران" />
        <SkeletonDetail />
      </div>
    )
  }

  if (user.error || !user.data) {
    return (
      <div>
        <PageHeader title="کاربر" backTo="/admin/users" backLabel="همه کاربران" />
        {user.error ? <ErrorState error={user.error} onRetry={user.reload} /> : null}
      </div>
    )
  }

  const data = user.data

  return (
    <div className="space-y-4">
      <PageHeader
        title={data.full_name}
        description={`شناسه کاربر: ${toPersianDigits(data.id)}`}
        backTo="/admin/users"
        backLabel="همه کاربران"
        action={
          <Button
            size="sm"
            variant={data.is_active ? 'danger' : 'success'}
            onClick={() => setConfirmOpen(true)}
          >
            {data.is_active ? 'غیرفعال کردن حساب' : 'فعال کردن حساب'}
          </Button>
        }
      />

      <MockNotice
        endpoints={[
          `GET ${plannedAdminEndpoints.user('{user}')}`,
          `PATCH ${plannedAdminEndpoints.userStatus('{user}')}`,
        ]}
      />

      <Card>
        <CardBody className="flex items-center gap-4">
          <Avatar name={data.full_name} size="lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-extrabold text-ink-900">{data.full_name}</h2>
              <Badge tone={data.is_active ? 'success' : 'neutral'} dot>
                {data.is_active ? 'فعال' : 'غیرفعال'}
              </Badge>
            </div>
            <p className="mt-0.5 truncate text-[12.5px] text-ink-500">
              {data.field_of_study} · {data.university_name}
            </p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="اطلاعات حساب" />
        <CardBody>
          <DetailList>
            <DetailRow
              label="شماره موبایل"
              value={<span dir="ltr">{toPersianDigits(data.mobile)}</span>}
            />
            <DetailRow label="شماره دانشجویی" value={toPersianDigits(data.student_number)} />
            <DetailRow label="رشته تحصیلی" value={data.field_of_study} />
            <DetailRow label="دانشگاه" value={data.university_name} />
            <DetailRow
              label="ایمیل"
              value={data.email ? <span dir="ltr">{data.email}</span> : '—'}
            />
            <DetailRow label="تاریخ عضویت" value={formatDate(data.created_at)} />
          </DetailList>
        </CardBody>
      </Card>

      {data.bio ? (
        <Card>
          <CardHeader title="درباره کاربر" />
          <CardBody>
            <p className="whitespace-pre-line text-[13.5px] leading-8 text-ink-600">{data.bio}</p>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="مهارت‌ها" />
        <CardBody>
          <SkillChips skills={data.skills} empty="مهارتی ثبت نشده است." />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="فعالیت" />
        <CardBody>
          <DetailList>
            <DetailRow label="تسک‌های ثبت‌شده" value={formatNumber(data.tasks_count)} />
            <DetailRow label="درخواست‌های همکاری" value={formatNumber(data.applications_count)} />
            <DetailRow label="پروژه‌ها" value={formatNumber(data.projects_count)} />
          </DetailList>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title={data.is_active ? 'غیرفعال کردن حساب کاربر' : 'فعال کردن حساب کاربر'}
        description={
          data.is_active
            ? 'با غیرفعال شدن حساب، کاربر نباید بتواند وارد شود یا فعالیت جدیدی ثبت کند.'
            : 'حساب کاربر دوباره فعال می‌شود.'
        }
        confirmLabel="تایید"
        tone={data.is_active ? 'danger' : 'success'}
        loading={statusMutation.loading}
        onConfirm={() => void statusMutation.run(!data.is_active)}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
