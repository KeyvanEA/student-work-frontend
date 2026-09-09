import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { controlClasses } from './Field'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export function Select({ invalid, className, children, ...rest }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cn(controlClasses(invalid), 'h-11 appearance-none bg-left bg-no-repeat pe-3.5', className)}
      {...rest}
    >
      {children}
    </select>
  )
}
