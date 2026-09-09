import { apiRequest } from './client'
import { endpoints } from './endpoints'
import type { Project } from '@/types/models'

/** GET /api/projects/{id} — کارفرما یا کارجوی همان پروژه */
export async function fetchProject(projectId: number | string, signal?: AbortSignal): Promise<Project> {
  const data = await apiRequest<{ project: Project }>(endpoints.project(projectId), { signal })
  return data.project
}

/** PATCH /api/projects/{id}/payment — پرداخت ساختگی (Fake Payment) سمت بک‌اند */
export async function payProject(projectId: number | string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(endpoints.projectPayment(projectId), { method: 'PATCH' })
}
