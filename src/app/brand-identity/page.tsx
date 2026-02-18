import AppBreadcrumbs from '@/ui/components/AppBreadcrumbs'
import AppNavigation from '@/ui/components/AppNavigation'
import { Button } from '@/ui/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/ui/card'
import { Badge } from '@/ui/components/ui/badge'
import { submitBrandIdentityAction } from '@/viewmodels/auth/actions'
import { getBrandIdentityState } from '@/viewmodels/auth/queries'

type BrandIdentityPageProps = {
  searchParams?: {
    saved?: string
    error?: string
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid_tone: '허용되지 않는 페르소나 톤입니다.',
  save_failed: '브랜드 아이덴티티 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.',
}

export default async function BrandIdentityPage({ searchParams }: BrandIdentityPageProps) {
  const { profile, isCoreInterviewComplete, isPersonaConfigured } = await getBrandIdentityState()

  const errorKey = searchParams?.error
  const isSaved = searchParams?.saved === '1'
  const errorMessage = errorKey ? ERROR_MESSAGES[errorKey] : null
  const completedCount = [isCoreInterviewComplete, isPersonaConfigured].filter(Boolean).length
  const completionRate = Math.round((completedCount / 2) * 100)

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <AppNavigation currentPath="/brand-identity" />
        <AppBreadcrumbs
          items={[
            { label: '대시보드', href: '/dashboard' },
            { label: '브랜드 아이덴티티' },
          ]}
        />

        {isSaved ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            브랜드 아이덴티티가 저장되었습니다.
          </div>
        ) : null}
        {errorMessage ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="p-6 pb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Brand Identity
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <CardTitle className="text-2xl">AI 학습 센터</CardTitle>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                진행률 {completionRate}%
              </Badge>
            </div>
            <CardDescription className="mt-2">
              업종/타겟/USP와 말투를 설정하면 이후 AI 초안 품질이 안정적으로 맞춰집니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 p-6 pt-0 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Core Interview</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {isCoreInterviewComplete ? '완료' : '미완료'}
              </p>
              <p className="mt-1 text-xs text-slate-500">업종, 타겟, USP</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Persona Tuning</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {isPersonaConfigured ? '완료' : '미완료'}
              </p>
              <p className="mt-1 text-xs text-slate-500">톤, 표현 가이드</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-lg">브랜드 기본 정보 입력</CardTitle>
            <CardDescription>저장 즉시 다음 AI 요청부터 반영됩니다.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form action={submitBrandIdentityAction} className="space-y-6">
              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-slate-800">Core Interview</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                    업종
                    <input
                      type="text"
                      name="brandIndustry"
                      defaultValue={profile?.brandIndustry ?? ''}
                      placeholder="예: 웹디자인 스튜디오"
                      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 focus:border-slate-300 focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                    주요 타겟 고객
                    <input
                      type="text"
                      name="brandTargetAudience"
                      defaultValue={profile?.brandTargetAudience ?? ''}
                      placeholder="예: 소상공인, 1인 창업자"
                      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 focus:border-slate-300 focus:outline-none"
                    />
                  </label>
                </div>
                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                  USP (차별점)
                  <textarea
                    name="brandUsp"
                    defaultValue={profile?.brandUsp ?? ''}
                    placeholder="예: 48시간 내 시안 제안 + 전환 중심 카피 제공"
                    rows={3}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-700 focus:border-slate-300 focus:outline-none"
                  />
                </label>
              </section>

              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-slate-800">Persona Tuning</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                    기본 말투
                    <select
                      name="personaTone"
                      defaultValue={profile?.personaTone ?? ''}
                      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 focus:border-slate-300 focus:outline-none"
                    >
                      <option value="">선택 안 함</option>
                      <option value="polite">정중함</option>
                      <option value="friendly">친근함</option>
                      <option value="professional">전문가 톤</option>
                      <option value="bold">직설적/강조형</option>
                    </select>
                  </label>
                </div>
                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                  표현 가이드
                  <textarea
                    name="personaGuideline"
                    defaultValue={profile?.personaGuideline ?? ''}
                    placeholder="예: 과장 금지, 상대 Pain Point 먼저 공감, 마지막은 Soft CTA"
                    rows={3}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-700 focus:border-slate-300 focus:outline-none"
                  />
                </label>
              </section>

              <div className="flex justify-end">
                <Button type="submit">저장하기</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
