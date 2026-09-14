/**
 * مدل‌های داده — دقیقاً بر اساس چیزی که کنترلرهای Laravel برمی‌گردانند.
 * منبع: app/Http/Controllers/Api/*.php و database/migrations/*
 *
 * ⚠️ اگر بک‌اند کلید یا shape ای را متفاوت می‌دهد، اینجا باید با همان shape واقعی
 * هماهنگ شود؛ نه با چیزی که «باید» باشد.
 */

export type TaskStatus = 'open' | 'assigned' | 'completed' | 'cancelled' | 'expired'
export type ApplicationStatus = 'pending' | 'contacted' | 'accepted' | 'rejected'
export type ProjectStatus =
  | 'in_progress'
  | 'submitted'
  | 'revision_requested'
  | 'completed'
  | 'cancelled'
  | 'disputed'
export type PaymentStatus = 'unpaid' | 'paid'
export type DeliveryStatus = 'pending' | 'accepted' | 'rejected'
export type ComplaintStatus = 'pending' | 'reviewing' | 'resolved' | 'rejected'

/** نقش کاربر جاری نسبت به یک پروژه — توسط ProjectController::index محاسبه می‌شود */
export type ProjectRole = 'worker' | 'employer'
/** فیلتر وضعیت فهرست پروژه‌ها (query param بک‌اند) */
export type ProjectListStatus = 'active' | 'history'
/** نوع فهرست درخواست‌های همکاری (query param بک‌اند) */
export type ApplicationListType = 'sent' | 'received'

export interface Skill {
  id: number
  name: string
}

export interface Category {
  id: number
  name: string
  slug?: string
}

export interface User {
  id: number
  full_name: string
  mobile?: string
  student_number?: string
  field_of_study?: string
  university_name?: string
  bio?: string | null
  email?: string | null
  avatar?: string | null
  resume_file?: string | null
  is_active?: boolean
  created_at?: string
  updated_at?: string
  skills?: Skill[]
  /**
   * نقش‌های spatie/laravel-permission.
   * ⚠️ بک‌اند فعلی این رابطه را در /api/login، /api/user و /api/profile eager-load نمی‌کند،
   * بنابراین معمولاً وجود ندارد. اگر روزی `$user->load('roles')` اضافه شود، همین‌جا خوانده
   * می‌شود و دیگر نیازی به بررسی دسترسی از راه دیگر نیست.
   */
  roles?: Array<{ id: number; name: string }>
}

export interface TaskFile {
  id: number
  task_id: number
  file_path: string
  /** توسط بک‌اند با url(Storage::url(...)) ساخته می‌شود — فرانت مسیر را حدس نمی‌زند */
  download_url?: string
}

/** شکل خلاصه‌ای که GET /api/tasks برمی‌گرداند (select: id,user_id,title,budget,created_at) */
export interface TaskListItem {
  id: number
  user_id: number
  title: string
  budget: number
  created_at: string
  user?: Pick<User, 'id' | 'full_name'>
}

/** شکل خلاصه‌ای که GET /api/tasks/mine برمی‌گرداند */
export interface MyTaskListItem {
  id: number
  title: string
  budget: number
  deadline: string
  status: TaskStatus
  created_at: string
}

/** شکل کاملی که GET /api/tasks/{id} برمی‌گرداند */
export interface Task {
  id: number
  user_id: number
  category_id: number
  title: string
  description: string
  budget: number
  deadline: string
  status: TaskStatus
  created_at: string
  updated_at: string
  user?: Pick<User, 'id' | 'full_name' | 'avatar'>
  category?: Category
  skills?: Skill[]
  files?: TaskFile[]
}

export interface ApplicationFile {
  id: number
  application_id: number
  file_path: string
  download_url?: string
}

export interface Application {
  id: number
  user_id: number
  task_id: number
  description: string
  status: ApplicationStatus
  created_at: string
  updated_at?: string
  user?: Pick<User, 'id' | 'full_name' | 'avatar' | 'mobile'> & { skills?: Skill[] }
  task?: Partial<Task>
  files?: ApplicationFile[]
}

/** پاسخ PATCH /api/applications/{id}/accept — شامل پروژه‌ای که تازه ساخته شده */
export interface AcceptApplicationResponse {
  message: string
  project?: Project
}

export interface Project {
  id: number
  application_id: number
  status: ProjectStatus
  amount: number
  payment_status: PaymentStatus
  deadline: string
  started_at: string
  completed_at: string | null
  created_at: string
  updated_at: string
  application?: Application
}

/**
 * آیتم فهرست GET /api/projects — بک‌اند collection را transform می‌کند،
 * پس این shape با Project کامل فرق دارد.
 */
export interface ProjectListItem {
  id: number
  title: string
  amount: number
  deadline: string
  status: ProjectStatus
  payment_status: PaymentStatus
  role: ProjectRole
  other_user: {
    id: number
    full_name: string
    avatar: string | null
  }
}

export interface DeliveryFile {
  id: number
  original_name: string
  mime_type: string
  size: number
  /** URL مطلقی که خود بک‌اند می‌سازد (route: deliveries.files.preview) */
  preview_url: string
}

/**
 * آیتم فهرست GET /api/projects/{project}/deliveries.
 * ⚠️ این endpoint فایل‌ها را برنمی‌گرداند؛ فایل‌ها فقط در GET /api/deliveries/{id} هستند.
 */
export interface DeliveryListItem {
  id: number
  description: string
  status: DeliveryStatus
  submitted_at: string
  rejection_reason: string | null
  edit_count: number
}

/**
 * پاسخ GET /api/deliveries/{id}.
 * ⚠️ برخلاف آیتم فهرست، اینجا rejection_reason نیست ولی files هست.
 */
export interface Delivery {
  id: number
  description: string
  status: DeliveryStatus
  submitted_at: string
  edit_count: number
  files: DeliveryFile[]
}

export interface ComplaintFile {
  id: number
  complaint_id: number
  original_name: string
  mime_type: string
  size: number
  file_path?: string
  /** با Storage::url ساخته می‌شود */
  download_url?: string
}

/** آیتم فهرست GET /api/complaints و GET /api/complaints/related */
export interface ComplaintListItem {
  id: number
  project_id: number
  title: string
  status: ComplaintStatus
  created_at: string
}

/** پاسخ GET /api/complaints/{id} — مدل کامل Complaint */
export interface Complaint {
  id: number
  project_id: number
  user_id: number
  title: string
  description: string
  status: ComplaintStatus
  admin_response: string | null
  created_at: string
  updated_at: string
  files?: ComplaintFile[]
}

export interface AppNotification {
  id: number
  user_id: number
  title: string
  message: string
  is_read: boolean
  created_at: string
}

/** پاسخ GET /api/notifications */
export interface NotificationsResponse {
  notifications: Paginated<AppNotification>
  unread_count: number
}

/** پاسخ GET /api/profile/satisfaction */
export interface SatisfactionSide {
  satisfied_count: number
  dissatisfied_count: number
}

export interface Satisfaction {
  as_worker: SatisfactionSide
  as_employer: SatisfactionSide
}

/** پاسخ POST /api/projects/{project}/reviews */
export interface Review {
  id: number
  project_id: number
  reviewer_id: number
  reviewed_user_id: number
  is_satisfied: boolean
  comment?: string | null
  created_at: string
  updated_at: string
}

/**
 * پاسخ GET /api/dashboard.
 * ⚠️ نام کلیدها عیناً همان چیزی است که UserDashboardController برمی‌گرداند،
 * از جمله غلط‌های املایی `recived*` و `myCompaints`. تغییرشان یعنی خواندن کلید ناموجود.
 */
export interface DashboardStats {
  activeProject: number
  openTasks: number
  sentApplications: number
  recivedApplications: number
  sentDelivery: number
  recivedDelivery: number
  myCompaints: number
  relatedComplaints: number
  unreadNotifications: number
}

/** ساختار صفحه‌بندی استاندارد Laravel */
export interface Paginated<T> {
  current_page: number
  data: T[]
  first_page_url: string | null
  from: number | null
  last_page: number
  last_page_url: string | null
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}
