import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm disabled:bg-brand-300',
  secondary:
    'bg-ink-100 text-ink-800 hover:bg-ink-200 active:bg-ink-300 border border-ink-200 disabled:text-ink-400',
  outline:
    'bg-white text-brand-700 border border-brand-200 hover:bg-brand-50 active:bg-brand-100 disabled:text-brand-300',
  ghost: 'bg-transparent text-ink-600 hover:bg-ink-100 active:bg-ink-200 disabled:text-ink-300',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm disabled:bg-rose-300',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm disabled:bg-emerald-300',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-11 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-5 text-[15px] gap-2 rounded-xl',
}

const BASE =
  'inline-flex select-none items-center justify-center font-semibold transition-colors duration-150 ' +
  'disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  block?: boolean
  icon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  icon,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(BASE, VARIANTS[variant], SIZES[size], block && 'w-full', className)}
      {...rest}
    >
      {loading ? <Spinner size={size === 'sm' ? 14 : 16} /> : icon}
      {children}
    </button>
  )
}

export interface LinkButtonProps {
  to: string
  variant?: Variant
  size?: Size
  block?: boolean
  icon?: ReactNode
  className?: string
  children?: ReactNode
  state?: unknown
}

export function LinkButton({
  to,
  variant = 'primary',
  size = 'md',
  block = false,
  icon,
  className,
  children,
  state,
}: LinkButtonProps) {
  return (
    <Link
      to={to}
      state={state as never}
      className={cn(BASE, VARIANTS[variant], SIZES[size], block && 'w-full', className)}
    >
      {icon}
      {children}
    </Link>
  )
}
