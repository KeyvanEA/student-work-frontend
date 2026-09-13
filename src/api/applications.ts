import { apiRequest, buildFormData } from './client'
import { endpoints } from './endpoints'
import type {
  AcceptApplicationResponse,
  Application,
  ApplicationListType,
  Paginated,
} from '@/types/models'

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

/**
 * GET /api/applications?type=sent|received
 * `type` اجباری است؛ بدون آن بک‌اند ۴۲۲ می‌دهد.
 */
export async function fetchApplications(
  type: ApplicationListType,
  page = 1,
  signal?: AbortSignal,
): Promise<Paginated<Application>> {
  const query = new URLSearchParams({ type, page: String(page) })
  const data = await apiRequest<{ applications: Paginated<Application> }>(
    `${endpoints.applications()}?${query.toString()}`,
    { signal },
  )
  return data.applications
}

/** GET /api/applications/{id} — صاحب تسک یا خودِ ارسال‌کنندهٔ درخواست */
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

/**
 * PATCH /api/applications/{id}/accept
 * پاسخ شامل پروژهٔ تازه‌ساخته‌شده است؛ از روی آن مستقیماً به /projects/{id} می‌رویم.
 */
export async function acceptApplication(
  applicationId: number | string,
): Promise<AcceptApplicationResponse> {
  return apiRequest<AcceptApplicationResponse>(endpoints.applicationAccept(applicationId), {
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
