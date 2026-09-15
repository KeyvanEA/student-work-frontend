import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from './StatusBadge'
import { applicationStatusMeta, metaOf } from '@/lib/labels'
import { formatRelative, toPersianDigits } from '@/lib/format'
import type { Application } from '@/types/models'

export function ApplicationCard({
  application,
  onAccept,
  onReject,
  onOpen,
  onOpenProfile,
  busy,
}: {
  application: Application
  onAccept?: () => void
  onReject?: () => void
  onOpen?: () => void
  /** باز کردن پروفایل متقاضی از همان داده‌ای که بک‌اند در فهرست درخواست‌ها داده است */
  onOpenProfile?: () => void
  busy?: boolean
}) {
  return (
    <article className="rounded-2xl border border-ink-200/80 bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start gap-3">
        <Avatar name={application.user?.full_name} src={application.user?.avatar} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {onOpenProfile ? (
              <button
                type="button"
                onClick={onOpenProfile}
                className="truncate text-[14.5px] font-bold text-ink-900 hover:text-brand-700 hover:underline"
              >
                {application.user?.full_name ?? `کاربر #${toPersianDigits(application.user_id)}`}
              </button>
            ) : (
              <h3 className="truncate text-[14.5px] font-bold text-ink-900">
                {application.user?.full_name ?? `کاربر #${toPersianDigits(application.user_id)}`}
              </h3>
            )}
            <StatusBadge meta={metaOf(applicationStatusMeta, application.status)} />
          </div>
          <p className="mt-0.5 text-[11.5px] text-ink-400">
            ارسال {formatRelative(application.created_at)} · شناسه درخواست{' '}
            {toPersianDigits(application.id)}
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 whitespace-pre-line text-[13px] leading-7 text-ink-600">
        {application.description}
      </p>

      {onAccept || onReject || onOpen ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-100 pt-3">
          {onAccept ? (
            <Button size="sm" variant="success" onClick={onAccept} disabled={busy}>
              پذیرش و شروع پروژه
            </Button>
          ) : null}
          {onReject ? (
            <Button size="sm" variant="secondary" onClick={onReject} disabled={busy}>
              رد کردن
            </Button>
          ) : null}
          {onOpen ? (
            <Button size="sm" variant="ghost" onClick={onOpen} disabled={busy}>
              مشاهده جزئیات
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
