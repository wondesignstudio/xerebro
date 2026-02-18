'use client'

import { useEffect, useState } from 'react'

const SKELETON_THRESHOLD_MS = 1000

export default function SectionLoadingState() {
  const [isLongLoading, setIsLongLoading] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLongLoading(true)
    }, SKELETON_THRESHOLD_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  if (isLongLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
          <p className="text-sm font-medium text-slate-700">섹션을 불러오는 중입니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-3">
        <div className="h-6 w-44 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-slate-200/80" />
        <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-24 w-full animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  )
}
