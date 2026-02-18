import Link from 'next/link'
import { createHostedPageAction, updateHostedPageAction } from '@/viewmodels/hostedPages/actions'
import { getHostedPagesForCurrentUser } from '@/viewmodels/hostedPages/queries'
import AppNavigation from '@/ui/components/AppNavigation'
import AppBreadcrumbs from '@/ui/components/AppBreadcrumbs'
import GsapReveal from '@/ui/components/GsapReveal'
import HostedPageCreateForm from '@/ui/components/HostedPageCreateForm'
import { buttonVariants } from '@/ui/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/ui/card'
import { Badge } from '@/ui/components/ui/badge'

export const dynamic = 'force-dynamic'
export const preferredRegion = ['icn1', 'hnd1']

type HostedPagesPageProps = {
  searchParams?: {
    created?: string
    updated?: string
    deleted?: string
    error?: string
  }
}

const STATUS_COPY: Record<string, string> = {
  created: '새 랜딩 페이지가 생성되었습니다.',
  updated: '랜딩 페이지가 업데이트되었습니다.',
  deleted: '랜딩 페이지가 삭제되었습니다.',
  slug_taken: '이미 사용 중인 주소입니다. 다른 slug를 입력해 주세요.',
  invalid_slug: '사용할 수 없는 slug입니다. 다시 입력해 주세요.',
  slug_too_long: 'slug는 최대 40자까지 입력할 수 있습니다.',
  invalid_layout: '레이아웃 설정이 올바르지 않습니다.',
  create_failed: '랜딩 페이지 생성에 실패했습니다.',
  update_failed: '랜딩 페이지 업데이트에 실패했습니다.',
  delete_failed: '랜딩 페이지 삭제에 실패했습니다.',
  not_found: '해당 랜딩 페이지를 찾을 수 없습니다.',
}

const CREATE_FORM_ERROR_KEYS = new Set([
  'slug_taken',
  'invalid_slug',
  'slug_too_long',
  'invalid_layout',
  'create_failed',
])

export default async function HostedPagesPage({ searchParams }: HostedPagesPageProps) {
  const hostedPages = await getHostedPagesForCurrentUser()
  const appBaseUrl = process.env.APP_BASE_URL || 'https://xerebro.me'
  const errorKey = searchParams?.error
  const createFeedbackState: 'idle' | 'created' | 'failed' = searchParams?.created
    ? 'created'
    : errorKey && CREATE_FORM_ERROR_KEYS.has(errorKey)
      ? 'failed'
      : 'idle'
  const statusKey = errorKey ?? (searchParams?.created ? 'created' : searchParams?.updated ? 'updated' : searchParams?.deleted ? 'deleted' : '')
  const statusMessage = statusKey ? STATUS_COPY[statusKey] : null
  const statusTone = errorKey ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
  const totalCount = hostedPages.length
  const publishedCount = hostedPages.filter((page) => page.isPublished).length

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 pb-8 pt-3 sm:px-6 sm:pb-10 sm:pt-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">
        <AppNavigation currentPath="/hosted-pages" />
        <AppBreadcrumbs
          items={[
            { label: '대시보드', href: '/dashboard' },
            { label: '랜딩 페이지' },
          ]}
        />
        {statusMessage ? (
          <div className={`rounded-lg border px-4 py-3 text-sm font-semibold ${statusTone}`}>
            {statusMessage}
          </div>
        ) : null}

        <GsapReveal>
          <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardHeader className="space-y-3 border-b border-slate-100 p-5 pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="text-[24px] tracking-tight text-slate-900">랜딩 페이지</CardTitle>
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  PRO
                </Badge>
              </div>
              <CardDescription className="text-sm text-slate-500">
                게시 가능한 랜딩 페이지를 생성하고 상태를 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <HostedPageCreateForm
                  action={createHostedPageAction}
                  feedbackState={createFeedbackState}
                />
                <Link
                  href="/dashboard"
                  className={buttonVariants({ variant: 'outline', className: 'h-10 w-auto' })}
                >
                  대시보드로 돌아가기
                </Link>
              </div>
            </CardContent>
          </Card>
        </GsapReveal>

        <GsapReveal delay={0.06}>
          <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 p-5 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg text-slate-900">내 페이지</CardTitle>
                <Badge variant="outline" className="rounded-full">
                  전체 {totalCount}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  게시 {publishedCount}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {hostedPages.length === 0 ? (
                <div className="px-5 pb-5 pt-1 text-sm text-slate-500">
                  생성된 페이지가 없습니다. 상단에서 첫 페이지를 만들어 주세요.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {hostedPages.map((page) => {
                    const publicPagePath = `/p/${page.slug}`
                    const publicPageUrl = `${appBaseUrl}${publicPagePath}`

                    return (
                      <li key={page.id} className="px-5 py-4">
                        <article className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="break-all text-base font-semibold text-slate-900">{page.slug}</p>
                              {page.isPublished ? (
                                <Badge className="rounded-full">게시 중</Badge>
                              ) : (
                                <Badge variant="outline" className="rounded-full">
                                  비공개
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              생성일{' '}
                              {page.createdAt
                                ? new Date(page.createdAt).toLocaleString('ko-KR')
                                : '—'}
                            </p>
                            <p className="text-xs text-slate-500">
                              공개 URL:{' '}
                              {page.isPublished ? (
                                <Link
                                  href={publicPagePath}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="break-all font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
                                >
                                  {publicPageUrl}
                                </Link>
                              ) : (
                                <span className="text-slate-500">비공개 상태입니다.</span>
                              )}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                            {page.isPublished ? (
                              <Link
                                href={publicPagePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={buttonVariants({
                                  size: 'sm',
                                  className: 'w-full sm:w-auto whitespace-nowrap',
                                })}
                              >
                                공개 페이지 보기
                              </Link>
                            ) : null}
                            <Link
                              href={`/hosted-pages/${page.id}`}
                              className={buttonVariants({
                                variant: 'outline',
                                size: 'sm',
                                className: 'w-full sm:w-auto whitespace-nowrap',
                                })}
                              >
                                편집
                            </Link>
                            <form action={updateHostedPageAction}>
                              <input type="hidden" name="hostedPageId" value={page.id} />
                              <input
                                type="hidden"
                                name="isPublished"
                                value={page.isPublished ? 'false' : 'true'}
                              />
                              <button
                                type="submit"
                                className={buttonVariants({
                                  variant: 'ghost',
                                  size: 'sm',
                                  className: 'w-full sm:w-auto whitespace-nowrap',
                                })}
                              >
                                {page.isPublished ? '비공개 전환' : '게시하기'}
                              </button>
                            </form>
                          </div>
                        </article>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </GsapReveal>
      </div>
    </main>
  )
}
