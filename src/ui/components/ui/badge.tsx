import * as React from 'react'
import { cn } from '@/ui/components/ui/cn'

type BadgeVariant = 'default' | 'secondary' | 'outline'

const BADGE_VARIANT_CLASS: Record<BadgeVariant, string> = {
  default: 'bg-slate-900 text-white',
  secondary: 'bg-emerald-50 text-emerald-700',
  outline: 'border border-slate-200 text-slate-700',
}

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: BadgeVariant
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        BADGE_VARIANT_CLASS[variant],
        className,
      )}
      {...props}
    />
  )
}
