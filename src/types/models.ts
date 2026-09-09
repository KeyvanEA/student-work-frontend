/**
 * مدل‌های داده — دقیقاً بر اساس چیزی که کنترلرهای Laravel برمی‌گردانند.
 * منبع: app/Http/Controllers/Api/*.php و database/migrations/*
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
}

export interface TaskFile {
  id: number
  task_id: number
  file_path: string
  /** توسط بک‌اند با Storage::url ساخته می‌شود */
  download_url?: string
}

/** شکل خلاصه‌ای که GET /api/tasks برمی‌گرداند */
export interface TaskListItem {
  id: number
  user_id: number
  title: string
  budget: number
  created_at: string
  user?: Pick<User, 'id' | 'full_name'>
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
  user?: Pick<User, 'id' | 'full_name' | 'avatar'> & { skills?: Skill[] }
  task?: Partial<Task>
  files?: ApplicationFile[]
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

export interface DeliveryFile {
  id: number
  original_name: string
  mime_type: string
  size: number
  /** URL مطلقی که خود بک‌اند می‌سازد (route: deliveries.files.preview) */
  preview_url: string
}

export interface Delivery {
  id: number
  description: string
  status: DeliveryStatus
  submitted_at: string
  edit_count: number
  files: DeliveryFile[]
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
