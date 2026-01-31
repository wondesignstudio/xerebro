'use client'

import { useState } from 'react'

type WithdrawModalProps = {
  action: () => Promise<void>
}

export default function WithdrawModal({ action }: WithdrawModalProps) {
  // Local UI state to control the confirmation modal.
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mt-6">
      <button
        type="button"
        className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600"
        onClick={() => setIsOpen(true)}
      >
        회원 탈퇴
      </button>

      {isOpen ? (
        // Overlay + dialog for the secondary confirmation step.
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">정말로 탈퇴하시겠습니까?</h2>
              <p className="mt-2 text-sm text-slate-500">
                탈퇴 처리 시 계정은 비활성화되며, 재가입 제한이 적용될 수 있습니다.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                onClick={() => setIsOpen(false)}
              >
                취소
              </button>
              <form action={action}>
                <button
                  type="submit"
                  className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  탈퇴 진행
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
