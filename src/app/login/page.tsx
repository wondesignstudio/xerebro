import { signInWithProvider } from '@/viewmodels/auth/actions'
import LoginToast from '@/ui/components/LoginToast'

type LoginPageProps = {
  searchParams?: Promise<{
    withdrawn?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const showWithdrawnToast = resolvedSearchParams?.withdrawn === '1'

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <LoginToast message="정상적으로 탈퇴되었습니다." isVisible={showWithdrawnToast} />
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-500">XEREBRO</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            3초 만에 시작하기
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            소셜 로그인으로 바로 시작하세요.
          </p>
        </div>

        <div className="space-y-3">
          <form action={signInWithProvider.bind(null, 'google')}>
            <button
              type="submit"
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Google로 시작하기
            </button>
          </form>
          <form action={signInWithProvider.bind(null, 'kakao')}>
            <button
              type="submit"
              className="w-full rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Kakao로 시작하기
            </button>
          </form>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          로그인 시 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </main>
  )
}
