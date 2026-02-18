import Link from 'next/link'
import { signOutAction } from '@/viewmodels/auth/actions'
import ProAccessButton from '@/ui/components/ProAccessButton'
import { getRecentTransactions } from '@/viewmodels/transactions/queries'
import { getWalletSummary } from '@/viewmodels/wallets/queries'
import AppNavigation from '@/ui/components/AppNavigation'
import AppBreadcrumbs from '@/ui/components/AppBreadcrumbs'
import { isBrandCoreComplete } from '@/domain/userProfile'
import GsapReveal from '@/ui/components/GsapReveal'

export default async function DashboardPage() {
  const { user, profile, wallet, totalCredits } = await getWalletSummary()
  const transactions = await getRecentTransactions(10)
  const isPro = profile?.currentPlan === 'pro'
  const hasBrandCore = isBrandCoreComplete(profile)

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 pb-8 pt-3 sm:px-6 sm:pb-10 sm:pt-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <AppNavigation currentPath="/dashboard" />
        <AppBreadcrumbs items={[{ label: '대시보드' }]} />
        <GsapReveal>
          <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Dashboard</p>
              <h1 className="mt-1 text-[22px] font-semibold text-slate-900">
                안녕하세요{user.email ? `, ${user.email}` : ''}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                오늘의 리드 확인 전 잔액을 확인하세요.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/settings"
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                설정
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  로그아웃
                </button>
              </form>
            </div>
          </header>
        </GsapReveal>

        <GsapReveal delay={0.05}>
          <section className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-400">총 크레딧</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {totalCredits}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-400">무료 크레딧</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {wallet?.freeCredits ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-400">구독/구매 크레딧</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {(wallet?.subscriptionCredits ?? 0) + (wallet?.purchasedCredits ?? 0)}
              </p>
            </div>
          </section>
        </GsapReveal>

        <GsapReveal delay={0.1}>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Brand Identity</h2>
                <p className="mt-1 text-sm text-slate-500">
                  AI 학습 품질을 높이기 위한 업종/타겟/USP 및 말투 설정입니다.
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-400">
                  상태: {hasBrandCore ? 'Core Interview 완료' : 'Core Interview 미완료'}
                </p>
              </div>
              <Link
                href="/brand-identity"
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                브랜드 설정 열기
              </Link>
            </div>
          </section>
        </GsapReveal>

        <GsapReveal delay={0.14}>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">My Landing Page</h2>
                <p className="mt-1 text-sm text-slate-500">
                  나만의 랜딩 페이지를 AI로 빠르게 생성하고 편집하세요.
                </p>
              </div>
              <ProAccessButton
                isPro={isPro}
                href="/hosted-pages"
                label="랜딩 페이지 만들기"
              />
            </div>
            {!isPro ? (
              <p className="mt-3 text-xs font-semibold text-slate-400">
                PRO 플랜에서만 랜딩 페이지 빌더를 사용할 수 있습니다.
              </p>
            ) : null}
          </section>
        </GsapReveal>

        <GsapReveal delay={0.18}>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">거래 장부</h2>
                <p className="mt-1 text-sm text-slate-500">
                  최근 거래 내역 10건입니다.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {transactions.length === 0 ? (
                <p className="text-sm text-slate-400">거래 내역이 없습니다.</p>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col gap-2 rounded-lg border border-slate-100 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">
                        {transaction.description || transaction.type}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(transaction.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        transaction.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {transaction.amount >= 0 ? '+' : ''}
                      {transaction.amount}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </GsapReveal>
      </div>
    </main>
  )
}
