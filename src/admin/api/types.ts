/**
 * مدل‌های پنل ادمین.
 *
 * ساختار هر مدل عمداً بر اساس *جدول‌های واقعی دیتابیس* بک‌اند نوشته شده
 * (database/migrations/*) تا وقتی APIهای ادمین ساخته شدند، تغییر چندانی لازم نباشد.
 */

import type {
  ApplicationStatus,
  ComplaintStatus,
  DeliveryStatus,
  PaymentStatus,
  ProjectStatus,
  TaskStatus,
} from '@/types/models'

export interface AdminPaginated<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface AdminUserRow {
  id: number
  full_name: string
  mobile: string
  student_number: string
  field_of_study: string
  university_name: string
  is_active: boolean
  created_at: string
}

export interface AdminUserDetail extends AdminUserRow {
  email: string | null
  bio: string | null
  skills: Array<{ id: number; name: string }>
  tasks_count: number
  applications_count: number
  projects_count: number
}

export interface AdminTaskRow {
  id: number
  title: string
  budget: number
  deadline: string
  status: TaskStatus
  created_at: string
  category: { id: number; name: string }
  owner: { id: number; full_name: string }
}

export interface AdminTaskDetail extends AdminTaskRow {
  description: string
  skills: Array<{ id: number; name: string }>
  files_count: number
  applications_count: number
}

export interface AdminApplicationRow {
  id: number
  status: ApplicationStatus
  created_at: string
  task: { id: number; title: string }
  applicant: { id: number; full_name: string }
  employer: { id: number; full_name: string }
}

export interface AdminApplicationDetail extends AdminApplicationRow {
  description: string
  files_count: number
  project_id: number | null
}

export interface AdminProjectRow {
  id: number
  title: string
  amount: number
  deadline: string
  status: ProjectStatus
  payment_status: PaymentStatus
  completed_at: string | null
  created_at: string
  employer: { id: number; full_name: string }
  worker: { id: number; full_name: string }
}

export interface AdminProjectDetail extends AdminProjectRow {
  application_id: number
  task_id: number
  started_at: string
  deliveries_count: number
  complaints_count: number
}

export interface AdminDeliveryRow {
  id: number
  project_id: number
  description: string
  status: DeliveryStatus
  submitted_at: string
  rejection_reason: string | null
  edit_count: number
  files: Array<{ id: number; original_name: string; mime_type: string; size: number }>
}

export interface AdminComplaintRow {
  id: number
  title: string
  status: ComplaintStatus
  created_at: string
  project_id: number
  complainant: { id: number; full_name: string }
}

export interface AdminComplaintDetail extends AdminComplaintRow {
  description: string
  admin_response: string | null
  /** شاکی در این پروژه کارفرما بوده یا کارجو — تعیین‌کنندهٔ مسیر بازگشت پروژه پس از داوری */
  complainant_role: 'employer' | 'worker'
  other_participant: { id: number; full_name: string }
  project: {
    id: number
    status: ProjectStatus
    payment_status: PaymentStatus
    amount: number
    deadline: string
  }
  task: { id: number; title: string }
  application: { id: number }
  attachments: Array<{ id: number; original_name: string; mime_type: string; size: number }>
  deliveries: AdminDeliveryRow[]
}

export interface AdminReviewRow {
  id: number
  project_id: number
  project_title: string
  reviewer: { id: number; full_name: string }
  reviewed_user: { id: number; full_name: string }
  is_satisfied: boolean
  created_at: string
}

export interface AdminCategoryRow {
  id: number
  name: string
  slug: string
  tasks_count: number
  created_at: string
}

export interface AdminSkillRow {
  id: number
  name: string
  tasks_count: number
  users_count: number
  created_at: string
}

export interface AdminStats {
  total_users: number
  active_users: number
  inactive_users: number
  open_tasks: number
  active_projects: number
  completed_projects: number
  disputed_projects: number
  paid_projects: number
  pending_complaints: number
  reviewing_complaints: number
  resolved_complaints: number
  rejected_complaints: number
}

export interface AdminActivity {
  latest_users: AdminUserRow[]
  latest_tasks: AdminTaskRow[]
  latest_projects: AdminProjectRow[]
  latest_complaints: AdminComplaintRow[]
}

export interface AdminOverview {
  stats: AdminStats
  activity: AdminActivity
}

/** تصمیم ادمین دربارهٔ یک شکایت */
export type ComplaintDecision = 'accept' | 'reject'

export interface AdminComplaintDecisionInput {
  decision: ComplaintDecision
  admin_response: string
  /** فقط وقتی شکایت وارد است: پروژه لغو شود یا به وضعیت قبلی برگردد */
  cancelProject?: boolean
}
