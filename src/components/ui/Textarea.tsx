import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { controlClasses } from './Field'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export function Textarea({ invalid, className, rows = 5, ...rest }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(controlClasses(invalid), 'py-2.5 leading-7', className)}
      {...rest}
    />
  )
}
