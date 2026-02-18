'use client'

import { useEffect, useState } from 'react'

const SKELETON_THRESHOLD_MS = 1000

export default function RouteLoadingState() {
  const [isLongLoading, setIsLongLoading] = useState(false)

  useEffect(() => {
    // UX rule: use skeleton only during the first second of loading.
    const timer = window.setTimeout(() => {
      setIsLongLoading(true)
    }, SKELETON_THRESHOLD_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {isLongLoading ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />
              <div>
                <p className="text-sm font-semibold text-slate-900">화면을 불러오는 중입니다</p>
                <p className="mt-1 text-xs text-slate-500">
                  네트워크 또는 데이터 준비 상태에 따라 시간이 더 걸릴 수 있습니다.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <>
            <div className="h-16 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm" />
            <div className="h-6 w-40 animate-pulse rounded-md bg-slate-200/70" />
            <div className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm" />
            <div className="grid gap-3 md:grid-cols-3">
              <div className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />
              <div className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />
              <div className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />
            </div>
            <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm" />
          </>
        )}
      </div>
    </main>
  )
}
