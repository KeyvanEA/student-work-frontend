/**
 * مدل‌های پنل ادمین — دقیقاً مطابق خروجی کنترلرهای بک‌اند:
 *   app/Http/Controllers/Admin/AdminDashboardController.php
 *   app/Http/Controllers/Admin/AdminComplaintController.php
 *
 * ⚠️ هیچ فیلدی اینجا اضافه نشده که بک‌اند برنگرداند.
 */

import type {
  Application,
  ComplaintStatus,
  DeliveryStatus,
  Paginated,
  PaymentStatus,
  Project,
  ProjectStatus,
  Task,
  User,
} from '@/types/models'

/** پاسخ GET /api/admin/dashboard */
export interface AdminComplaintStats {
  pending: number
  reviewing: number
  resolved: number
  rejected: number
}

export interface AdminDashboardResponse {
  complaints: AdminComplaintStats
}

/**
 * آیتم فهرست GET /api/admin/complaints
 * select: id, project_id, user_id, title, status, created_at
 * with: user(id,full_name,avatar) · project(id,application_id,amount) · project.application.task(id,title)
 */
export interface AdminComplaintListItem {
  id: number
  project_id: number
  user_id: number
  title: string
  status: ComplaintStatus
  created_at: string
  user?: Pick<User, 'id' | 'full_name' | 'avatar'>
  project?: {
    id: number
    application_id: number
    amount: number
    application?: {
      id: number
      task?: Pick<Task, 'id' | 'title'>
    }
  }
}

export type AdminComplaintList = Paginated<AdminComplaintListItem>

/** فایل پیوست — بک‌اند در مسیرهای ادمین فقط مدل خام را می‌دهد (بدون URL دانلود) */
export interface AdminAttachment {
  id: number
  original_name: string
  mime_type: string
  size: number
  file_path?: string
  created_at?: string
}

/** تحویل پروژه، آن‌طور که در پاسخ نمایش شکایت می‌آید (به همراه files) */
export interface AdminDelivery {
  id: number
  project_id: number
  description: string
  status: DeliveryStatus
  rejection_reason: string | null
  edit_count: number
  submitted_at: string
  created_at?: string
  files?: AdminAttachment[]
}

/** پروفایلی که بک‌اند برای شاکی و طرف مقابل برمی‌گرداند */
export type AdminParticipant = Pick<
  User,
  | 'id'
  | 'full_name'
  | 'avatar'
  | 'mobile'
  | 'student_number'
  | 'field_of_study'
  | 'university_name'
>

/**
 * پاسخ GET /api/admin/complaints/{complaint}
 * بک‌اند هر بخش را جداگانه و در سطح ریشه برمی‌گرداند.
 */
export interface AdminComplaintDetailResponse {
  complaint: {
    id: number
    title: string
    description: string
    status: ComplaintStatus
    admin_response: string | null
    created_at: string
  }
  complainant: AdminParticipant
  other_party: AdminParticipant
  task: Task
  application: Application
  project: Project & {
    status: ProjectStatus
    payment_status: PaymentStatus
    amount: number
    deadline: string
  }
  deliveries: AdminDelivery[]
  complaint_files: AdminAttachment[]
}

/** پاسخ PATCH /api/admin/complaints/{complaint}/review */
export interface AdminReviewResponse {
  message: string
  complaint: { id: number; status: ComplaintStatus }
}

/**
 * بدنهٔ PATCH /api/admin/complaints/{complaint}/resolve
 * طبق ResolveComplaintRequest:
 *   decision: valid|invalid
 *   action:   required_if decision=valid · prohibited_if decision=invalid
 *   admin_response: required, بین ۱۰ تا ۵۰۰۰ کاراکتر
 */
export type AdminDecision = 'valid' | 'invalid'
export type AdminValidAction = 'revision' | 'cancel'

export type AdminResolveInput =
  | { decision: 'invalid'; admin_response: string }
  | { decision: 'valid'; action: AdminValidAction; admin_response: string }
