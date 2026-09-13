import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { useDashboardStats } from '@/dashboard/DashboardStatsContext'
import { StatCard } from '@/components/domain/StatCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, LinkButton } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import {
  IconBell,
  IconBolt,
  IconHandshake,
  IconPlus,
  IconTasks,
  IconUpload,
  IconWarning,
} from '@/components/ui/Icons'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { toPersianDigits } from '@/lib/format'

/** کارهای در انتظار اقدام — هر ردیف از یکی از شمارنده‌های واقعی API ساخته می‌شود */
interface PendingAction {
  key: string
  count: number
  label: string
  description: string
  to: string
}

export default function DashboardPage() {
  useDocumentTitle('داشبورد')
  const { user } = useAuth()
  const { stats, loading, error, reload } = useDashboardStats()

  if (loading && !stats) {
    return (
      <div>
        <PageHeader title="داشبورد" description="در حال دریافت اطلاعات…" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div>
        <PageHeader title="داشبورد" />
        {error ? <ErrorState error={error} onRetry={reload} /> : null}
      </div>
    )
  }

  const pendingActions: PendingAction[] = [
    {
      key: 'received-applications',
      count: stats.recivedApplications,
      label: 'درخواست همکاری در انتظار بررسی شما',
      description: 'برای تسک‌هایی که ثبت کرده‌اید درخواست همکاری رسیده است.',
      to: '/applications/received',
    },
    {
      key: 'received-deliveries',
      count: stats.recivedDelivery,
      label: 'تحویل در انتظار بررسی شما',
      description: 'کارجو فایل تحویل را ثبت کرده و منتظر تایید یا رد شماست.',
      to: '/projects/active/employer',
    },
    {
      key: 'sent-deliveries',
      count: stats.sentDelivery,
      label: 'تحویل ارسال‌شده در انتظار کارفرما',
      description: 'تحویل‌هایی که ثبت کرده‌اید و هنوز بررسی نشده‌اند.',
      to: '/projects/active/worker',
    },
    {
      key: 'sent-applications',
      count: stats.sentApplications,
      label: 'درخواست همکاری در انتظار پاسخ',
      description: 'درخواست‌هایی که فرستاده‌اید و هنوز پذیرفته یا رد نشده‌اند.',
      to: '/applications/sent',
    },
    {
      key: 'related-complaints',
      count: stats.relatedComplaints,
      label: 'شکایت باز روی پروژه‌های شما',
      description: 'طرف مقابل روی یکی از پروژه‌های شما شکایت ثبت کرده است.',
      to: '/complaints/related',
    },
    {
      key: 'my-complaints',
      count: stats.myCompaints,
      label: 'شکایت شما در حال بررسی',
      description: 'شکایت‌هایی که ثبت کرده‌اید و هنوز نتیجه نگرفته‌اند.',
      to: '/complaints/mine',
    },
  ].filter((action) => action.count > 0)

  return (
    <div className="space-y-5">
      <PageHeader
        title={user ? `سلام ${user.full_name} 👋` : 'داشبورد'}
        description="خلاصهٔ وضعیت پروژه‌ها، درخواست‌ها و شکایت‌های شما"
        action={
          <LinkButton to="/tasks/new" size="sm" icon={<IconPlus className="size-4" />}>
            ثبت تسک
          </LinkButton>
        }
      />

      <section>
        <h2 className="mb-3 text-[15px] font-bold text-ink-900">نگاه کلی</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="پروژه‌های فعال"
            value={stats.activeProject}
            hint="در حال انجام، تحویل‌شده، نیازمند اصلاح یا پرداخت‌نشده"
            to="/projects/active/worker"
            tone="brand"
            Icon={IconBolt}
          />
          <StatCard
            label="تسک‌های باز شما"
            value={stats.openTasks}
            hint="تسک‌هایی که ثبت کرده‌اید و هنوز واگذار نشده‌اند"
            to="/my-tasks"
            tone="info"
            Icon={IconTasks}
          />
          <StatCard
            label="اعلان‌های خوانده‌نشده"
            value={stats.unreadNotifications}
            to="/notifications"
            tone="warning"
            Icon={IconBell}
          />
          <StatCard
            label="درخواست‌های ارسال‌شده"
            value={stats.sentApplications}
            hint="در انتظار پاسخ کارفرما"
            to="/applications/sent"
            tone="neutral"
            Icon={IconHandshake}
          />
          <StatCard
            label="درخواست‌های دریافت‌شده"
            value={stats.recivedApplications}
            hint="در انتظار بررسی شما"
            to="/applications/received"
            tone="success"
            Icon={IconHandshake}
          />
          <StatCard
            label="تحویل‌های در انتظار"
            value={stats.sentDelivery + stats.recivedDelivery}
            hint={`${toPersianDigits(stats.sentDelivery)} ارسالی · ${toPersianDigits(
              stats.recivedDelivery,
            )} دریافتی`}
            to="/projects/active/worker"
            tone="info"
            Icon={IconUpload}
          />
          <StatCard
            label="شکایت‌های من"
            value={stats.myCompaints}
            hint="در وضعیت در انتظار یا در حال بررسی"
            to="/complaints/mine"
            tone="danger"
            Icon={IconWarning}
          />
          <StatCard
            label="شکایت‌های مرتبط"
            value={stats.relatedComplaints}
            hint="ثبت‌شده روی پروژه‌های شما"
            to="/complaints/related"
            tone="danger"
            Icon={IconWarning}
          />
        </div>
      </section>

      <Card>
        <CardHeader
          title="کارهای در انتظار شما"
          description="مواردی که همین حالا نیاز به اقدام دارند"
          action={
            <Button size="sm" variant="ghost" onClick={reload}>
              به‌روزرسانی
            </Button>
          }
        />
        <CardBody>
          {pendingActions.length === 0 ? (
            <EmptyState
              title="کار در انتظاری ندارید"
              description="هر درخواست، تحویل یا شکایت جدیدی که نیاز به اقدام داشته باشد اینجا نمایش داده می‌شود."
            />
          ) : (
            <ul className="space-y-2">
              {pendingActions.map((action) => (
                <li key={action.key}>
                  <Link
                    to={action.to}
                    className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-3.5 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-[14px] font-extrabold text-brand-700">
                      {toPersianDigits(action.count)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-bold text-ink-800">
                        {action.label}
                      </span>
                      <span className="block truncate text-[11.5px] text-ink-400">
                        {action.description}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="میان‌برها" />
        <CardBody className="flex flex-wrap gap-2">
          <LinkButton to="/projects/active/worker" size="sm" variant="outline">
            پروژه‌های فعال
          </LinkButton>
          <LinkButton to="/my-tasks" size="sm" variant="outline">
            تسک‌های ثبت‌شده
          </LinkButton>
          <LinkButton to="/satisfaction" size="sm" variant="outline">
            میزان رضایت
          </LinkButton>
          <LinkButton to="/tasks" size="sm" variant="ghost">
            مرور تسک‌های باز
          </LinkButton>
        </CardBody>
      </Card>
    </div>
  )
}
