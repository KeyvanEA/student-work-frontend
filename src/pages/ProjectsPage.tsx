import { useCallback, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { fetchProjects } from '@/api/projects'
import { ProjectCard } from '@/components/domain/ProjectCard'
import { SegmentedTabs } from '@/components/domain/SegmentedTabs'
import { PageHeader } from '@/components/layout/PageHeader'
import { LinkButton } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Pagination } from '@/components/ui/Pagination'
import { SkeletonList } from '@/components/ui/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { toPersianDigits } from '@/lib/format'
import type { ProjectListStatus, ProjectRole } from '@/types/models'

const STATUSES: ProjectListStatus[] = ['active', 'history']
const ROLES: ProjectRole[] = ['worker', 'employer']

const STATUS_TITLE: Record<ProjectListStatus, string> = {
  active: 'پروژه‌های فعال',
  history: 'تاریخچه پروژه‌ها',
}

const STATUS_DESCRIPTION: Record<ProjectListStatus, string> = {
  active: 'در حال انجام، تحویل‌شده، نیازمند اصلاح، یا تکمیل‌شدهٔ پرداخت‌نشده',
  history: 'پروژه‌های لغو‌شده و پروژه‌های تکمیل‌شده‌ای که دستمزدشان پرداخت شده',
}

const ROLE_LABEL: Record<ProjectRole, string> = {
  worker: 'کارجو',
  employer: 'کارفرما',
}

const EMPTY_TEXT: Record<ProjectListStatus, Record<ProjectRole, string>> = {
  active: {
    worker: 'پروژهٔ فعالی به‌عنوان کارجو ندارید. با پذیرفته‌شدن یکی از درخواست‌های همکاری، پروژه ساخته می‌شود.',
    employer: 'پروژهٔ فعالی به‌عنوان کارفرما ندارید. با پذیرش یک درخواست همکاری روی تسک‌هایتان، پروژه ساخته می‌شود.',
  },
  history: {
    worker: 'هنوز پروژهٔ پایان‌یافته‌ای به‌عنوان کارجو ندارید.',
    employer: 'هنوز پروژهٔ پایان‌یافته‌ای به‌عنوان کارفرما ندارید.',
  },
}

function isStatus(value: string | undefined): value is ProjectListStatus {
  return STATUSES.includes(value as ProjectListStatus)
}

function isRole(value: string | undefined): value is ProjectRole {
  return ROLES.includes(value as ProjectRole)
}

/** فهرست پروژه‌ها — GET /api/projects?role=…&status=… */
export default function ProjectsPage() {
  const { status, role } = useParams()
  const [page, setPage] = useState(1)

  const validStatus = isStatus(status) ? status : null
  const validRole = isRole(role) ? role : null

  const loader = useCallback(
    (signal: AbortSignal) =>
      fetchProjects(
        { role: validRole ?? 'worker', status: validStatus ?? 'active', page },
        signal,
      ),
    [validRole, validStatus, page],
  )
  const projects = useApiResource(loader, [validRole, validStatus, page], {
    enabled: Boolean(validRole && validStatus),
  })

  useDocumentTitle(
    validStatus && validRole
      ? `${STATUS_TITLE[validStatus]} — ${ROLE_LABEL[validRole]}`
      : 'پروژه‌ها',
  )

  if (!validStatus || !validRole) {
    return <Navigate to="/projects/active/worker" replace />
  }

  const items = projects.data?.data ?? []

  return (
    <div className="space-y-4">
      <PageHeader
        title={STATUS_TITLE[validStatus]}
        description={STATUS_DESCRIPTION[validStatus]}
      />

      <SegmentedTabs
        ariaLabel="وضعیت پروژه"
        items={STATUSES.map((item) => ({
          to: `/projects/${item}/${validRole}`,
          label: STATUS_TITLE[item],
          active: item === validStatus,
        }))}
      />

      <SegmentedTabs
        ariaLabel="نقش شما در پروژه"
        items={ROLES.map((item) => ({
          to: `/projects/${validStatus}/${item}`,
          label: `به‌عنوان ${ROLE_LABEL[item]}`,
          active: item === validRole,
        }))}
      />

      {projects.loading ? (
        <SkeletonList count={3} />
      ) : projects.error ? (
        <ErrorState error={projects.error} onRetry={projects.reload} />
      ) : items.length === 0 ? (
        <EmptyState
          title="پروژه‌ای پیدا نشد"
          description={EMPTY_TEXT[validStatus][validRole]}
          action={
            validStatus === 'active' ? (
              <LinkButton to={validRole === 'worker' ? '/tasks' : '/tasks/new'} size="sm">
                {validRole === 'worker' ? 'مرور تسک‌های باز' : 'ثبت تسک جدید'}
              </LinkButton>
            ) : undefined
          }
        />
      ) : (
        <>
          <p className="text-[12.5px] text-ink-500">
            {toPersianDigits(projects.data?.total ?? items.length)} پروژه
          </p>

          <div className={projects.refreshing ? 'space-y-3 opacity-60' : 'space-y-3'}>
            {items.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {projects.data ? (
            <Pagination
              currentPage={projects.data.current_page}
              lastPage={projects.data.last_page}
              total={projects.data.total}
              disabled={projects.refreshing}
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
