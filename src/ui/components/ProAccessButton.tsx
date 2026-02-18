'use client'

import Link from 'next/link'
import { useState } from 'react'

type ProAccessButtonProps = {
  isPro: boolean
  href: string
  label: string
}

export default function ProAccessButton({ isPro, href, label }: ProAccessButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (isPro) {
    return (
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
      >
        {label}
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
        onClick={() => setIsOpen(true)}
      >
        {label}
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
          PRO
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4 text-slate-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 11V8a5 5 0 0110 0v3m-9 0h8a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6a2 2 0 012-2z"
          />
        </svg>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Pro 전용 기능</h2>
              <p className="mt-2 text-sm text-slate-500">
                랜딩 페이지 빌더는 Pro 플랜에서만 이용할 수 있습니다.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                onClick={() => setIsOpen(false)}
              >
                나중에
              </button>
              <Link
                href="/pricing"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                요금제 보기
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
