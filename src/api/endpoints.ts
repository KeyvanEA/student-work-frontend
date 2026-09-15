/**
 * تنها محل تعریف مسیرهای API.
 * هر مسیر اینجا دقیقاً معادل یک route ثبت‌شده در routes/api.php بک‌اند است.
 * ⚠️ هیچ endpoint خیالی اینجا اضافه نشود.
 *
 * آخرین sync با routes/api.php (شاخهٔ feature/admin-user-task-moderation).
 */

export const API_PREFIX = '/api'

export const endpoints = {
  // ---- Authentication ----
  login: () => `${API_PREFIX}/login`,
  logout: () => `${API_PREFIX}/logout`,
  currentUser: () => `${API_PREFIX}/user`,

  // ---- Dashboard ----
  dashboard: () => `${API_PREFIX}/dashboard`,

  // ---- Profile ----
  profile: () => `${API_PREFIX}/profile`,
  profileSkills: () => `${API_PREFIX}/profile/skills`,
  profileSatisfaction: () => `${API_PREFIX}/profile/satisfaction`,
  skills: () => `${API_PREFIX}/skills`,

  // ---- Tasks ----
  tasks: () => `${API_PREFIX}/tasks`,
  myTasks: () => `${API_PREFIX}/tasks/mine`,
  task: (taskId: number | string) => `${API_PREFIX}/tasks/${taskId}`,
  taskCancel: (taskId: number | string) => `${API_PREFIX}/tasks/${taskId}/cancel`,

  // ---- Applications ----
  applications: () => `${API_PREFIX}/applications`,
  taskApplications: (taskId: number | string) => `${API_PREFIX}/tasks/${taskId}/applications`,
  application: (applicationId: number | string) => `${API_PREFIX}/applications/${applicationId}`,
  applicationAccept: (applicationId: number | string) =>
    `${API_PREFIX}/applications/${applicationId}/accept`,
  applicationReject: (applicationId: number | string) =>
    `${API_PREFIX}/applications/${applicationId}/reject`,

  // ---- Projects ----
  projects: () => `${API_PREFIX}/projects`,
  project: (projectId: number | string) => `${API_PREFIX}/projects/${projectId}`,
  projectPayment: (projectId: number | string) => `${API_PREFIX}/projects/${projectId}/payment`,
  projectDeliveries: (projectId: number | string) =>
    `${API_PREFIX}/projects/${projectId}/deliveries`,
  projectComplaints: (projectId: number | string) =>
    `${API_PREFIX}/projects/${projectId}/complaints`,
  projectReviews: (projectId: number | string) => `${API_PREFIX}/projects/${projectId}/reviews`,

  // ---- Deliveries ----
  delivery: (deliveryId: number | string) => `${API_PREFIX}/deliveries/${deliveryId}`,
  deliveryAccept: (deliveryId: number | string) => `${API_PREFIX}/deliveries/${deliveryId}/accept`,
  deliveryReject: (deliveryId: number | string) => `${API_PREFIX}/deliveries/${deliveryId}/reject`,
  deliveryFilePreview: (deliveryId: number | string, fileId: number | string) =>
    `${API_PREFIX}/deliveries/${deliveryId}/files/${fileId}/preview`,
  deliveryFileDownload: (deliveryId: number | string, fileId: number | string) =>
    `${API_PREFIX}/deliveries/${deliveryId}/files/${fileId}/download`,

  // ---- Complaints ----
  complaints: () => `${API_PREFIX}/complaints`,
  relatedComplaints: () => `${API_PREFIX}/complaints/related`,
  complaint: (complaintId: number | string) => `${API_PREFIX}/complaints/${complaintId}`,

  // ---- Notifications ----
  notifications: () => `${API_PREFIX}/notifications`,

  // ---- Admin (middleware: auth:sanctum + admin) ----
  adminDashboard: () => `${API_PREFIX}/admin/dashboard`,
  adminComplaints: () => `${API_PREFIX}/admin/complaints`,
  adminComplaint: (complaintId: number | string) =>
    `${API_PREFIX}/admin/complaints/${complaintId}`,
  adminComplaintReview: (complaintId: number | string) =>
    `${API_PREFIX}/admin/complaints/${complaintId}/review`,
  adminComplaintResolve: (complaintId: number | string) =>
    `${API_PREFIX}/admin/complaints/${complaintId}/resolve`,
  adminUsers: () => `${API_PREFIX}/admin/users`,
  adminUser: (userId: number | string) => `${API_PREFIX}/admin/users/${userId}`,
  adminTasks: () => `${API_PREFIX}/admin/tasks`,
  adminTask: (taskId: number | string) => `${API_PREFIX}/admin/tasks/${taskId}`,
  adminTaskApprove: (taskId: number | string) => `${API_PREFIX}/admin/tasks/${taskId}/approve`,
  adminTaskReject: (taskId: number | string) => `${API_PREFIX}/admin/tasks/${taskId}/reject`,
} as const
