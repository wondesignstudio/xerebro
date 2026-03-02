'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  const digest = error.digest?.trim() ? error.digest : 'N/A'

  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#f7f7f8] px-4 py-6 sm:px-6 sm:py-8">
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Global Error
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
              일시적인 오류가 발생했습니다
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              잠시 후 다시 시도해 주세요. 문제가 반복되면 아래 오류 ID를 포함해 전달해 주세요.
            </p>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-slate-500">오류 ID (Digest)</p>
              <p className="mt-1 break-all text-sm font-semibold text-slate-800">{digest}</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                다시 시도
              </button>
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                대시보드로 이동
              </Link>
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                로그인으로 이동
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  )
}
