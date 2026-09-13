/**
 * مسیرهای *طراحی‌شدهٔ* پنل ادمین.
 *
 * ⚠️ هیچ‌کدام از این‌ها هنوز در routes/api.php بک‌اند وجود ندارند.
 * این فایل عمداً از src/api/endpoints.ts جداست تا آن فایل فقط آینهٔ
 * مسیرهای واقعی بک‌اند بماند.
 *
 * تا وقتی بک‌اند این مسیرها را اضافه نکرده، هیچ درخواست واقعی به /api/admin/... ارسال
 * نمی‌شود؛ لایهٔ سرویس (adminApi.ts) درخواست‌ها را به Mock Adapter می‌فرستد.
 * با آمادهٔ شدن هر گروه از APIها، کافی است همان تابع در adminApi.ts از mock به
 * apiRequest سوییچ شود.
 */

const ADMIN_PREFIX = '/api/admin'

export const plannedAdminEndpoints = {
  // داشبورد
  stats: () => `${ADMIN_PREFIX}/stats`,

  // کاربران
  users: () => `${ADMIN_PREFIX}/users`,
  user: (userId: number | string) => `${ADMIN_PREFIX}/users/${userId}`,
  userStatus: (userId: number | string) => `${ADMIN_PREFIX}/users/${userId}/status`,

  // تسک‌ها
  tasks: () => `${ADMIN_PREFIX}/tasks`,
  task: (taskId: number | string) => `${ADMIN_PREFIX}/tasks/${taskId}`,
  taskCancel: (taskId: number | string) => `${ADMIN_PREFIX}/tasks/${taskId}/cancel`,

  // درخواست‌های همکاری
  applications: () => `${ADMIN_PREFIX}/applications`,
  application: (applicationId: number | string) => `${ADMIN_PREFIX}/applications/${applicationId}`,

  // پروژه‌ها
  projects: () => `${ADMIN_PREFIX}/projects`,
  project: (projectId: number | string) => `${ADMIN_PREFIX}/projects/${projectId}`,
  projectDeliveries: (projectId: number | string) =>
    `${ADMIN_PREFIX}/projects/${projectId}/deliveries`,

  // شکایات — اولویت اول
  complaints: () => `${ADMIN_PREFIX}/complaints`,
  complaint: (complaintId: number | string) => `${ADMIN_PREFIX}/complaints/${complaintId}`,
  complaintReview: (complaintId: number | string) =>
    `${ADMIN_PREFIX}/complaints/${complaintId}/review`,
  complaintDecision: (complaintId: number | string) =>
    `${ADMIN_PREFIX}/complaints/${complaintId}/decision`,

  // ارزیابی‌ها
  reviews: () => `${ADMIN_PREFIX}/reviews`,
  review: (reviewId: number | string) => `${ADMIN_PREFIX}/reviews/${reviewId}`,

  // دسته‌بندی‌ها
  categories: () => `${ADMIN_PREFIX}/categories`,
  category: (categoryId: number | string) => `${ADMIN_PREFIX}/categories/${categoryId}`,

  // مهارت‌ها
  skills: () => `${ADMIN_PREFIX}/skills`,
  skill: (skillId: number | string) => `${ADMIN_PREFIX}/skills/${skillId}`,
} as const

/** وضعیت پیاده‌سازی هر گروه در بک‌اند — برای نمایش شفاف در UI */
export const adminBackendStatus = {
  stats: 'planned',
  users: 'planned',
  tasks: 'planned',
  applications: 'planned',
  projects: 'planned',
  complaints: 'planned',
  reviews: 'planned',
  categories: 'planned',
  skills: 'planned',
} as const
