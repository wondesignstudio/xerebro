import * as React from 'react'
import { cn } from '@/ui/components/ui/cn'

export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

type ButtonVariantOptions = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

const BASE_BUTTON_CLASS =
  'inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:pointer-events-none disabled:opacity-50'

const BUTTON_VARIANT_CLASS: Record<ButtonVariant, string> = {
  default: 'bg-slate-900 text-white hover:bg-slate-800',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
  outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  ghost: 'text-slate-700 hover:bg-slate-100',
  destructive: 'bg-rose-600 text-white hover:bg-rose-500',
}

const BUTTON_SIZE_CLASS: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3 py-2 text-xs',
  lg: 'h-11 px-6 py-3',
  icon: 'h-10 w-10',
}

export function buttonVariants(options: ButtonVariantOptions = {}) {
  const { variant = 'default', size = 'default', className } = options
  return cn(BASE_BUTTON_CLASS, BUTTON_VARIANT_CLASS[variant], BUTTON_SIZE_CLASS[size], className)
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'default', size = 'default', ...props },
  ref,
) {
  return <button ref={ref} className={buttonVariants({ variant, size, className })} {...props} />
})
