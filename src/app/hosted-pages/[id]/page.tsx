import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  createContextLinkAction,
  deleteContextLinkAction,
  toggleContextLinkAction,
  updateHostedPageAction,
} from '@/viewmodels/hostedPages/actions'
import { isDebugAccessEnabled } from '@/viewmodels/auth/runtime'
import {
  getHostedPageDebugState,
  getHostedPageDetailContext,
  getHostedPageForDebug,
} from '@/viewmodels/hostedPages/queries'
import AppNavigation from '@/ui/components/AppNavigation'
import AppBreadcrumbs from '@/ui/components/AppBreadcrumbs'
import GsapReveal from '@/ui/components/GsapReveal'
import HostedPageContextLinksSectionClient from '@/ui/components/HostedPageContextLinksSectionClient'
import HostedPagePublicUrlField from '@/ui/components/HostedPagePublicUrlField'
import HostedPageSettingsForm from '@/ui/components/HostedPageSettingsForm'
import SectionLoadingState from '@/ui/components/SectionLoadingState'
import { buttonVariants } from '@/ui/components/ui/button'
import { Badge } from '@/ui/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/ui/card'

export const dynamic = 'force-dynamic'
export const preferredRegion = ['icn1', 'hnd1']

type HostedPageDetailProps = {
  params: Promise<{
    id: string
  }>
  searchParams?: Promise<{
    created?: string
    updated?: string
    context_created?: string
    context_updated?: string
    context_deleted?: string
    error?: string
    debug?: string
  }>
}

const STATUS_COPY: Record<string, string> = {
  created: '새 랜딩 페이지가 생성되었습니다.',
  updated: '랜딩 페이지가 업데이트되었습니다.',
  slug_taken: '이미 사용 중인 주소입니다. 다른 slug를 입력해 주세요.',
  invalid_slug: '사용할 수 없는 slug입니다. 다시 입력해 주세요.',
  slug_too_long: 'slug는 최대 40자까지 입력할 수 있습니다.',
  invalid_layout: '레이아웃 설정이 올바르지 않습니다.',
  update_failed: '업데이트에 실패했습니다.',
  not_found: '해당 랜딩 페이지를 찾을 수 없습니다.',
  missing_lead: '연결할 리드를 선택해 주세요.',
  invalid_context_slug: '컨텍스트 링크 slug 형식이 올바르지 않습니다.',
  context_slug_too_long: '컨텍스트 링크 slug는 최대 40자까지 입력할 수 있습니다.',
  context_slug_taken: '이미 사용 중인 컨텍스트 링크 주소입니다.',
  context_create_failed: '컨텍스트 링크 생성에 실패했습니다.',
  invalid_context_link: '컨텍스트 링크 정보가 올바르지 않습니다.',
  invalid_context_state: '컨텍스트 링크 상태 값이 올바르지 않습니다.',
  context_not_found: '해당 컨텍스트 링크를 찾을 수 없습니다.',
  context_update_failed: '컨텍스트 링크 상태 변경에 실패했습니다.',
  context_delete_failed: '컨텍스트 링크 삭제에 실패했습니다.',
  context_created: '컨텍스트 링크가 생성되었습니다.',
  context_updated: '컨텍스트 링크가 업데이트되었습니다.',
  context_deleted: '컨텍스트 링크가 삭제되었습니다.',
}

const SETTINGS_FORM_ERROR_KEYS = new Set([
  'missing_id',
  'slug_taken',
  'invalid_slug',
  'slug_too_long',
  'invalid_layout',
  'update_failed',
  'not_found',
])

export default async function HostedPageDetailPage({ params, searchParams }: HostedPageDetailProps) {
  const { id } = await params
  const appBaseUrl = process.env.APP_BASE_URL || 'https://xerebro.me'
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const debugRequested = resolvedSearchParams?.debug === '1'
  const debugEnabled = debugRequested && isDebugAccessEnabled()

  if (debugRequested && !debugEnabled) {
    redirect(`/hosted-pages/${id}`)
  }

  let debugState = null
  let debugViewState = null
  let hostedPageLoadFailed = false
  let debugLoadFailed = false
  let sessionUserId: string | null = null

  if (debugEnabled) {
    try {
      debugState = await getHostedPageDebugState(id)
    } catch {
      debugLoadFailed = true
    }

    try {
      debugViewState = await getHostedPageForDebug(id)
    } catch {
      debugLoadFailed = true
    }
  }

  let hostedPage = null
  if (debugEnabled) {
    hostedPage = debugViewState?.hostedPage ?? null
    sessionUserId = debugViewState?.user?.id ?? null
  } else {
    try {
      const detailContext = await getHostedPageDetailContext(id)
      hostedPage = detailContext.hostedPage
      sessionUserId = detailContext.user.id
    } catch {
      hostedPageLoadFailed = true
    }
  }
  const errorKey = resolvedSearchParams?.error
  const settingsFeedbackState: 'idle' | 'saved' | 'failed' = resolvedSearchParams?.updated
    ? 'saved'
    : errorKey && SETTINGS_FORM_ERROR_KEYS.has(errorKey)
      ? 'failed'
      : 'idle'
  const statusKey = errorKey ?? (
    resolvedSearchParams?.created
      ? 'created'
      : resolvedSearchParams?.updated
        ? 'updated'
        : resolvedSearchParams?.context_created
          ? 'context_created'
          : resolvedSearchParams?.context_updated
            ? 'context_updated'
            : resolvedSearchParams?.context_deleted
              ? 'context_deleted'
              : ''
  )
  const statusMessage = statusKey ? STATUS_COPY[statusKey] : null
  const statusTone = errorKey ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'

  if (!hostedPage) {
    const baseMessage = hostedPageLoadFailed
      ? '요청한 페이지를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
      : '요청한 랜딩 페이지가 존재하지 않거나 접근 권한이 없습니다.'
    const debugHint = debugEnabled
      ? debugViewState?.user
        ? debugViewState.profile?.currentPlan === 'pro'
          ? '세션은 있으나 페이지 접근에 실패했습니다. Debug Snapshot을 확인해 주세요.'
          : '현재 플랜이 PRO가 아닙니다. /pricing에서 업그레이드 후 다시 시도해 주세요.'
        : '현재 세션이 없습니다. 먼저 로그인 후 다시 시도해 주세요.'
      : null

    return (
      <main className="min-h-screen bg-[#f7f7f8] px-4 pb-8 pt-3 sm:px-6 sm:pb-10 sm:pt-4">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">
          <AppNavigation currentPath="/hosted-pages" />
          <AppBreadcrumbs
            items={[
              { label: '대시보드', href: '/dashboard' },
              { label: '랜딩 페이지', href: '/hosted-pages' },
              { label: '상세' },
            ]}
          />
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <h1 className="text-xl font-semibold text-slate-900">페이지를 찾을 수 없습니다</h1>
              <p className="mt-2 text-sm text-slate-500">
                {baseMessage}
              </p>
              {debugHint ? (
                <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  {debugHint}
                </p>
              ) : null}
              {debugEnabled && debugLoadFailed ? (
                <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Debug 정보를 불러오는 중 오류가 발생했습니다. 새로고침 후 다시 시도해 주세요.
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/hosted-pages/${id}`}
                  className={buttonVariants({ className: 'w-full sm:w-auto' })}
                >
                  다시 시도
                </Link>
                <Link
                  href="/hosted-pages"
                  className={buttonVariants({ variant: 'outline', size: 'sm', className: 'w-full sm:w-auto' })}
                >
                  목록으로 돌아가기
                </Link>
                <Link
                  href="/dashboard"
                  className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'w-full sm:w-auto' })}
                >
                  대시보드로 돌아가기
                </Link>
              </div>
            </CardContent>
          </Card>
          {debugState ? (
            <Card className="rounded-2xl border border-amber-200 bg-amber-50">
              <CardContent className="space-y-3 p-5 text-xs text-amber-900">
                <p className="text-sm font-semibold">Debug Snapshot</p>
                <p>sessionEmail: {debugViewState?.user?.email ?? '—'}</p>
                <p>currentPlan: {debugViewState?.profile?.currentPlan ?? '—'}</p>
                <p>sessionUserId: {debugState.sessionUserId ?? '—'}</p>
                <p>hostedPageId: {debugState.hostedPageId}</p>
                <p>rlsError: {debugState.rlsError ?? '—'}</p>
                <p>adminError: {debugState.adminError ?? '—'}</p>
                <pre className="overflow-x-auto rounded-md bg-white/80 p-3 text-[11px]">
                  {JSON.stringify({ rls: debugState.rls, admin: debugState.admin }, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>
    )
  }

  const hostedPagePath = `/p/${hostedPage.slug}`
  const hostedPageUrl = `${appBaseUrl}${hostedPagePath}`
  const breadcrumbSlugLabel = hostedPage.slug.length > 24
    ? `${hostedPage.slug.slice(0, 24)}...`
    : hostedPage.slug

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 pb-8 pt-3 sm:px-6 sm:pb-10 sm:pt-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">
        <AppNavigation currentPath="/hosted-pages" />
        <AppBreadcrumbs
          items={[
            { label: '대시보드', href: '/dashboard' },
            { label: '랜딩 페이지', href: '/hosted-pages' },
            { label: breadcrumbSlugLabel },
          ]}
        />

        {statusMessage ? (
          <div className={`rounded-lg border px-4 py-3 text-sm font-semibold ${statusTone}`}>
            {statusMessage}
          </div>
        ) : null}

        <GsapReveal>
          <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardHeader className="p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Hosted Page Detail
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="break-all text-[30px] leading-none tracking-tight text-slate-900">
                      {hostedPage.slug}
                    </CardTitle>
                    {hostedPage.isPublished ? (
                      <Badge className="rounded-full px-3 py-1">게시 중</Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-full px-3 py-1">
                        비공개
                      </Badge>
                    )}
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                      Public Url
                    </p>
                    <HostedPagePublicUrlField
                      isPublished={hostedPage.isPublished}
                      publicUrl={hostedPageUrl}
                      publicPath={hostedPagePath}
                    />
                  </div>
                  <CardDescription className="text-xs text-slate-500">
                    마지막 수정은 아래 설정 영역에서 즉시 반영됩니다.
                  </CardDescription>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  {hostedPage.isPublished ? (
                    <Link
                      href={hostedPagePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ size: 'sm', className: 'w-full sm:w-auto whitespace-nowrap' })}
                    >
                      공개 페이지 보기
                    </Link>
                  ) : null}
                  <Link
                    href="/hosted-pages"
                    className={buttonVariants({ variant: 'outline', size: 'sm', className: 'w-full sm:w-auto whitespace-nowrap' })}
                  >
                    목록으로 돌아가기
                  </Link>
                  <Link
                    href="/dashboard"
                    className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'w-full sm:w-auto whitespace-nowrap' })}
                  >
                    대시보드로 돌아가기
                  </Link>
                </div>
              </div>
            </CardHeader>
          </Card>
        </GsapReveal>

        <GsapReveal delay={0.08}>
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold text-slate-900">페이지 설정</h2>
              <p className="mt-1 text-sm text-slate-500">
                slug, 테마 컬러, 게시 상태를 바로 수정할 수 있습니다.
              </p>
              <HostedPageSettingsForm
                hostedPageId={hostedPage.id}
                defaultSlug={hostedPage.slug}
                defaultThemeColor={hostedPage.themeColor}
                defaultIsPublished={hostedPage.isPublished}
                redirectTo={`/hosted-pages/${hostedPage.id}`}
                feedbackState={settingsFeedbackState}
                action={updateHostedPageAction}
              />
            </CardContent>
          </Card>
        </GsapReveal>

        {sessionUserId ? (
          <HostedPageContextLinksSectionClient
            hostedPageId={hostedPage.id}
            createContextLinkAction={createContextLinkAction}
            toggleContextLinkAction={toggleContextLinkAction}
            deleteContextLinkAction={deleteContextLinkAction}
          />
        ) : (
          <SectionLoadingState />
        )}

        {debugState ? (
          <GsapReveal delay={0.24}>
            <Card className="rounded-2xl border border-amber-200 bg-amber-50">
              <CardContent className="space-y-3 p-5 text-xs text-amber-900">
                <p className="text-sm font-semibold">Debug Snapshot</p>
                <p>sessionEmail: {debugViewState?.user?.email ?? '—'}</p>
                <p>currentPlan: {debugViewState?.profile?.currentPlan ?? '—'}</p>
                <p>sessionUserId: {debugState.sessionUserId ?? '—'}</p>
                <p>hostedPageId: {debugState.hostedPageId}</p>
                <p>rlsError: {debugState.rlsError ?? '—'}</p>
                <p>adminError: {debugState.adminError ?? '—'}</p>
                <pre className="overflow-x-auto rounded-md bg-white/80 p-3 text-[11px]">
                  {JSON.stringify({ rls: debugState.rls, admin: debugState.admin }, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </GsapReveal>
        ) : null}
      </div>
    </main>
  )
}
