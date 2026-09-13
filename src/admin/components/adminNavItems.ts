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
  IconWarning,
} from '@/components/ui/Icons'

export interface AdminNavItem {
  to: string
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  /** مسیر دقیقاً برابر باشد (برای ریشه /admin) */
  end?: boolean
}

/** ناوبری پنل ادمین — کاملاً جدا از Sidebar داشبورد کاربر */
export const adminNav: AdminNavItem[] = [
  { to: '/admin', label: 'داشبورد', Icon: IconGrid, end: true },
  { to: '/admin/users', label: 'کاربران', Icon: IconUsers },
  { to: '/admin/tasks', label: 'تسک‌ها', Icon: IconTasks },
  { to: '/admin/applications', label: 'درخواست‌های همکاری', Icon: IconHandshake },
  { to: '/admin/projects', label: 'پروژه‌ها', Icon: IconPackage },
  { to: '/admin/complaints', label: 'شکایات', Icon: IconWarning },
  { to: '/admin/reviews', label: 'رضایت‌ها', Icon: IconSmile },
  { to: '/admin/categories', label: 'دسته‌بندی‌ها', Icon: IconTag },
  { to: '/admin/skills', label: 'مهارت‌ها', Icon: IconTool },
]

export function isAdminNavActive(item: AdminNavItem, pathname: string): boolean {
  if (item.end) return pathname === item.to || pathname === `${item.to}/`
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}
