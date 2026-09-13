import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { fetchTasks } from '@/api/tasks'
import { useAuth } from '@/auth/AuthContext'
import { HeroSlider } from '@/components/home/HeroSlider'
import { TaskCard } from '@/components/domain/TaskCard'
import { LinkButton } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { IconPlus, IconSearch, IconTasks, IconUpload, IconWallet } from '@/components/ui/Icons'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/** مراحل کار — کمک می‌کند بازدیدکنندهٔ تازه‌وارد مدل محصول را بفهمد */
const STEPS = [
  {
    Icon: IconPlus,
    title: 'تسک را ثبت کن',
    body: 'عنوان، شرح کار، بودجه و مهلت را مشخص کن.',
  },
  {
    Icon: IconSearch,
    title: 'کارجو را انتخاب کن',
    body: 'درخواست‌های همکاری را ببین و یکی را بپذیر تا پروژه ساخته شود.',
  },
  {
    Icon: IconUpload,
    title: 'تحویل بگیر',
    body: 'کارجو فایل تحویل را ثبت می‌کند و تو آن را بررسی می‌کنی.',
  },
  {
    Icon: IconWallet,
    title: 'دستمزد را پرداخت کن',
    body: 'بعد از تایید تحویل، دستمزد ثبت و فایل‌ها قابل دانلود می‌شود.',
  },
]

export default function HomePage() {
  useDocumentTitle()
  const { isAuthenticated } = useAuth()

  const loadTasks = useCallback((signal: AbortSignal) => fetchTasks(1, signal), [])
  const tasks = useApiResource(loadTasks, [])

  /** بک‌اند در هر صفحه ۱۰ تسک می‌دهد؛ در Home فقط ۶ تای اول را نشان می‌دهیم. */
  const latest = tasks.data?.data.slice(0, 6) ?? []

  return (
    <>
      <HeroSlider />

      {/* آخرین تسک‌های باز — داده واقعی از GET /api/tasks */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-ink-900 sm:text-2xl">آخرین تسک‌های باز</h2>
            <p className="mt-1.5 text-[13.5px] text-ink-500">
              کارهایی که همین حالا منتظر انجام‌دهنده هستند.
            </p>
          </div>
          <Link
            to="/tasks"
            className="text-[13px] font-bold text-brand-600 transition-colors hover:text-brand-700"
          >
            مشاهده همه تسک‌ها ←
          </Link>
        </div>

        {tasks.loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : tasks.error ? (
          <ErrorState error={tasks.error} onRetry={tasks.reload} />
        ) : latest.length === 0 ? (
          <EmptyState
            title="فعلاً تسک بازی وجود ندارد"
            description="اولین نفری باشید که یک کار دانشجویی ثبت می‌کند."
            action={
              <LinkButton to="/tasks/new" size="sm">
                ثبت تسک
              </LinkButton>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}

        <div className="mt-7 flex justify-center">
          <LinkButton to="/tasks" variant="outline" size="md" icon={<IconTasks className="size-[18px]" />}>
            مشاهده همه تسک‌ها
          </LinkButton>
        </div>
      </section>

      {/* چطور کار می‌کند */}
      <section className="border-y border-ink-200 bg-ink-50/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-xl font-extrabold text-ink-900 sm:text-2xl">چطور کار می‌کند؟</h2>
          <p className="mt-1.5 text-[13.5px] text-ink-500">
            چهار قدم ساده از ثبت تسک تا پرداخت دستمزد.
          </p>

          <ol className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-[var(--shadow-soft)]"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <step.Icon className="size-[22px]" />
                </span>
                <p className="mt-4 text-[11.5px] font-bold text-brand-600">
                  قدم {index + 1}
                </p>
                <p className="mt-1 text-[14.5px] font-bold text-ink-900">{step.title}</p>
                <p className="mt-1.5 text-[12.5px] leading-7 text-ink-500">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA اصلی */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-6 sm:p-8">
            <h3 className="text-[18px] font-extrabold text-ink-900">کاری دارید که باید انجام شود؟</h3>
            <p className="mt-2 text-[13.5px] leading-7 text-ink-600">
              تسک را با بودجه و مهلت مشخص ثبت کنید و درخواست‌های همکاری را دریافت کنید.
            </p>
            <div className="mt-5">
              <LinkButton to="/tasks/new" size="md" icon={<IconPlus className="size-[18px]" />}>
                ثبت تسک
              </LinkButton>
            </div>
          </div>

          <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <h3 className="text-[18px] font-extrabold text-ink-900">دنبال کار دانشجویی هستید؟</h3>
            <p className="mt-2 text-[13.5px] leading-7 text-ink-600">
              تسک‌های باز را ببینید، درخواست همکاری بفرستید و پروژه‌تان را شروع کنید.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <LinkButton to="/tasks" variant="outline" size="md" icon={<IconSearch className="size-[18px]" />}>
                پیدا کردن کار
              </LinkButton>
              {!isAuthenticated ? (
                <LinkButton to="/login" variant="ghost" size="md">
                  ورود به حساب
                </LinkButton>
              ) : (
                <LinkButton to="/dashboard" variant="ghost" size="md">
                  داشبورد من
                </LinkButton>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
