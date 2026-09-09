import { useState } from 'react'
import { IdLookupCard } from '@/components/domain/IdLookupCard'
import { RecentEntries } from '@/components/domain/RecentEntries'
import { PageHeader } from '@/components/layout/PageHeader'
import { StaticPageNotice } from '@/components/layout/StaticPageNotice'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

type Tab = 'tasks' | 'applications'

/**
 * «تسک‌های من» و «درخواست‌های من».
 * ⚠️ بک‌اند endpoint لیستی برای هیچ‌کدام ندارد
 * (نه GET /users/me/tasks و نه GET /users/me/applications).
 */
export default function MyWorkPage() {
  useDocumentTitle('کارهای من')
  const [tab, setTab] = useState<Tab>('tasks')

  return (
    <div className="space-y-4">
      <PageHeader title="کارهای من" description="تسک‌هایی که ثبت کرده‌اید و درخواست‌هایی که فرستاده‌اید" />

      <StaticPageNotice>
        بک‌اند فهرست «تسک‌های من» و «درخواست‌های من» را ارائه نمی‌دهد. فهرست زیر از شناسه‌هایی ساخته
        می‌شود که در همین مرورگر واقعاً از API باز شده‌اند؛ با کلیک روی هرکدام، صفحهٔ کاملاً Dynamic
        آن باز می‌شود.
        {/* TODO(backend): GET /api/users/me/tasks و GET /api/users/me/applications */}
      </StaticPageNotice>

      <div className="flex gap-1 rounded-xl bg-ink-100 p-1">
        {(
          [
            { key: 'tasks', label: 'تسک‌های من' },
            { key: 'applications', label: 'درخواست‌های من' },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            aria-pressed={tab === item.key}
            className={cn(
              'flex-1 rounded-lg py-2 text-[13px] font-bold transition-colors',
              tab === item.key ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500 hover:text-ink-700',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'tasks' ? (
        <>
          <IdLookupCard
            title="باز کردن تسک با شناسه"
            description="اطلاعات تسک از API واقعی خوانده می‌شود."
            label="شناسه تسک"
            placeholder="مثلاً ۱"
            basePath="/tasks"
          />
          <Card>
            <CardHeader title="تسک‌های اخیر" description="تسک‌هایی که در این مرورگر باز کرده‌اید" />
            <CardBody>
              <RecentEntries
                kind="task"
                emptyTitle="هنوز تسکی باز نکرده‌اید"
                emptyDescription="از صفحه «تسک‌ها» یک تسک را باز کنید یا تسک جدیدی ثبت کنید."
              />
            </CardBody>
          </Card>
        </>
      ) : (
        <>
          <IdLookupCard
            title="باز کردن درخواست با شناسه"
            description="توجه: بک‌اند فقط به صاحب تسک اجازهٔ مشاهدهٔ جزئیات درخواست را می‌دهد."
            label="شناسه درخواست همکاری"
            placeholder="مثلاً ۱"
            basePath="/applications"
          />
          <Card>
            <CardHeader title="درخواست‌های اخیر" description="درخواست‌هایی که در این مرورگر دیده‌اید" />
            <CardBody>
              <RecentEntries
                kind="application"
                emptyTitle="هنوز درخواستی ثبت یا باز نکرده‌اید"
                emptyDescription="از صفحهٔ یک تسک، درخواست همکاری بفرستید."
              />
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}
