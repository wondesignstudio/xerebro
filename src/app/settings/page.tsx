import { withdrawAction } from '@/viewmodels/auth/actions'
import { requireAuthUserWithConsentOrRedirect } from '@/viewmodels/auth/guards'
import WithdrawModal from '@/ui/components/WithdrawModal'

export default async function SettingsPage() {
  const { user } = await requireAuthUserWithConsentOrRedirect()

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-10">
        <header className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Settings</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">설정</h1>
          <p className="mt-2 text-sm text-slate-500">
            계정 및 서비스 설정을 관리합니다.
          </p>
        </header>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">계정 정보</h2>
          <div className="mt-4 text-sm text-slate-600">
            <p>이메일: {user.email ?? '미등록'}</p>
          </div>
        </section>

        <section className="rounded-xl border border-rose-200 bg-rose-50/30 p-6 shadow-sm">
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
      </div>
    </main>
  )
}
