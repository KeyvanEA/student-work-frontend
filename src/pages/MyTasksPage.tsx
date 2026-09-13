import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyTasks } from '@/api/tasks'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { PageHeader } from '@/components/layout/PageHeader'
import { LinkButton } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { IconBack, IconClock, IconMoney, IconPlus } from '@/components/ui/Icons'
import { Pagination } from '@/components/ui/Pagination'
import { SkeletonList } from '@/components/ui/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { deadlineInfo, formatDate, formatToman, toPersianDigits } from '@/lib/format'
import { metaOf, taskStatusMeta } from '@/lib/labels'

/** تسک‌های ثبت‌شدهٔ کاربر — GET /api/tasks/mine */
export default function MyTasksPage() {
  useDocumentTitle('تسک‌های ثبت‌شده')
  const [page, setPage] = useState(1)

  const loader = useCallback((signal: AbortSignal) => fetchMyTasks(page, signal), [page])
  const tasks = useApiResource(loader, [page])

  const items = tasks.data?.data ?? []

  return (
    <div className="space-y-4">
      <PageHeader
        title="تسک‌های ثبت‌شده"
        description="همهٔ تسک‌هایی که خودتان ثبت کرده‌اید، در هر وضعیتی"
        action={
          <LinkButton to="/tasks/new" size="sm" icon={<IconPlus className="size-4" />}>
            ثبت تسک
          </LinkButton>
        }
      />

      {tasks.loading ? (
        <SkeletonList count={4} />
      ) : tasks.error ? (
        <ErrorState error={tasks.error} onRetry={tasks.reload} />
      ) : items.length === 0 ? (
        <EmptyState
          title="هنوز تسکی ثبت نکرده‌اید"
          description="اولین کار دانشجویی‌تان را با بودجه و مهلت مشخص ثبت کنید."
          action={
            <LinkButton to="/tasks/new" size="sm">
              ثبت اولین تسک
            </LinkButton>
          }
        />
      ) : (
        <>
          <p className="text-[12.5px] text-ink-500">
            {toPersianDigits(tasks.data?.total ?? items.length)} تسک
          </p>

          <div className={tasks.refreshing ? 'space-y-3 opacity-60' : 'space-y-3'}>
            {items.map((task) => {
              const deadline = deadlineInfo(task.deadline)
              return (
                <article
                  key={task.id}
                  className="rounded-2xl border border-ink-200/80 bg-white p-4 shadow-[var(--shadow-soft)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="min-w-0 flex-1 truncate text-[15px] font-bold text-ink-900">
                      {task.title}
                    </h3>
                    <StatusBadge meta={metaOf(taskStatusMeta, task.status)} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-700">
                      <IconMoney className="size-4" />
                      {formatToman(task.budget)}
                    </span>
                    <span
                      className={
                        deadline.tone === 'danger'
                          ? 'inline-flex items-center gap-1.5 text-[12px] text-rose-600'
                          : 'inline-flex items-center gap-1.5 text-[12px] text-ink-400'
                      }
                    >
                      <IconClock className="size-4" />
                      {formatDate(task.deadline)} · {deadline.label}
                    </span>
                    <span className="text-[11.5px] text-ink-400">
                      ثبت {formatDate(task.created_at)}
                    </span>
                  </div>

                  <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 pt-3">
                    <Link
                      to={`/tasks/${task.id}/applications`}
                      className="text-[12.5px] font-semibold text-ink-500 hover:text-brand-600"
                    >
                      درخواست‌های همکاری
                    </Link>
                    <Link
                      to={`/tasks/${task.id}`}
                      className="inline-flex items-center gap-1 text-[12.5px] font-bold text-brand-600 hover:text-brand-700"
                    >
                      مشاهده تسک
                      <IconBack className="size-4" />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>

          {tasks.data ? (
            <Pagination
              currentPage={tasks.data.current_page}
              lastPage={tasks.data.last_page}
              total={tasks.data.total}
              disabled={tasks.refreshing}
              onChange={(next) => {
                setPage(next)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
