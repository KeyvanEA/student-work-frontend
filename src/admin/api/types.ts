/**
 * مدل‌های پنل ادمین — دقیقاً مطابق خروجی کنترلرهای بک‌اند:
 *   app/Http/Controllers/Admin/AdminDashboardController.php
 *   app/Http/Controllers/Admin/AdminComplaintController.php
 *   app/Http/Controllers/Admin/AdminUserController.php
 *   app/Http/Controllers/Admin/AdminTaskController.php
 *
 * ⚠️ هیچ فیلدی اینجا اضافه نشده که بک‌اند برنگرداند.
 */

import type {
  Application,
  Category,
  ComplaintStatus,
  DeliveryStatus,
  Paginated,
  PaymentStatus,
  Project,
  ProjectStatus,
  Skill,
  Task,
  TaskFile,
  TaskStatus,
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

/* -------------------------------------------------------------------------
 * مدیریت کاربران — app/Http/Controllers/Admin/AdminUserController.php
 * ---------------------------------------------------------------------- */

/**
 * آیتم فهرست GET /api/admin/users[?mobile=…]
 * select: id, full_name, mobile, student_number, is_active, created_at
 * with: roles(id,name) — نقش‌های spatie، برای تشخیص حساب‌های ادمین
 */
export interface AdminUserListItem {
  id: number
  full_name: string
  mobile: string
  student_number: string
  is_active: boolean
  created_at: string
  roles: Array<{ id: number; name: string }>
}

export type AdminUserList = Paginated<AdminUserListItem>

/**
 * پاسخ DELETE /api/admin/users/{user}
 *
 * همه کلیدهای خارجی به users به‌صورت cascade هستند، بنابراین بک‌اند کاربری را که
 * سابقهٔ پروژه دارد حذف فیزیکی نمی‌کند و فقط غیرفعالش می‌کند. `strategy` می‌گوید
 * کدام اتفاق افتاده است.
 */
export type AdminUserDeleteStrategy = 'deleted' | 'deactivated'

export interface AdminUserDeleteResponse {
  message: string
  strategy: AdminUserDeleteStrategy
  user?: { id: number; is_active: boolean }
}

/* -------------------------------------------------------------------------
 * مدیریت و تایید تسک‌ها — app/Http/Controllers/Admin/AdminTaskController.php
 * ---------------------------------------------------------------------- */

/** مقادیری که AdminTaskController::index در query param `status` می‌پذیرد */
export type AdminTaskFilter = 'pending' | 'open' | 'rejected' | 'all'

/**
 * آیتم فهرست GET /api/admin/tasks[?status=…]
 * select: id, user_id, category_id, title, budget, deadline, status, created_at
 * with: user(id,full_name) · category(id,name)
 */
export interface AdminTaskListItem {
  id: number
  user_id: number
  category_id: number
  title: string
  budget: number
  deadline: string
  status: TaskStatus
  created_at: string
  user?: Pick<User, 'id' | 'full_name'>
  category?: Pick<Category, 'id' | 'name'>
}

export type AdminTaskList = Paginated<AdminTaskListItem>

/**
 * پاسخ GET /api/admin/tasks/{task} — مدل کامل تسک به همراه کارفرما، دسته‌بندی،
 * مهارت‌ها و فایل‌ها. فایل‌ها همان download_url همیشگی بک‌اند را دارند.
 */
export interface AdminTaskDetail extends Task {
  user?: Pick<
    User,
    'id' | 'full_name' | 'avatar' | 'mobile' | 'student_number' | 'field_of_study' | 'university_name'
  >
  category?: Pick<Category, 'id' | 'name'>
  skills?: Skill[]
  files?: TaskFile[]
}

export interface AdminTaskDetailResponse {
  task: AdminTaskDetail
}

/** پاسخ PATCH /api/admin/tasks/{task}/approve و …/reject */
export interface AdminTaskActionResponse {
  message: string
  task: { id: number; status: TaskStatus }
}
