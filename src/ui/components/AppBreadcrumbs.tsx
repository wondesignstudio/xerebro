import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/ui/components/ui/breadcrumb'

type AppBreadcrumbNode = {
  label: string
  href?: string
}

type AppBreadcrumbsProps = {
  items: AppBreadcrumbNode[]
}

export default function AppBreadcrumbs({ items }: AppBreadcrumbsProps) {
  return (
    <div className="px-1">
      <Breadcrumb>
        <BreadcrumbList className="text-[12px] text-slate-400">
          {items.map((item, index) => {
            const isLast = index === items.length - 1

            return (
              <BreadcrumbItem key={`${item.label}-${index}`}>
                {item.href && !isLast ? (
                  <BreadcrumbLink
                    href={item.href}
                    className="rounded px-1 py-0.5 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    {item.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="font-medium text-slate-600">
                    {item.label}
                  </BreadcrumbPage>
                )}
                {!isLast ? <BreadcrumbSeparator /> : null}
              </BreadcrumbItem>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
