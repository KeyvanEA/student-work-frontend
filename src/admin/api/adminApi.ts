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
