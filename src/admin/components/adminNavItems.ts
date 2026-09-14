import type { ComponentType, SVGProps } from 'react'
import {
  IconGrid,
  IconHandshake,
  IconPackage,
  IconSmile,
  IconTag,
  IconTasks,
  IconTool,
  IconUsers,
  IconWallet,
  IconWarning,
} from '@/components/ui/Icons'

export interface AdminNavItem {
  key: string
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  /** فقط آیتم‌های فعال مسیر دارند؛ بقیه هنوز در بک‌اند API ندارند */
  to?: string
  /** مسیر دقیقاً برابر باشد (برای ریشهٔ /admin) */
  end?: boolean
}

/**
 * ناوبری پنل ادمین.
 *
 * فقط «داشبورد» و «مدیریت شکایات» واقعاً کار می‌کنند؛ بقیه عمداً غیرفعال‌اند چون
 * بک‌اند برایشان API ندارد و طبق نیازمندی نباید Mock یا صفحهٔ ساختگی ساخته شود.
 */
export const adminNav: AdminNavItem[] = [
  { key: 'dashboard', label: 'داشبورد', Icon: IconGrid, to: '/admin', end: true },
  { key: 'users', label: 'مدیریت کاربران', Icon: IconUsers },
  { key: 'tasks', label: 'مدیریت تسک‌ها', Icon: IconTasks },
  { key: 'applications', label: 'مدیریت درخواست‌های همکاری', Icon: IconHandshake },
  { key: 'projects', label: 'مدیریت پروژه‌ها', Icon: IconPackage },
  { key: 'complaints', label: 'مدیریت شکایات', Icon: IconWarning, to: '/admin/complaints' },
  { key: 'reviews', label: 'مدیریت رضایت و نظرات', Icon: IconSmile },
  { key: 'categories', label: 'مدیریت دسته‌بندی‌ها', Icon: IconTag },
  { key: 'skills', label: 'مدیریت مهارت‌ها', Icon: IconTool },
  { key: 'payments', label: 'مدیریت پرداخت‌ها', Icon: IconWallet },
]

export function isAdminNavActive(item: AdminNavItem, pathname: string): boolean {
  if (!item.to) return false
  if (item.end) return pathname === item.to || pathname === `${item.to}/`
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}
