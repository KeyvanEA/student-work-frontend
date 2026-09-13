import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { IconClock, IconMoney } from '@/components/ui/Icons'
import { deadlineInfo, formatDate, formatToman, toPersianDigits } from '@/lib/format'
import { metaOf, paymentStatusMeta, projectStatusMeta } from '@/lib/labels'
import { StatusBadge } from './StatusBadge'
import type { ProjectListItem } from '@/types/models'

const ROLE_LABEL: Record<ProjectListItem['role'], string> = {
  worker: 'نقش شما: کارجو',
  employer: 'نقش شما: کارفرما',
}

/** کارت یک پروژه در فهرست GET /api/projects */
export function ProjectCard({ project }: { project: ProjectListItem }) {
  const deadline = deadlineInfo(project.deadline)

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group block rounded-2xl border border-ink-200/80 bg-white p-4 shadow-[var(--shadow-soft)] transition-all hover:border-brand-200 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="flex items-start gap-3">
        <Avatar name={project.other_user?.full_name} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold text-ink-900 group-hover:text-brand-700">
            {project.title}
          </h3>
          <p className="mt-0.5 truncate text-[12.5px] text-ink-500">
            {project.role === 'worker' ? 'کارفرما' : 'کارجو'}:{' '}
            {project.other_user?.full_name ?? '—'}
          </p>
        </div>
        <span className="shrink-0 text-[11px] text-ink-400">
          #{toPersianDigits(project.id)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <StatusBadge meta={metaOf(projectStatusMeta, project.status)} />
        <StatusBadge meta={metaOf(paymentStatusMeta, project.payment_status)} />
        <span className="rounded-full bg-ink-100 px-2.5 py-1 text-[11.5px] font-semibold text-ink-600">
          {ROLE_LABEL[project.role]}
        </span>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-ink-100 pt-3">
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-700">
          <IconMoney className="size-4" />
          {formatToman(project.amount)}
        </span>
        <span
          className={
            deadline.tone === 'danger'
              ? 'inline-flex items-center gap-1.5 text-[12px] text-rose-600'
              : 'inline-flex items-center gap-1.5 text-[12px] text-ink-400'
          }
        >
          <IconClock className="size-4" />
          {formatDate(project.deadline)} · {deadline.label}
        </span>
      </div>
    </Link>
  )
}
