import { redirect } from 'next/navigation'
import { getConsentState } from '@/viewmodels/auth/queries'
import { submitConsentAction } from '@/viewmodels/auth/actions'

type ConsentPageProps = {
  searchParams?: {
    error?: string
  }
}

export default async function ConsentPage({ searchParams }: ConsentPageProps) {
  const { user, profile, hasConsented } = await getConsentState()

  if (hasConsented) {
    redirect('/dashboard')
  }

  const showTermsError = searchParams?.error === 'terms_required'

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto w-full max-w-2xl rounded-xl bg-white p-8 shadow-sm">
        <header className="mb-6">
          <p className="text-sm font-semibold text-slate-500">Legal Consent</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            서비스 이용을 위한 약관 동의
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {user.email ? `${user.email} 계정으로` : '현재 계정으로'} 이용을
            시작합니다.
          </p>
        </header>

        <form action={submitConsentAction} className="space-y-6">
          <div className="space-y-3">
            <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 text-sm">
              <input
                name="terms"
                type="checkbox"
                className="mt-1"
                required
              />
              <span>
                <span className="font-semibold text-slate-900">필수</span>
                <span className="text-slate-600">
                  {' '}
                  서비스 이용약관 및 개인정보 처리방침에 동의합니다.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 text-sm">
              <input
                name="marketing"
                type="checkbox"
                className="mt-1"
                defaultChecked={profile?.marketingAgreed ?? false}
              />
              <span>
                <span className="font-semibold text-slate-900">선택</span>
                <span className="text-slate-600">
                  {' '}
                  이벤트/프로모션 알림 수신에 동의합니다.
                </span>
              </span>
            </label>
          </div>

          {showTermsError ? (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">
              약관 동의는 필수입니다.
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            동의하고 시작하기
          </button>
        </form>
      </div>
    </main>
  )
}
