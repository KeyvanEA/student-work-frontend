import { useCallback, useMemo, useState } from 'react'
import { fetchTasks } from '@/api/tasks'
import { TaskCard } from '@/components/domain/TaskCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { LinkButton } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { IconPlus, IconSearch } from '@/components/ui/Icons'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { SkeletonList } from '@/components/ui/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { toPersianDigits } from '@/lib/format'

export default function TasksPage() {
  useDocumentTitle('تسک‌ها')
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')

  const loader = useCallback((signal: AbortSignal) => fetchTasks(page, signal), [page])
  const tasks = useApiResource(loader, [page])

  const visible = useMemo(() => {
    const items = tasks.data?.data ?? []
    const term = query.trim()
    if (!term) return items
    return items.filter((task) => task.title.includes(term) || task.user?.full_name?.includes(term))
  }, [tasks.data, query])

  return (
    <div>
      <PageHeader
        title="تسک‌های باز"
        description={
          tasks.data
            ? `${toPersianDigits(tasks.data.total)} تسک باز برای همکاری`
            : 'کارهای دانشجویی که منتظر انجام‌دهنده هستند'
        }
        action={
          <LinkButton to="/tasks/new" size="sm" icon={<IconPlus className="size-4" />}>
            ثبت تسک
          </LinkButton>
        }
      />

      <div className="relative mb-4">
        <IconSearch className="pointer-events-none absolute end-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="جستجو در عنوان یا نام کارفرما…"
          className="pe-11"
          aria-label="جستجوی تسک"
        />
        {/* TODO(backend): GET /api/tasks هنوز پارامتر search/filter ندارد؛
            این جستجو فقط روی همین صفحه از نتایج اعمال می‌شود. */}
      </div>

      {tasks.loading ? (
        <SkeletonList count={5} />
      ) : tasks.error ? (
        <ErrorState error={tasks.error} onRetry={tasks.reload} />
      ) : visible.length === 0 ? (
        <EmptyState
          title={query ? 'نتیجه‌ای پیدا نشد' : 'هیچ تسک بازی وجود ندارد'}
          description={
            query
              ? 'عبارت دیگری را امتحان کنید. جستجو فعلاً فقط روی همین صفحه انجام می‌شود.'
              : 'وقتی کاربری تسک جدیدی ثبت کند، اینجا نمایش داده می‌شود.'
          }
          action={<LinkButton to="/tasks/new" size="sm">ثبت اولین تسک</LinkButton>}
        />
      ) : (
        <>
          <div className={tasks.refreshing ? 'grid gap-3 opacity-60 sm:grid-cols-2' : 'grid gap-3 sm:grid-cols-2'}>
            {visible.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          {tasks.data ? (
            <div className="mt-5">
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
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
