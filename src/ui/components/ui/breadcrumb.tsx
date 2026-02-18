import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/ui/components/ui/cn'

export function Breadcrumb({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <nav aria-label="breadcrumb" className={className} {...props} />
}

export function BreadcrumbList({ className, ...props }: React.OlHTMLAttributes<HTMLOListElement>) {
  return <ol className={cn('flex flex-wrap items-center gap-2 text-xs text-slate-500', className)} {...props} />
}

export function BreadcrumbItem({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn('inline-flex items-center gap-2', className)} {...props} />
}

export function BreadcrumbLink({
  className,
  href,
  children,
}: {
  className?: string
  href: string
  children: React.ReactNode
}) {
  return (
    <Link href={href} className={cn('font-medium text-slate-500 hover:text-slate-900', className)}>
      {children}
    </Link>
  )
}

export function BreadcrumbPage({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('font-semibold text-slate-900', className)} {...props} />
}

export function BreadcrumbSeparator({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span aria-hidden className={cn('text-slate-300', className)} {...props}>
      /
    </span>
  )
}
