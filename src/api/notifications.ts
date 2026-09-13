import { apiRequest } from './client'
import { endpoints } from './endpoints'
import type { NotificationsResponse } from '@/types/models'

/**
 * GET /api/notifications — صفحه‌بندی ۱۰تایی.
 * ⚠️ بک‌اند به‌محض خواندن هر صفحه، اعلان‌های خوانده‌نشدهٔ همان صفحه را read می‌کند و
 * `unread_count` مقدار *قبل از* این تغییر است.
 * endpoint ای برای «خواندن همه» وجود ندارد.
 */
export async function fetchNotifications(
  page = 1,
  signal?: AbortSignal,
): Promise<NotificationsResponse> {
  return apiRequest<NotificationsResponse>(`${endpoints.notifications()}?page=${page}`, { signal })
}
