import { apiRequest } from './client'
import { endpoints } from './endpoints'
import type { Review, Satisfaction } from '@/types/models'

/** GET /api/profile/satisfaction — شمارش رضایت/نارضایتی ثبت‌شده دربارهٔ کاربر جاری */
export async function fetchSatisfaction(signal?: AbortSignal): Promise<Satisfaction> {
  return apiRequest<Satisfaction>(endpoints.profileSatisfaction(), { signal })
}

/**
 * POST /api/projects/{project}/reviews
 * بک‌اند فقط `is_satisfied` می‌گیرد — هیچ امتیاز عددی یا متن نظری در MVP وجود ندارد.
 * برای هر (پروژه، ثبت‌کننده) فقط یک بار مجاز است (unique روی project_id+reviewer_id).
 */
export async function submitReview(
  projectId: number | string,
  isSatisfied: boolean,
): Promise<{ message: string; review: Review }> {
  return apiRequest<{ message: string; review: Review }>(endpoints.projectReviews(projectId), {
    method: 'POST',
    json: { is_satisfied: isSatisfied },
  })
}
