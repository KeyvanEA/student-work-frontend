import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StaticPageNotice } from '@/components/layout/StaticPageNotice'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconBell, IconMoney, IconTasks, IconUpload } from '@/components/ui/Icons'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { MOCK_NOTIFICATIONS, type MockNotification } from '@/lib/mock/staticData'

const ICONS = {
  application: IconTasks,
  delivery: IconUpload,
  payment: IconMoney,
  system: IconBell,
} as const

/** صفحه Static — endpoint /notifications در بک‌اند ثبت نشده است. */
export default function NotificationsPage() {
  useDocumentTitle('اعلان‌ها')
  const [items, setItems] = useState<MockNotification[]>(MOCK_NOTIFICATIONS)
  const unread = items.filter((item) => !item.read).length

  return (
    <div>
      <PageHeader
        title="اعلان‌ها"
        description={unread > 0 ? `${unread} اعلان خوانده‌نشده` : 'همه اعلان‌ها خوانده شده‌اند'}
        action={
          unread > 0 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setItems(items.map((item) => ({ ...item, read: true })))}
            >
              خواندن همه
            </Button>
          ) : undefined
        }
      />

      <StaticPageNotice>
        جدول <code className="font-mono text-[11px]">notifications</code> در دیتابیس وجود دارد ولی
        هیچ endpoint ای برای آن ثبت نشده است. علامت‌گذاری «خوانده‌شده» فقط در همین صفحه اثر دارد.
      </StaticPageNotice>

      {items.length === 0 ? (
        <EmptyState title="اعلانی ندارید" description="هر اتفاق مهمی در پروژه‌هایتان اینجا نمایش داده می‌شود." />
      ) : (
        <Card>
          <ul className="divide-y divide-ink-100">
            {items.map((item) => {
              const Icon = ICONS[item.kind]
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setItems(items.map((n) => (n.id === item.id ? { ...n, read: true } : n)))
                    }
                    className={cn(
                      'flex w-full items-start gap-3 p-4 text-start transition-colors hover:bg-ink-50',
                      !item.read && 'bg-brand-50/50',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-xl',
                        item.read ? 'bg-ink-100 text-ink-400' : 'bg-brand-100 text-brand-600',
                      )}
                    >
                      <Icon className="size-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[13.5px] font-bold text-ink-800">
                          {item.title}
                        </span>
                        {!item.read ? (
                          <span className="size-1.5 shrink-0 rounded-full bg-brand-600" aria-hidden />
                        ) : null}
                      </span>
                      <span className="mt-1 block text-[12.5px] leading-6 text-ink-500">
                        {item.body}
                      </span>
                      <span className="mt-1 block text-[11px] text-ink-400">{item.at}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </div>
  )
}
