import type { ComponentType, SVGProps } from 'react'
import {
  IconBriefcase,
  IconChat,
  IconHome,
  IconTasks,
  IconUser,
} from '@/components/ui/Icons'

export interface NavItem {
  to: string
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  /** برای فعال‌شدن روی زیرمسیرها */
  match?: string[]
}

export const primaryNav: NavItem[] = [
  { to: '/', label: 'خانه', Icon: IconHome },
  { to: '/tasks', label: 'تسک‌ها', Icon: IconTasks, match: ['/tasks'] },
  { to: '/projects', label: 'پروژه‌ها', Icon: IconBriefcase, match: ['/projects', '/deliveries'] },
  { to: '/messages', label: 'گفتگوها', Icon: IconChat, match: ['/messages'] },
  { to: '/profile', label: 'پروفایل', Icon: IconUser, match: ['/profile'] },
]

export function isNavActive(item: NavItem, pathname: string): boolean {
  if (item.to === '/') return pathname === '/'
  const prefixes = item.match ?? [item.to]
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}
