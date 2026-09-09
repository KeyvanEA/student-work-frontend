import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { controlClasses } from './Field'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export function Input({ invalid, className, ...rest }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(controlClasses(invalid), 'h-11', className)}
      {...rest}
    />
  )
}
