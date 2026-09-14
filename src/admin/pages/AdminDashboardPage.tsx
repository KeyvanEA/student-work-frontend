import { useCallback } from 'react'
import { fetchAdminDashboard } from '@/admin/api/adminApi'
import { StatCard } from '@/components/domain/StatCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { LinkButton } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { IconWarning } from '@/components/ui/Icons'
import { Skeleton } from '@/components/ui/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatNumber } from '@/lib/format'

/** داشبورد ادمین — آمار شکایات مستقیماً از GET /api/admin/dashboard */
export default function AdminDashboardPage() {
  useDocumentTitle('داشبورد ادمین')

  const loader = useCallback((signal: AbortSignal) => fetchAdminDashboard(signal), [])
  const dashboard = useApiResource(loader, [])

  const stats = dashboard.data?.complaints
  const total = stats
    ? stats.pending + stats.reviewing + stats.resolved + stats.rejected
    : 0
  const open = stats ? stats.pending + stats.reviewing : 0

  return (
    <div className="space-y-5">
      <PageHeader
        title="داشبورد ادمین"
        description="وضعیت شکایات ثبت‌شده در سامانه"
        action={
          <LinkButton to="/admin/complaints" size="sm" variant="outline">
            مدیریت شکایات
          </LinkButton>
        }
      />

      {dashboard.loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : dashboard.error ? (
        <ErrorState error={dashboard.error} onRetry={dashboard.reload} />
      ) : stats ? (
        <>
          <section>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="شکایات در انتظار بررسی"
                value={stats.pending}
                hint="هنوز بررسی آن‌ها شروع نشده"
                to="/admin/complaints?status=pending"
                tone="warning"
                Icon={IconWarning}
              />
              <StatCard
                label="شکایات در حال بررسی"
                value={stats.reviewing}
                hint="بررسی شروع شده و منتظر تصمیم است"
                to="/admin/complaints?status=reviewing"
                tone="info"
                Icon={IconWarning}
              />
              <StatCard
                label="شکایات حل‌شده"
                value={stats.resolved}
                hint="شکایت معتبر تشخیص داده شد"
                to="/admin/complaints?status=resolved"
                tone="success"
                Icon={IconWarning}
              />
              <StatCard
                label="شکایات ردشده"
                value={stats.rejected}
                hint="شکایت نامعتبر تشخیص داده شد"
                to="/admin/complaints?status=rejected"
                tone="neutral"
                Icon={IconWarning}
              />
            </div>
          </section>

          {open > 0 ? (
            <Alert tone="warning" title={`${formatNumber(open)} شکایت باز دارید`}>
              شکایت‌های «در انتظار بررسی» و «در حال بررسی» منتظر اقدام شما هستند.
              <div className="mt-3">
                <LinkButton to="/admin/complaints?status=pending" size="sm" variant="outline">
                  رسیدگی به شکایات
                </LinkButton>
              </div>
            </Alert>
          ) : (
            <Alert tone="success" title="شکایت بازی وجود ندارد">
              همهٔ شکایت‌های ثبت‌شده نتیجه گرفته‌اند.
            </Alert>
          )}

          <Card>
            <CardHeader
              title="جمع‌بندی"
              description="این اعداد مستقیماً از GET /api/admin/dashboard خوانده می‌شوند."
            />
            <CardBody>
              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-xl bg-ink-50 px-4 py-3">
                  <dt className="text-[13px] font-semibold text-ink-600">کل شکایات</dt>
                  <dd className="text-[15px] font-extrabold text-ink-900">{formatNumber(total)}</dd>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-ink-50 px-4 py-3">
                  <dt className="text-[13px] font-semibold text-ink-600">شکایات باز</dt>
                  <dd className="text-[15px] font-extrabold text-amber-700">{formatNumber(open)}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Alert tone="info">
            در این مرحله فقط <b>داشبورد</b> و <b>مدیریت شکایات</b> فعال هستند. بقیهٔ بخش‌های منو
            هنوز در بک‌اند API ندارند و عمداً غیرفعال گذاشته شده‌اند.
          </Alert>
        </>
      ) : null}
    </div>
  )
}
