import { useCallback, useEffect, useState } from 'react'
import { fetchNotifications } from '@/api/notifications'
import { useDashboardStats } from '@/dashboard/DashboardStatsContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { IconBell } from '@/components/ui/Icons'
import { Pagination } from '@/components/ui/Pagination'
import { SkeletonList } from '@/components/ui/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/cn'
import { formatDateTime, formatRelative, toPersianDigits } from '@/lib/format'

/**
 * اعلان‌ها — GET /api/notifications (صفحه‌بندی ۱۰تایی).
 *
 * ⚠️ بک‌اند به‌محض بازگرداندن هر صفحه، اعلان‌های خوانده‌نشدهٔ همان صفحه را
 * `is_read = true` می‌کند. پس `unread_count` مقدار «قبل از باز کردن صفحه» است و
 * ردیف‌هایی که اینجا خوانده‌نشده دیده می‌شوند، در سرور تازه read شده‌اند.
 * دکمهٔ «خواندن همه» ساخته نشده چون endpoint ای برای آن وجود ندارد.
 */
export default function NotificationsPage() {
  useDocumentTitle('اعلانات')
  const [page, setPage] = useState(1)
  const { reload: reloadStats } = useDashboardStats()

  const loader = useCallback((signal: AbortSignal) => fetchNotifications(page, signal), [page])
  const notifications = useApiResource(loader, [page])

  // بعد از اینکه بک‌اند اعلان‌های این صفحه را read کرد، شمارندهٔ داشبورد باید تازه شود
  const loaded = Boolean(notifications.data)
  useEffect(() => {
    if (loaded) reloadStats()
  }, [loaded, page, reloadStats])

  const items = notifications.data?.notifications.data ?? []
  const unread = notifications.data?.unread_count ?? 0
  const pagination = notifications.data?.notifications

  return (
    <div className="space-y-4">
      <PageHeader
        title="اعلانات"
        description={
          notifications.data
            ? unread > 0
              ? `${toPersianDigits(unread)} اعلان خوانده‌نشده هنگام باز کردن این صفحه`
              : 'اعلان خوانده‌نشده‌ای نداشتید'
            : 'رویدادهای پروژه‌ها، درخواست‌ها و پرداخت‌ها'
        }
      />

      {unread > 0 ? (
        <Alert tone="info">
          اعلان‌های این صفحه با باز شدن آن به‌صورت خودکار «خوانده‌شده» علامت خوردند.
        </Alert>
      ) : null}

      {notifications.loading ? (
        <SkeletonList count={4} />
      ) : notifications.error ? (
        <ErrorState error={notifications.error} onRetry={notifications.reload} />
      ) : items.length === 0 ? (
        <EmptyState
          title="اعلانی ندارید"
          description="هر اتفاق مهمی در تسک‌ها و پروژه‌هایتان اینجا نمایش داده می‌شود."
          icon={<IconBell className="size-6" />}
        />
      ) : (
        <>
          <Card className={notifications.refreshing ? 'opacity-60' : undefined}>
            <ul className="divide-y divide-ink-100">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={cn('flex items-start gap-3 p-4', !item.is_read && 'bg-brand-50/50')}
                >
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-xl',
                      item.is_read ? 'bg-ink-100 text-ink-400' : 'bg-brand-100 text-brand-600',
                    )}
                  >
                    <IconBell className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[13.5px] font-bold text-ink-800">{item.title}</p>
                      {!item.is_read ? (
                        <span className="size-1.5 shrink-0 rounded-full bg-brand-600" aria-hidden />
                      ) : null}
                    </div>
                    <p className="mt-1 text-[12.5px] leading-6 text-ink-500">{item.message}</p>
                    <p className="mt-1 text-[11px] text-ink-400" title={formatDateTime(item.created_at)}>
                      {formatRelative(item.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {pagination ? (
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              total={pagination.total}
              disabled={notifications.refreshing}
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
