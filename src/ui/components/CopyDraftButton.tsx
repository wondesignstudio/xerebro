'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CopyLeadResult } from '@/viewmodels/leads/actions'

type CopyDraftButtonProps = {
  leadId: string
  draftMessage: string | null
  contentSummary: string | null
  originalUrl: string | null
  onCopied: (formData: FormData) => Promise<CopyLeadResult>
}

export default function CopyDraftButton({
  leadId,
  draftMessage,
  contentSummary,
  originalUrl,
  onCopied,
}: CopyDraftButtonProps) {
  // Local toast state for copy feedback.
  const [toastVisible, setToastVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const fallbackMessage = [contentSummary, originalUrl].filter(Boolean).join('\n')
  const messageToCopy = (draftMessage && draftMessage.trim()) || fallbackMessage

  async function handleCopy() {
    if (!messageToCopy) {
      setErrorMessage('복사할 내용이 없습니다.')
      return
    }

    try {
      await navigator.clipboard.writeText(messageToCopy)

      const formData = new FormData()
      formData.set('leadId', leadId)

      const result = await onCopied(formData)

      if (!result.ok) {
        setErrorMessage('리드 상태 업데이트에 실패했습니다.')
        return
      }

      setToastVisible(true)
      setTimeout(() => setToastVisible(false), 3000)
      router.refresh()
    } catch {
      setErrorMessage('복사에 실패했습니다. 다시 시도해 주세요.')
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleCopy}
        disabled={!messageToCopy}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        복사하기
      </button>
      {toastVisible ? (
        <div className="fixed bottom-6 right-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          복사되었습니다.
        </div>
      ) : null}
      {errorMessage ? (
        <div className="mt-2 text-xs text-rose-600">{errorMessage}</div>
      ) : null}
    </div>
  )
}
