import { apiRequest } from './client'
import { endpoints } from './endpoints'
import type { DashboardStats } from '@/types/models'

/**
 * GET /api/dashboard
 * پاسخ بک‌اند یک آبجکت تخت از شمارنده‌هاست (بدون wrapper).
 */
export async function fetchDashboard(signal?: AbortSignal): Promise<DashboardStats> {
  return apiRequest<DashboardStats>(endpoints.dashboard(), { signal })
}
