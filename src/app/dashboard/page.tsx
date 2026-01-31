import { signOutAction } from '@/viewmodels/auth/actions'
import { getRecentTransactions } from '@/viewmodels/transactions/queries'
import { getWalletSummary } from '@/viewmodels/wallets/queries'

export default async function DashboardPage() {
  const { user, wallet, totalCredits } = await getWalletSummary()
  const transactions = await getRecentTransactions(10)

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Dashboard</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              안녕하세요{user.email ? `, ${user.email}` : ''}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              오늘의 리드 확인 전 잔액을 확인하세요.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/settings"
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              설정
            </a>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                로그아웃
              </button>
            </form>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">총 크레딧</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {totalCredits}
            </p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">무료 크레딧</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {wallet?.freeCredits ?? 0}
            </p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">구독/구매 크레딧</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {(wallet?.subscriptionCredits ?? 0) + (wallet?.purchasedCredits ?? 0)}
            </p>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
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
      </div>
    </main>
  )
}
