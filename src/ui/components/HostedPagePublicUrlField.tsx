'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/ui/components/ui/button'

type HostedPagePublicUrlFieldProps = {
  isPublished: boolean
  publicUrl: string
  publicPath: string
}

export default function HostedPagePublicUrlField({
  isPublished,
  publicUrl,
  publicPath,
}: HostedPagePublicUrlFieldProps) {
  const [buttonLabel, setButtonLabel] = useState('URL 복사')
  const [feedbackState, setFeedbackState] = useState<'idle' | 'success' | 'error'>('idle')
  const [isCopying, setIsCopying] = useState(false)
  const dismissTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        window.clearTimeout(dismissTimerRef.current)
      }
    }
  }, [])

  function applyButtonFeedback(state: 'success' | 'error') {
    setFeedbackState(state)
    setButtonLabel(state === 'success' ? '복사됨' : '복사 실패')

    if (dismissTimerRef.current) {
      window.clearTimeout(dismissTimerRef.current)
    }

    dismissTimerRef.current = window.setTimeout(() => {
      setFeedbackState('idle')
      setButtonLabel('URL 복사')
      dismissTimerRef.current = null
    }, 2000)
  }

  async function handleCopyPublicUrl() {
    if (isCopying) {
      return
    }

    setIsCopying(true)

    try {
      await navigator.clipboard.writeText(publicUrl)
      applyButtonFeedback('success')
    } catch {
      applyButtonFeedback('error')
    } finally {
      setIsCopying(false)
    }
  }

  if (!isPublished) {
    return <p className="mt-1 text-sm text-slate-600">비공개 상태입니다.</p>
  }

  return (
    <>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <Link
          href={publicPath}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
        >
          {publicUrl}
        </Link>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isCopying}
          aria-disabled={isCopying}
          aria-live="polite"
          className={`h-7 w-auto px-2 text-xs ${
            feedbackState === 'success'
              ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
              : feedbackState === 'error'
                ? 'border-rose-300 text-rose-700 hover:bg-rose-50'
                : ''
          }`}
          onClick={() => void handleCopyPublicUrl()}
        >
          {buttonLabel}
        </Button>
      </div>
    </>
  )
}
