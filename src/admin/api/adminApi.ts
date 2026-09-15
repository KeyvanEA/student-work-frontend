/**
 * لایهٔ ارتباط پنل ادمین با بک‌اند.
 *
 * همهٔ این مسیرها در routes/api.php پشت middleware `auth:sanctum` + `admin` ثبت شده‌اند
 * و از همان توکن و همان client کاربر عادی استفاده می‌کنند. هیچ Mock ای اینجا نیست.
 */

import { apiRequest } from '@/api/client'
import { endpoints } from '@/api/endpoints'
import type { ComplaintStatus } from '@/types/models'
import type {
  AdminComplaintDetailResponse,
  AdminComplaintList,
  AdminDashboardResponse,
  AdminResolveInput,
  AdminReviewResponse,
  AdminTaskActionResponse,
  AdminTaskDetailResponse,
  AdminTaskFilter,
  AdminTaskList,
  AdminUserDeleteResponse,
  AdminUserList,
} from './types'

/** GET /api/admin/dashboard — شمارش شکایات به تفکیک وضعیت */
export async function fetchAdminDashboard(signal?: AbortSignal): Promise<AdminDashboardResponse> {
  return apiRequest<AdminDashboardResponse>(endpoints.adminDashboard(), { signal })
}

/**
 * GET /api/admin/complaints[?status=…]
 * بک‌اند فقط pending|reviewing|resolved|rejected را می‌پذیرد؛ بدون پارامتر یعنی «همه».
 */
export async function fetchAdminComplaints(
  params: { status?: ComplaintStatus | 'all'; page?: number } = {},
  signal?: AbortSignal,
): Promise<AdminComplaintList> {
  const query = new URLSearchParams()
  if (params.status && params.status !== 'all') query.set('status', params.status)
  query.set('page', String(params.page ?? 1))

  const data = await apiRequest<{ complaints: AdminComplaintList }>(
    `${endpoints.adminComplaints()}?${query.toString()}`,
    { signal },
  )
  return data.complaints
}

/** GET /api/admin/complaints/{complaint} — پروندهٔ کامل شکایت */
export async function fetchAdminComplaint(
  complaintId: number | string,
  signal?: AbortSignal,
): Promise<AdminComplaintDetailResponse> {
  return apiRequest<AdminComplaintDetailResponse>(endpoints.adminComplaint(complaintId), { signal })
}

/**
 * PATCH /api/admin/complaints/{complaint}/review
 * فقط وقتی شکایت `pending` و پروژه `disputed` است موفق می‌شود؛ در غیر این صورت ۴۲۲.
 */
export async function startAdminComplaintReview(
  complaintId: number | string,
): Promise<AdminReviewResponse> {
  return apiRequest<AdminReviewResponse>(endpoints.adminComplaintReview(complaintId), {
    method: 'PATCH',
  })
}

/**
 * PATCH /api/admin/complaints/{complaint}/resolve
 * فقط وقتی شکایت `reviewing` است. پاسخ فقط پیام دارد، پس بعد از موفقیت باید
 * پروندهٔ شکایت دوباره خوانده شود تا وضعیت جدید شکایت و پروژه دیده شود.
 */
export async function resolveAdminComplaint(
  complaintId: number | string,
  input: AdminResolveInput,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(endpoints.adminComplaintResolve(complaintId), {
    method: 'PATCH',
    json: input,
  })
}

/**
 * GET /api/admin/users[?mobile=…]
 * جست‌وجو فقط با شماره موبایل است؛ بک‌اند مقدار غیرعددی را ۴۲۲ می‌دهد.
 */
export async function fetchAdminUsers(
  params: { mobile?: string; page?: number } = {},
  signal?: AbortSignal,
): Promise<AdminUserList> {
  const query = new URLSearchParams()
  const mobile = params.mobile?.trim()
  if (mobile) query.set('mobile', mobile)
  query.set('page', String(params.page ?? 1))

  const data = await apiRequest<{ users: AdminUserList }>(
    `${endpoints.adminUsers()}?${query.toString()}`,
    { signal },
  )
  return data.users
}

/**
 * DELETE /api/admin/users/{user}
 * بسته به سابقهٔ کاربر، بک‌اند یا واقعاً حذف می‌کند یا فقط غیرفعال می‌کند؛
 * نتیجه در `strategy` پاسخ مشخص است و باید به کاربر نشان داده شود.
 */
export async function deleteAdminUser(userId: number | string): Promise<AdminUserDeleteResponse> {
  return apiRequest<AdminUserDeleteResponse>(endpoints.adminUser(userId), { method: 'DELETE' })
}

/**
 * GET /api/admin/tasks[?status=…]
 * بدون پارامتر، بک‌اند فقط تسک‌های در انتظار بررسی را می‌دهد.
 */
export async function fetchAdminTasks(
  params: { status?: AdminTaskFilter; page?: number } = {},
  signal?: AbortSignal,
): Promise<AdminTaskList> {
  const query = new URLSearchParams()
  query.set('status', params.status ?? 'pending')
  query.set('page', String(params.page ?? 1))

  const data = await apiRequest<{ tasks: AdminTaskList }>(
    `${endpoints.adminTasks()}?${query.toString()}`,
    { signal },
  )
  return data.tasks
}

/** GET /api/admin/tasks/{task} — تسک کامل به همراه فایل‌ها برای بررسی ادمین */
export async function fetchAdminTask(
  taskId: number | string,
  signal?: AbortSignal,
): Promise<AdminTaskDetailResponse> {
  return apiRequest<AdminTaskDetailResponse>(endpoints.adminTask(taskId), { signal })
}

/** PATCH /api/admin/tasks/{task}/approve — فقط روی تسک `pending`، در غیر این صورت ۴۲۲ */
export async function approveAdminTask(taskId: number | string): Promise<AdminTaskActionResponse> {
  return apiRequest<AdminTaskActionResponse>(endpoints.adminTaskApprove(taskId), {
    method: 'PATCH',
  })
}

/**
 * PATCH /api/admin/tasks/{task}/reject
 * طبق RejectTaskRequest، دلیل رد کردن اجباری و بین ۱۰ تا ۵۰۰۰ کاراکتر است.
 */
export async function rejectAdminTask(
  taskId: number | string,
  rejectionReason: string,
): Promise<AdminTaskActionResponse> {
  return apiRequest<AdminTaskActionResponse>(endpoints.adminTaskReject(taskId), {
    method: 'PATCH',
    json: { rejection_reason: rejectionReason },
  })
}
