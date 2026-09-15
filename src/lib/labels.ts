import type {
  ApplicationStatus,
  ComplaintStatus,
  DeliveryStatus,
  PaymentStatus,
  ProjectStatus,
  TaskStatus,
} from '@/types/models'

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'brand'

export interface StatusMeta {
  label: string
  tone: Tone
  hint?: string
}

export const taskStatusMeta: Record<TaskStatus, StatusMeta> = {
  pending: {
    label: 'در انتظار تایید ادمین',
    tone: 'warning',
    hint: 'تا تایید ادمین منتشر نمی‌شود و برای بقیه کاربران دیده نمی‌شود',
  },
  open: { label: 'باز', tone: 'success', hint: 'در حال دریافت درخواست همکاری' },
  assigned: { label: 'واگذار شده', tone: 'info', hint: 'یک درخواست پذیرفته و پروژه ساخته شده' },
  completed: { label: 'تکمیل شده', tone: 'brand' },
  cancelled: { label: 'لغو شده', tone: 'danger' },
  expired: { label: 'منقضی شده', tone: 'neutral' },
  rejected: {
    label: 'ردشده توسط ادمین',
    tone: 'danger',
    hint: 'ادمین این تسک را بررسی کرد و منتشر نشد',
  },
}

export const applicationStatusMeta: Record<ApplicationStatus, StatusMeta> = {
  pending: { label: 'در انتظار بررسی', tone: 'warning' },
  contacted: { label: 'در حال گفتگو', tone: 'info' },
  accepted: { label: 'پذیرفته شده', tone: 'success' },
  rejected: { label: 'رد شده', tone: 'danger' },
}

export const projectStatusMeta: Record<ProjectStatus, StatusMeta> = {
  in_progress: { label: 'در حال انجام', tone: 'info', hint: 'کارجو باید تحویل ثبت کند' },
  submitted: { label: 'تحویل شده', tone: 'warning', hint: 'در انتظار بررسی کارفرما' },
  revision_requested: { label: 'نیازمند اصلاح', tone: 'danger', hint: 'تحویل رد شده است' },
  completed: { label: 'تکمیل شده', tone: 'success', hint: 'آماده پرداخت' },
  cancelled: { label: 'لغو شده', tone: 'neutral' },
  disputed: { label: 'در حال داوری', tone: 'danger' },
}

export const paymentStatusMeta: Record<PaymentStatus, StatusMeta> = {
  unpaid: { label: 'پرداخت نشده', tone: 'warning' },
  paid: { label: 'پرداخت شده', tone: 'success' },
}

export const deliveryStatusMeta: Record<DeliveryStatus, StatusMeta> = {
  pending: { label: 'در انتظار بررسی', tone: 'warning' },
  accepted: { label: 'تایید شده', tone: 'success' },
  rejected: { label: 'رد شده', tone: 'danger' },
}

export const complaintStatusMeta: Record<ComplaintStatus, StatusMeta> = {
  pending: { label: 'در انتظار بررسی', tone: 'warning', hint: 'هنوز توسط ادمین بررسی نشده است' },
  reviewing: { label: 'در حال بررسی', tone: 'info', hint: 'ادمین بررسی را شروع کرده است' },
  resolved: { label: 'پذیرفته شده', tone: 'success', hint: 'شکایت وارد تشخیص داده شد' },
  rejected: { label: 'رد شده', tone: 'danger', hint: 'شکایت وارد تشخیص داده نشد' },
}

const FALLBACK: StatusMeta = { label: 'نامشخص', tone: 'neutral' }

export function metaOf<T extends string>(
  map: Record<T, StatusMeta>,
  key: T | null | undefined,
): StatusMeta {
  if (!key) return FALLBACK
  return map[key] ?? FALLBACK
}
