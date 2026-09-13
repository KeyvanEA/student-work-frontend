import { apiRequest } from './client'
import { endpoints } from './endpoints'
import type {
  Paginated,
  Project,
  ProjectListItem,
  ProjectListStatus,
  ProjectRole,
} from '@/types/models'

/**
 * GET /api/projects?role=worker|employer&status=active|history
 * بک‌اند برای هر آیتم نقش کاربر جاری و طرف مقابل را خودش محاسبه می‌کند.
 */
export async function fetchProjects(
  params: { role: ProjectRole; status: ProjectListStatus; page?: number },
  signal?: AbortSignal,
): Promise<Paginated<ProjectListItem>> {
  const query = new URLSearchParams({
    role: params.role,
    status: params.status,
    page: String(params.page ?? 1),
  })
  const data = await apiRequest<{ projects: Paginated<ProjectListItem> }>(
    `${endpoints.projects()}?${query.toString()}`,
    { signal },
  )
  return data.projects
}

/** GET /api/projects/{id} — کارفرما یا کارجوی همان پروژه */
export async function fetchProject(
  projectId: number | string,
  signal?: AbortSignal,
): Promise<Project> {
  const data = await apiRequest<{ project: Project }>(endpoints.project(projectId), { signal })
  return data.project
}

/** PATCH /api/projects/{id}/payment — پرداخت شبیه‌سازی‌شده سمت بک‌اند */
export async function payProject(projectId: number | string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(endpoints.projectPayment(projectId), { method: 'PATCH' })
}
