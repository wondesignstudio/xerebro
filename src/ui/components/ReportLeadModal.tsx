'use client'

import { useState } from 'react'

type ReportLeadModalProps = {
  leadId: string
  action: (formData: FormData) => Promise<void>
}

const reportReasons = [
  { code: 'spam', label: '스팸/광고성 내용' },
  { code: 'irrelevant', label: '내 서비스와 무관' },
  { code: 'low_quality', label: '내용이 부실함' },
  { code: 'duplicate', label: '중복 리드' },
  { code: 'other', label: '기타' },
]

export default function ReportLeadModal({ leadId, action }: ReportLeadModalProps) {
  // Local UI state to control the report modal.
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600"
        onClick={() => setIsOpen(true)}
      >
        신고하기
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">불량 리드 신고</h2>
              <p className="mt-2 text-sm text-slate-500">
                신고 내용은 즉시 보상 처리되며, 데이터 품질 향상에 활용됩니다.
              </p>
            </div>

            <form action={action} className="space-y-4">
              <input type="hidden" name="leadId" value={leadId} />

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">신고 사유</p>
                <div className="space-y-2">
                  {reportReasons.map((reason) => (
                    <label
                      key={reason.code}
                      className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <input
                        type="radio"
                        name="reasonCode"
                        value={reason.code}
                        required
                        className="mt-1"
                      />
                      <span className="text-slate-700">{reason.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700" htmlFor="reasonDetail">
                  어떤 점이 별로였나요? (선택)
                </label>
                <textarea
                  id="reasonDetail"
                  name="reasonDetail"
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="간단한 설명을 남겨주세요."
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                  onClick={() => setIsOpen(false)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  신고하고 보상받기
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
