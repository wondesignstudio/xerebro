import { withdrawAction } from '@/viewmodels/auth/actions'
import { requireAuthUserWithConsentOrRedirect } from '@/viewmodels/auth/guards'
import WithdrawModal from '@/ui/components/WithdrawModal'
import AppNavigation from '@/ui/components/AppNavigation'
import AppBreadcrumbs from '@/ui/components/AppBreadcrumbs'
import GsapReveal from '@/ui/components/GsapReveal'

export default async function SettingsPage() {
  const { user } = await requireAuthUserWithConsentOrRedirect()

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 pb-8 pt-3 sm:px-6 sm:pb-10 sm:pt-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <AppNavigation currentPath="/settings" />
        <AppBreadcrumbs items={[{ label: '대시보드', href: '/dashboard' }, { label: '설정' }]} />
        <GsapReveal>
          <header className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Settings</p>
            <h1 className="mt-1 text-[22px] font-semibold text-slate-900">설정</h1>
            <p className="mt-2 text-sm text-slate-500">
              계정 및 서비스 설정을 관리합니다.
            </p>
          </header>
        </GsapReveal>

        <GsapReveal delay={0.06}>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">계정 정보</h2>
            <div className="mt-4 text-sm text-slate-600">
              <p>이메일: {user.email ?? '미등록'}</p>
            </div>
          </section>
        </GsapReveal>

        <GsapReveal delay={0.12}>
          <section className="rounded-xl border border-rose-200 bg-rose-50/30 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-rose-700">Danger Zone</h2>
                <p className="mt-2 text-sm text-rose-600">
                  계정 삭제는 되돌릴 수 없습니다. 신중하게 진행해 주세요.
                </p>
              </div>
            </div>
            <WithdrawModal action={withdrawAction} />
          </section>
        </GsapReveal>
      </div>
    </main>
  )
}
