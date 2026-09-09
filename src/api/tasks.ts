import { apiRequest, buildFormData } from './client'
import { endpoints } from './endpoints'
import type { Paginated, Task, TaskListItem } from '@/types/models'

/** GET /api/tasks — عمومی، فقط تسک‌های open، صفحه‌بندی‌شده */
export async function fetchTasks(page = 1, signal?: AbortSignal): Promise<Paginated<TaskListItem>> {
  const data = await apiRequest<{ tasks: Paginated<TaskListItem> }>(
    `${endpoints.tasks()}?page=${page}`,
    { signal, auth: false },
  )
  return data.tasks
}

/** GET /api/tasks/{id} — عمومی */
export async function fetchTask(taskId: number | string, signal?: AbortSignal): Promise<Task> {
  const data = await apiRequest<{ task: Task }>(endpoints.task(taskId), { signal, auth: false })
  return data.task
}

export interface CreateTaskInput {
  title: string
  description: string
  budget: number
  /** فرمت Y-m-d H:i یا ISO — بک‌اند فقط date معتبر و after:today می‌خواهد */
  deadline: string
  category_id: number
  skills: number[]
  files?: File[]
}

export async function createTask(input: CreateTaskInput): Promise<{ message: string; task: Task }> {
  const form = buildFormData({ ...input, files: input.files ?? [] })
  return apiRequest<{ message: string; task: Task }>(endpoints.tasks(), { method: 'POST', form })
}

export async function cancelTask(taskId: number | string): Promise<{ message: string; task: Task }> {
  return apiRequest<{ message: string; task: Task }>(endpoints.taskCancel(taskId), {
    method: 'PATCH',
  })
}
