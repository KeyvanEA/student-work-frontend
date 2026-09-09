/**
 * تنها محل تعریف مسیرهای API.
 * هر مسیر اینجا دقیقاً معادل یک route ثبت‌شده در routes/api.php بک‌اند است.
 * ⚠️ هیچ endpoint خیالی اینجا اضافه نشود.
 */

export const API_PREFIX = '/api'

export const endpoints = {
  // ---- Authentication (routes/api.php) ----
  login: () => `${API_PREFIX}/login`,
  logout: () => `${API_PREFIX}/logout`,
  currentUser: () => `${API_PREFIX}/user`,

  // ---- Profile ----
  profile: () => `${API_PREFIX}/profile`,
  profileSkills: () => `${API_PREFIX}/profile/skills`,
  skills: () => `${API_PREFIX}/skills`,

  // ---- Tasks ----
  tasks: () => `${API_PREFIX}/tasks`,
  task: (taskId: number | string) => `${API_PREFIX}/tasks/${taskId}`,
  taskCancel: (taskId: number | string) => `${API_PREFIX}/tasks/${taskId}/cancel`,

  // ---- Applications ----
  taskApplications: (taskId: number | string) => `${API_PREFIX}/tasks/${taskId}/applications`,
  application: (applicationId: number | string) => `${API_PREFIX}/applications/${applicationId}`,
  applicationAccept: (applicationId: number | string) =>
    `${API_PREFIX}/applications/${applicationId}/accept`,
  applicationReject: (applicationId: number | string) =>
    `${API_PREFIX}/applications/${applicationId}/reject`,

  // ---- Projects ----
  project: (projectId: number | string) => `${API_PREFIX}/projects/${projectId}`,
  projectPayment: (projectId: number | string) => `${API_PREFIX}/projects/${projectId}/payment`,
  projectDeliveries: (projectId: number | string) =>
    `${API_PREFIX}/projects/${projectId}/deliveries`,

  // ---- Deliveries ----
  delivery: (deliveryId: number | string) => `${API_PREFIX}/deliveries/${deliveryId}`,
  deliveryAccept: (deliveryId: number | string) => `${API_PREFIX}/deliveries/${deliveryId}/accept`,
  deliveryReject: (deliveryId: number | string) => `${API_PREFIX}/deliveries/${deliveryId}/reject`,
  deliveryFilePreview: (deliveryId: number | string, fileId: number | string) =>
    `${API_PREFIX}/deliveries/${deliveryId}/files/${fileId}/preview`,
  deliveryFileDownload: (deliveryId: number | string, fileId: number | string) =>
    `${API_PREFIX}/deliveries/${deliveryId}/files/${fileId}/download`,
} as const
