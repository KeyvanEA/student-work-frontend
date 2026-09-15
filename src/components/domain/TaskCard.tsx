import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { IconMoney, IconClock } from '@/components/ui/Icons'
import { formatRelative, formatToman } from '@/lib/format'
import type { TaskListItem } from '@/types/models'

export function TaskCard({ task }: { task: TaskListItem }) {
  return (
    <Link
      to={`/tasks/${task.id}`}
      className="group block rounded-2xl border border-ink-200/80 bg-white p-4 shadow-[var(--shadow-soft)] transition-all hover:border-brand-200 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="flex items-start gap-3">
        {/* GET /api/tasks فقط user:id,full_name را eager-load می‌کند — avatar در فهرست موجود نیست */}
        <Avatar name={task.user?.full_name} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold text-ink-900 group-hover:text-brand-700">
            {task.title}
          </h3>
          <p className="mt-0.5 truncate text-[12.5px] text-ink-500">
            {task.user?.full_name ?? 'کاربر استودنت‌ورک'}
          </p>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-ink-100 pt-3">
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-700">
          <IconMoney className="size-4" />
          {formatToman(task.budget)}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-400">
          <IconClock className="size-4" />
          {formatRelative(task.created_at)}
        </span>
      </div>
    </Link>
  )
}
