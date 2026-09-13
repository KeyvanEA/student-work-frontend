import type { ComponentType, SVGProps } from 'react'
import {
  IconArchive,
  IconBell,
  IconBolt,
  IconBriefcase,
  IconGrid,
  IconHandshake,
  IconSmile,
  IconTasks,
  IconUser,
  IconWarning,
} from '@/components/ui/Icons'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

export interface NavChild {
  to: string
  label: string
}

export interface NavItem {
  key: string
  label: string
  Icon: IconType
  /** آیتم ساده: خودش یک لینک است */
  to?: string
  /** آیتم گروهی: زیرمجموعه دارد */
  children?: NavChild[]
  /** مسیرهایی که این آیتم را فعال می‌کنند (علاوه بر to و childrenها) */
  match?: string[]
}

/**
 * ناوبری داشبورد کاربر — دقیقاً مطابق طراحی نهایی StudentWork.
 * همین ساختار هم در Sidebar دسکتاپ و هم در کشوی ناوبری موبایل استفاده می‌شود.
 */
export const dashboardNav: NavItem[] = [
  { key: 'dashboard', label: 'داشبورد', Icon: IconGrid, to: '/dashboard' },
  { key: 'profile', label: 'پروفایل', Icon: IconUser, to: '/profile' },
  { key: 'notifications', label: 'اعلانات', Icon: IconBell, to: '/notifications' },
  {
    key: 'projects-active',
    label: 'پروژه‌های فعال',
    Icon: IconBolt,
    children: [
      { to: '/projects/active/worker', label: 'کارجو' },
      { to: '/projects/active/employer', label: 'کارفرما' },
    ],
  },
  {
    key: 'projects-history',
    label: 'تاریخچه پروژه‌ها',
    Icon: IconArchive,
    children: [
      { to: '/projects/history/worker', label: 'کارجو' },
      { to: '/projects/history/employer', label: 'کارفرما' },
    ],
  },
  {
    key: 'applications',
    label: 'درخواست‌های همکاری',
    Icon: IconHandshake,
    children: [
      { to: '/applications/sent', label: 'ارسال‌شده' },
      { to: '/applications/received', label: 'دریافت‌شده' },
    ],
  },
  { key: 'my-tasks', label: 'تسک‌های ثبت‌شده', Icon: IconTasks, to: '/my-tasks' },
  {
    key: 'complaints',
    label: 'شکایات',
    Icon: IconWarning,
    children: [
      { to: '/complaints/mine', label: 'شکایات من' },
      { to: '/complaints/related', label: 'شکایات مربوط به پروژه‌های من' },
    ],
  },
  { key: 'satisfaction', label: 'میزان رضایت', Icon: IconSmile, to: '/satisfaction' },
]

/** ناوبری پایین صفحه در موبایل — میان‌بر پنج مقصد پرکاربرد */
export const bottomNav: Array<{ to: string; label: string; Icon: IconType; match: string[] }> = [
  { to: '/dashboard', label: 'داشبورد', Icon: IconGrid, match: ['/dashboard'] },
  { to: '/projects/active/worker', label: 'پروژه‌ها', Icon: IconBriefcase, match: ['/projects'] },
  { to: '/my-tasks', label: 'تسک‌ها', Icon: IconTasks, match: ['/my-tasks'] },
  { to: '/notifications', label: 'اعلانات', Icon: IconBell, match: ['/notifications'] },
  { to: '/profile', label: 'پروفایل', Icon: IconUser, match: ['/profile'] },
]

export function isPathActive(pathname: string, target: string): boolean {
  return pathname === target || pathname.startsWith(`${target}/`)
}

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.to && isPathActive(pathname, item.to)) return true
  if (item.children?.some((child) => isPathActive(pathname, child.to))) return true
  return Boolean(item.match?.some((prefix) => isPathActive(pathname, prefix)))
}
