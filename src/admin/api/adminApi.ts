/**
 * لایهٔ سرویس پنل ادمین.
 *
 * تنها جایی که صفحات ادمین برای گرفتن داده صدا می‌زنند. هر تابع دقیقاً معادل یک
 * endpoint طراحی‌شده در plannedEndpoints.ts است.
 *
 * ⚠️ تا وقتی بک‌اند مسیرهای /api/admin/... را نساخته، هر تابع به `adminMock` وصل است و
 * هیچ درخواست شبکه‌ای ارسال نمی‌شود. برای سوییچ به API واقعی کافی است بدنهٔ همان تابع
 * از `adminMock.x(...)` به `apiRequest(plannedAdminEndpoints.x(), ...)` تغییر کند؛
 * امضای توابع و shape داده‌ها همان می‌ماند.
 */

import { adminMock } from './mockAdapter'
import type {
  AdminApplicationDetail,
  AdminApplicationRow,
  AdminCategoryRow,
  AdminComplaintDecisionInput,
  AdminComplaintDetail,
  AdminComplaintRow,
  AdminDeliveryRow,
  AdminOverview,
  AdminPaginated,
  AdminProjectDetail,
  AdminProjectRow,
  AdminReviewRow,
  AdminSkillRow,
  AdminTaskDetail,
  AdminTaskRow,
  AdminUserDetail,
  AdminUserRow,
} from './types'

/** منبع داده‌ای که این لایه فعلاً استفاده می‌کند — برای نمایش صریح در UI */
export const ADMIN_DATA_SOURCE = 'mock' as const

export const adminApi = {
  // ---- داشبورد ----
  overview: (): Promise<AdminOverview> => adminMock.overview(),

  // ---- کاربران ----
  users: (params: {
    page?: number
    search?: string
    active?: 'all' | 'active' | 'inactive'
  }): Promise<AdminPaginated<AdminUserRow>> => adminMock.users(params),

  user: (userId: number): Promise<AdminUserDetail> => adminMock.user(userId),

  setUserStatus: (userId: number, isActive: boolean): Promise<AdminUserDetail> =>
    adminMock.setUserStatus(userId, isActive),

  // ---- تسک‌ها ----
  tasks: (params: {
    page?: number
    search?: string
    status?: string
    categoryId?: number | 'all'
  }): Promise<AdminPaginated<AdminTaskRow>> => adminMock.tasks(params),

  task: (taskId: number): Promise<AdminTaskDetail> => adminMock.task(taskId),

  cancelTask: (taskId: number): Promise<AdminTaskDetail> => adminMock.cancelTask(taskId),

  // ---- درخواست‌های همکاری ----
  applications: (params: {
    page?: number
    status?: string
    search?: string
  }): Promise<AdminPaginated<AdminApplicationRow>> => adminMock.applications(params),

  application: (applicationId: number): Promise<AdminApplicationDetail> =>
    adminMock.application(applicationId),

  // ---- پروژه‌ها ----
  projects: (params: {
    page?: number
    status?: string
    paymentStatus?: string
    search?: string
  }): Promise<AdminPaginated<AdminProjectRow>> => adminMock.projects(params),

  project: (projectId: number): Promise<AdminProjectDetail> => adminMock.project(projectId),

  projectDeliveries: (projectId: number): Promise<AdminDeliveryRow[]> =>
    adminMock.projectDeliveries(projectId),

  // ---- شکایات (اولویت اول) ----
  complaints: (params: {
    page?: number
    status?: string
    search?: string
    from?: string
    to?: string
  }): Promise<AdminPaginated<AdminComplaintRow>> => adminMock.complaints(params),

  complaint: (complaintId: number): Promise<AdminComplaintDetail> =>
    adminMock.complaint(complaintId),

  startComplaintReview: (complaintId: number): Promise<AdminComplaintDetail> =>
    adminMock.startComplaintReview(complaintId),

  decideComplaint: (
    complaintId: number,
    input: AdminComplaintDecisionInput,
  ): Promise<AdminComplaintDetail> => adminMock.decideComplaint(complaintId, input),

  // ---- ارزیابی‌ها ----
  reviews: (params: {
    page?: number
    satisfied?: 'all' | 'yes' | 'no'
    search?: string
  }): Promise<AdminPaginated<AdminReviewRow>> => adminMock.reviews(params),

  // ---- دسته‌بندی‌ها ----
  categories: (): Promise<AdminCategoryRow[]> => adminMock.categories(),
  createCategory: (name: string, slug: string): Promise<AdminCategoryRow> =>
    adminMock.createCategory(name, slug),
  updateCategory: (id: number, name: string, slug: string): Promise<AdminCategoryRow> =>
    adminMock.updateCategory(id, name, slug),
  deleteCategory: (id: number): Promise<{ ok: true }> => adminMock.deleteCategory(id),

  // ---- مهارت‌ها ----
  skills: (): Promise<AdminSkillRow[]> => adminMock.skills(),
  createSkill: (name: string): Promise<AdminSkillRow> => adminMock.createSkill(name),
  updateSkill: (id: number, name: string): Promise<AdminSkillRow> =>
    adminMock.updateSkill(id, name),
  deleteSkill: (id: number): Promise<{ ok: true }> => adminMock.deleteSkill(id),
}
