import { apiRequest, buildFormData } from './client'
import { endpoints } from './endpoints'
import type { Application, Paginated } from '@/types/models'

/** GET /api/tasks/{task}/applications — فقط صاحب تسک، فقط وضعیت pending */
export async function fetchTaskApplications(
  taskId: number | string,
  page = 1,
  signal?: AbortSignal,
): Promise<Paginated<Application>> {
  const data = await apiRequest<{ applications: Paginated<Application> }>(
    `${endpoints.taskApplications(taskId)}?page=${page}`,
    { signal },
  )
  return data.applications
}

/** GET /api/applications/{id} — ⚠️ بک‌اند فقط به صاحب تسک اجازه می‌دهد (کارجو ۴۰۳ می‌گیرد) */
export async function fetchApplication(
  applicationId: number | string,
  signal?: AbortSignal,
): Promise<Application> {
  const data = await apiRequest<{ application: Application }>(endpoints.application(applicationId), {
    signal,
  })
  return data.application
}

export interface ApplyInput {
  description: string
  files?: File[]
}

export async function applyToTask(
  taskId: number | string,
  input: ApplyInput,
): Promise<{ message: string; application: Application }> {
  const form = buildFormData({ description: input.description, files: input.files ?? [] })
  return apiRequest<{ message: string; application: Application }>(
    endpoints.taskApplications(taskId),
    { method: 'POST', form },
  )
}

export async function acceptApplication(
  applicationId: number | string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(endpoints.applicationAccept(applicationId), {
    method: 'PATCH',
  })
}

export async function rejectApplication(
  applicationId: number | string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(endpoints.applicationReject(applicationId), {
    method: 'PATCH',
  })
}
