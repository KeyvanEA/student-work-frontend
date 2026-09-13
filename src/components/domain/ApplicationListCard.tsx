import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { IconBack, IconTasks } from '@/components/ui/Icons'
import { formatRelative, toPersianDigits } from '@/lib/format'
import { applicationStatusMeta, metaOf } from '@/lib/labels'
import { StatusBadge } from './StatusBadge'
import type { Application, ApplicationListType } from '@/types/models'

/**
 * کارت یک درخواست همکاری در فهرست GET /api/applications?type=…
 *
 * ⚠️ بک‌اند در حالت `sent` رابطهٔ `user` را همان ارسال‌کننده (خود کاربر) می‌دهد و
 * نام کارفرما را برنمی‌گرداند (فقط `task.user_id`). بنابراین در این حالت به‌جای
 * جعل نام، عنوان تسک برجسته می‌شود.
 */
export function ApplicationListCard({
  application,
  type,
}: {
  application: Application
  type: ApplicationListType
}) {
  const meta = metaOf(applicationStatusMeta, application.status)
  const counterpart = type === 'received' ? application.user?.full_name : undefined
  const taskTitle = application.task?.title ?? `تسک ${toPersianDigits(application.task_id)}`

  return (
    <article className="rounded-2xl border border-ink-200/80 bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start gap-3">
        {type === 'received' ? (
          <Avatar name={counterpart} size="md" />
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-500">
            <IconTasks className="size-5" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[14.5px] font-bold text-ink-900">
              {type === 'received' ? (counterpart ?? `کاربر ${toPersianDigits(application.user_id)}`) : taskTitle}
            </h3>
            <StatusBadge meta={meta} />
          </div>

          <p className="mt-0.5 truncate text-[12px] text-ink-500">
            {type === 'received' ? (
              <>برای تسک: {taskTitle}</>
            ) : (
              <>کارفرما: کاربر {toPersianDigits(application.task?.user_id ?? '—')}</>
            )}
          </p>

          <p className="mt-0.5 text-[11.5px] text-ink-400">
            ارسال {formatRelative(application.created_at)} · شناسه درخواست{' '}
            {toPersianDigits(application.id)}
          </p>
        </div>
      </div>

      {application.description ? (
        <p className="mt-3 line-clamp-2 whitespace-pre-line text-[13px] leading-7 text-ink-600">
          {application.description}
        </p>
      ) : null}

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 pt-3">
        <Link
          to={`/tasks/${application.task_id}`}
          className="text-[12.5px] font-semibold text-ink-500 hover:text-brand-600"
        >
          مشاهده تسک
        </Link>
        <Link
          to={`/applications/${application.id}`}
          className="inline-flex items-center gap-1 text-[12.5px] font-bold text-brand-600 hover:text-brand-700"
        >
          جزئیات درخواست
          <IconBack className="size-4" />
        </Link>
      </div>
    </article>
  )
}
