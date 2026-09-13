import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { StatCard } from '@/components/domain/StatCard'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import {
  IconPackage,
  IconTasks,
  IconUsers,
  IconWallet,
  IconWarning,
} from '@/components/ui/Icons'
import { Skeleton } from '@/components/ui/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDate, formatToman, toPersianDigits } from '@/lib/format'
import {
  complaintStatusMeta,
  metaOf,
  projectStatusMeta,
  taskStatusMeta,
} from '@/lib/labels'
import { adminApi } from '../api/adminApi'
import { plannedAdminEndpoints } from '../api/plannedEndpoints'
import { MockNotice } from '../components/MockNotice'

export default function AdminDashboardPage() {
  useDocumentTitle('داشبورد ادمین')

  const loader = useCallback(() => adminApi.overview(), [])
  const overview = useApiResource(loader, [])

  return (
    <div className="space-y-5">
      <PageHeader title="داشبورد ادمین" description="نمای کلی وضعیت سامانه" />

      <MockNotice endpoints={[`GET ${plannedAdminEndpoints.stats()}`]} />

      {overview.loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : overview.error ? (
        <ErrorState error={overview.error} onRetry={overview.reload} />
      ) : overview.data ? (
        <>
          <section>
            <h2 className="mb-3 text-[15px] font-bold text-ink-900">کاربران و تسک‌ها</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="کل کاربران"
                value={overview.data.stats.total_users}
                to="/admin/users"
                tone="brand"
                Icon={IconUsers}
              />
              <StatCard
                label="کاربران فعال"
                value={overview.data.stats.active_users}
                to="/admin/users"
                tone="success"
                Icon={IconUsers}
              />
              <StatCard
                label="کاربران غیرفعال"
                value={overview.data.stats.inactive_users}
                to="/admin/users"
                tone="neutral"
                Icon={IconUsers}
              />
              <StatCard
                label="تسک‌های باز"
                value={overview.data.stats.open_tasks}
                to="/admin/tasks"
                tone="info"
                Icon={IconTasks}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-[15px] font-bold text-ink-900">پروژه‌ها</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="پروژه‌های فعال"
                value={overview.data.stats.active_projects}
                to="/admin/projects"
                tone="brand"
                Icon={IconPackage}
              />
              <StatCard
                label="پروژه‌های تکمیل‌شده"
                value={overview.data.stats.completed_projects}
                to="/admin/projects"
                tone="success"
                Icon={IconPackage}
              />
              <StatCard
                label="پروژه‌های در داوری"
                value={overview.data.stats.disputed_projects}
                to="/admin/projects"
                tone="danger"
                Icon={IconWarning}
              />
              <StatCard
                label="پروژه‌های پرداخت‌شده"
                value={overview.data.stats.paid_projects}
                to="/admin/projects"
                tone="success"
                Icon={IconWallet}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-[15px] font-bold text-ink-900">شکایات</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="در انتظار بررسی"
                value={overview.data.stats.pending_complaints}
                to="/admin/complaints"
                tone="warning"
                Icon={IconWarning}
              />
              <StatCard
                label="در حال بررسی"
                value={overview.data.stats.reviewing_complaints}
                to="/admin/complaints"
                tone="info"
                Icon={IconWarning}
              />
              <StatCard
                label="پذیرفته‌شده"
                value={overview.data.stats.resolved_complaints}
                to="/admin/complaints"
                tone="success"
                Icon={IconWarning}
              />
              <StatCard
                label="رد شده"
                value={overview.data.stats.rejected_complaints}
                to="/admin/complaints"
                tone="neutral"
                Icon={IconWarning}
              />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="آخرین کاربران" />
              <CardBody className="space-y-2">
                {overview.data.activity.latest_users.map((user) => (
                  <Link
                    key={user.id}
                    to={`/admin/users/${user.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 p-3 text-[13px] transition-colors hover:bg-brand-50/40"
                  >
                    <span className="min-w-0 truncate font-semibold text-ink-800">
                      {user.full_name}
                    </span>
                    <span className="shrink-0 text-[11.5px] text-ink-400">
                      {formatDate(user.created_at)}
                    </span>
                  </Link>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="آخرین تسک‌ها" />
              <CardBody className="space-y-2">
                {overview.data.activity.latest_tasks.map((task) => (
                  <Link
                    key={task.id}
                    to={`/admin/tasks/${task.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 p-3 text-[13px] transition-colors hover:bg-brand-50/40"
                  >
                    <span className="min-w-0 truncate font-semibold text-ink-800">{task.title}</span>
                    <StatusBadge meta={metaOf(taskStatusMeta, task.status)} />
                  </Link>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="آخرین پروژه‌ها" />
              <CardBody className="space-y-2">
                {overview.data.activity.latest_projects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/admin/projects/${project.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 p-3 text-[13px] transition-colors hover:bg-brand-50/40"
                  >
                    <span className="min-w-0 flex-1 truncate font-semibold text-ink-800">
                      {project.title}
                    </span>
                    <span className="shrink-0 text-[11.5px] text-emerald-700">
                      {formatToman(project.amount)}
                    </span>
                    <StatusBadge meta={metaOf(projectStatusMeta, project.status)} />
                  </Link>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="آخرین شکایات" />
              <CardBody className="space-y-2">
                {overview.data.activity.latest_complaints.map((complaint) => (
                  <Link
                    key={complaint.id}
                    to={`/admin/complaints/${complaint.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 p-3 text-[13px] transition-colors hover:bg-brand-50/40"
                  >
                    <span className="min-w-0 flex-1 truncate font-semibold text-ink-800">
                      {complaint.title}
                    </span>
                    <span className="shrink-0 text-[11px] text-ink-400">
                      پروژه {toPersianDigits(complaint.project_id)}
                    </span>
                    <StatusBadge meta={metaOf(complaintStatusMeta, complaint.status)} />
                  </Link>
                ))}
              </CardBody>
            </Card>
          </section>
        </>
      ) : null}
    </div>
  )
}
