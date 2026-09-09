import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { fetchTasks } from '@/api/tasks'
import { useAuth } from '@/auth/AuthContext'
import { RecentEntries } from '@/components/domain/RecentEntries'
import { TaskCard } from '@/components/domain/TaskCard'
import { LinkButton } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import {
  IconBriefcase,
  IconPlus,
  IconSparkle,
  IconTasks,
  IconUser,
} from '@/components/ui/Icons'
import { SkeletonList } from '@/components/ui/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const QUICK_ACTIONS = [
  { to: '/tasks/new', label: 'ثبت تسک جدید', description: 'کار خود را اعلام کنید', Icon: IconPlus },
  { to: '/tasks', label: 'مرور تسک‌ها', description: 'کار مناسب پیدا کنید', Icon: IconTasks },
  { to: '/projects', label: 'پروژه‌های من', description: 'پیگیری و تحویل', Icon: IconBriefcase },
  { to: '/profile', label: 'پروفایل من', description: 'مهارت‌ها و رزومه', Icon: IconUser },
]

export default function HomePage() {
  useDocumentTitle('خانه')
  const { user, isAuthenticated } = useAuth()

  const loadTasks = useCallback((signal: AbortSignal) => fetchTasks(1, signal), [])
  const tasks = useApiResource(loadTasks, [])

  const latest = tasks.data?.data.slice(0, 4) ?? []

  return (
    <div className="space-y-6">
      {/* بنر خوش‌آمد */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-bl from-brand-600 to-brand-800 p-5 text-white shadow-[var(--shadow-lift)] sm:p-7">
        <p className="text-[13px] font-medium text-brand-100">
          {isAuthenticated && user ? `سلام ${user.full_name} 👋` : 'به استودنت‌ورک خوش آمدید'}
        </p>
        <h1 className="mt-1.5 text-xl font-extrabold leading-9 sm:text-2xl">
          کارهای دانشجویی‌ات را بسپار،
          <br className="sm:hidden" /> یا برای دیگران انجام بده.
        </h1>
        <p className="mt-2 max-w-md text-[13px] leading-7 text-brand-100">
          تسک ثبت کن، درخواست همکاری بگیر، پروژه را تحویل بگیر و دستمزد را پرداخت کن — همه در یک جا.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <LinkButton to="/tasks/new" variant="secondary" size="md" icon={<IconPlus className="size-4" />}>
            ثبت تسک
          </LinkButton>
          <LinkButton
            to="/tasks"
            variant="ghost"
            size="md"
            className="!text-white ring-1 ring-inset ring-white/30 hover:!bg-white/10"
          >
            دیدن تسک‌ها
          </LinkButton>
        </div>
      </section>

      {/* دسترسی سریع */}
      <section>
        <h2 className="mb-3 text-[15px] font-bold text-ink-900">دسترسی سریع</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group rounded-2xl border border-ink-200/80 bg-white p-4 shadow-[var(--shadow-soft)] transition-all hover:border-brand-200 hover:shadow-[var(--shadow-lift)]"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <action.Icon className="size-5" />
              </span>
              <p className="mt-3 text-[13.5px] font-bold text-ink-800">{action.label}</p>
              <p className="mt-0.5 text-[11.5px] text-ink-400">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* آخرین تسک‌ها — داده واقعی از GET /api/tasks */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-ink-900">آخرین تسک‌های باز</h2>
          <Link to="/tasks" className="text-[12.5px] font-semibold text-brand-600 hover:underline">
            همه تسک‌ها
          </Link>
        </div>

        {tasks.loading ? (
          <SkeletonList count={3} />
        ) : tasks.error ? (
          <ErrorState error={tasks.error} onRetry={tasks.reload} />
        ) : latest.length === 0 ? (
          <EmptyState
            title="فعلاً تسک بازی وجود ندارد"
            description="اولین نفری باشید که یک کار دانشجویی ثبت می‌کند."
            action={<LinkButton to="/tasks/new" size="sm">ثبت تسک</LinkButton>}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {latest.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>

      {/* ادامه کار — از دفترچه محلی شناسه‌ها */}
      {isAuthenticated ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader
              title="پروژه‌های اخیر شما"
              description="پروژه‌هایی که در این مرورگر باز کرده‌اید"
            />
            <CardBody>
              <RecentEntries
                kind="project"
                emptyTitle="هنوز پروژه‌ای باز نکرده‌اید"
                emptyDescription="بعد از پذیرش یک درخواست همکاری، از صفحه «پروژه‌ها» با شناسه پروژه وارد شوید."
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="تحویل‌های اخیر" description="تحویل‌هایی که در این مرورگر دیده‌اید" />
            <CardBody>
              <RecentEntries
                kind="delivery"
                emptyTitle="هنوز تحویلی باز نکرده‌اید"
                emptyDescription="از صفحه پروژه، تحویل ثبت‌شده را باز کنید."
              />
            </CardBody>
          </Card>
        </section>
      ) : (
        <Card className="border-brand-200 bg-brand-50/50">
          <CardBody className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <IconSparkle className="mt-0.5 size-5 shrink-0 text-brand-600" />
              <div>
                <p className="text-[14px] font-bold text-ink-900">برای همکاری وارد شوید</p>
                <p className="mt-0.5 text-[12.5px] text-ink-500">
                  دیدن تسک‌ها آزاد است، اما ارسال درخواست همکاری نیاز به ورود دارد.
                </p>
              </div>
            </div>
            <LinkButton to="/login" size="sm">ورود</LinkButton>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
