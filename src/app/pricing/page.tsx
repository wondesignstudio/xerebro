import Link from 'next/link'
import AppNavigation from '@/ui/components/AppNavigation'
import AppBreadcrumbs from '@/ui/components/AppBreadcrumbs'

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <AppNavigation currentPath="/pricing" />
        <AppBreadcrumbs items={[{ label: '요금제' }]} />
        <header className="text-center">
          <p className="text-sm font-semibold text-slate-500">Pricing</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">요금제 안내</h1>
          <p className="mt-3 text-sm text-slate-500">
            필요에 따라 Free, Pro, Credit 중 선택하세요.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Free</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                기본
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900">₩0</p>
            <p className="mt-1 text-sm text-slate-500">리드 탐색 & 기본 도구</p>
            <ul className="mt-5 space-y-2 text-sm text-slate-600">
              <li>일일 추천 리드 5건</li>
              <li>AI 멘트 수정</li>
              <li>리드 신고 보상</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-900 bg-slate-900 p-6 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Pro</h2>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold">
                추천
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold">문의</p>
            <p className="mt-1 text-sm text-white/70">브랜드 소유를 위한 기능</p>
            <ul className="mt-5 space-y-2 text-sm text-white/80">
              <li>Hosted Page Builder (랜딩 페이지)</li>
              <li>고급 페이지 설정</li>
              <li>우선 지원</li>
            </ul>
            <Link
              href="/settings"
              className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900"
            >
              업그레이드 문의
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Credit</h2>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                충전형
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900">유연 결제</p>
            <p className="mt-1 text-sm text-slate-500">필요할 때만 충전</p>
            <ul className="mt-5 space-y-2 text-sm text-slate-600">
              <li>추가 리드 열람</li>
              <li>캠페인 집중 사용</li>
              <li>유효기간 없음</li>
            </ul>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 text-sm text-slate-500 shadow-sm">
          현재 결제는 준비 중입니다. Pro 업그레이드는 설정 페이지에서 문의해 주세요.
        </section>
      </div>
    </main>
  )
}
