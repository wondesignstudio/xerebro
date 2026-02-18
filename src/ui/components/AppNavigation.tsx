import Link from 'next/link'
import { cn } from '@/ui/components/ui/cn'

type AppNavigationProps = {
  currentPath: string
}

type NavItem = {
  href: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: '대시보드' },
  { href: '/brand-identity', label: '브랜드' },
  { href: '/leads', label: '리드' },
  { href: '/hosted-pages', label: '랜딩 페이지' },
  { href: '/settings', label: '설정' },
  { href: '/pricing', label: '요금제' },
]

function isActivePath(currentPath: string, href: string) {
  if (currentPath === href) {
    return true
  }

  return currentPath.startsWith(`${href}/`)
}

export default function AppNavigation({ currentPath }: AppNavigationProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-2 py-3 sm:px-3">
        <Link
          href="/dashboard"
          prefetch
          className="shrink-0 text-[15px] font-semibold tracking-tight text-slate-900"
        >
          XEREBRO
        </Link>
        <nav className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto whitespace-nowrap">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(currentPath, item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
