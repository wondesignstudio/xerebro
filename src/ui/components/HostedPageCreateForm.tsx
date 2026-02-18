'use client'

import { useMemo, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import {
  HOSTED_PAGE_SLUG_MAX_LENGTH,
  normalizeHostedPageSlug,
} from '@/domain/hostedPage'
import { Button } from '@/ui/components/ui/button'

type HostedPageCreateFormProps = {
  action: (formData: FormData) => Promise<void>
  feedbackState?: 'idle' | 'created' | 'failed'
}

type CreateSubmitButtonProps = {
  locked: boolean
  feedbackState: 'idle' | 'created' | 'failed'
}

function CreateSubmitButton({ locked, feedbackState }: CreateSubmitButtonProps) {
  const { pending } = useFormStatus()
  const isSubmitting = pending || locked
  const label = isSubmitting
    ? '생성 중...'
    : feedbackState === 'created'
      ? '생성됨'
      : feedbackState === 'failed'
        ? '생성 실패'
        : '새 랜딩 페이지 만들기'

  return (
    <Button
      type="submit"
      className="h-10 min-w-[170px] justify-center"
      disabled={isSubmitting}
      aria-disabled={isSubmitting}
      aria-busy={isSubmitting}
    >
      {label}
    </Button>
  )
}

export default function HostedPageCreateForm({ action, feedbackState = 'idle' }: HostedPageCreateFormProps) {
  const submitLockRef = useRef(false)
  const [isLocked, setIsLocked] = useState(false)
  const [slug, setSlug] = useState('')

  const normalizedSlug = useMemo(() => normalizeHostedPageSlug(slug), [slug])
  const isSlugInputProvided = slug.trim().length > 0
  const isSlugInvalid = isSlugInputProvided && normalizedSlug.length === 0
  const isSlugTooLong = normalizedSlug.length > HOSTED_PAGE_SLUG_MAX_LENGTH
  const isSubmitBlocked = isSlugInvalid || isSlugTooLong

  async function handleCreate(formData: FormData) {
    // Prevent accidental duplicate submits before route transition starts.
    if (submitLockRef.current) {
      return
    }

    submitLockRef.current = true
    setIsLocked(true)

    try {
      await action(formData)
    } finally {
      submitLockRef.current = false
      setIsLocked(false)
    }
  }

  return (
    <form action={handleCreate} className="flex flex-wrap items-center gap-2.5">
      <div className="w-full min-w-0 sm:w-72">
        <input
          type="text"
          name="slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          placeholder={`선택 입력: slug (최대 ${HOSTED_PAGE_SLUG_MAX_LENGTH}자)`}
          disabled={isLocked}
          aria-disabled={isLocked}
          aria-invalid={isSubmitBlocked}
          className={`h-10 w-full rounded-md border bg-white px-3 text-sm text-slate-700 focus:outline-none ${
            isSubmitBlocked
              ? 'border-rose-300 focus:border-rose-400'
              : 'border-slate-200 focus:border-slate-400'
          }`}
        />
        {isSlugInvalid ? (
          <p className="mt-1 text-xs text-rose-600">영문/숫자/하이픈(-) 조합으로 입력해 주세요.</p>
        ) : isSlugTooLong ? (
          <p className="mt-1 text-xs text-rose-600">slug는 최대 {HOSTED_PAGE_SLUG_MAX_LENGTH}자까지 입력할 수 있습니다.</p>
        ) : (
          <p className="mt-1 text-xs text-slate-500">
            영문/숫자/하이픈(-) 조합, 최대 {HOSTED_PAGE_SLUG_MAX_LENGTH}자 ({normalizedSlug.length}/
            {HOSTED_PAGE_SLUG_MAX_LENGTH})
          </p>
        )}
      </div>
      <div className="self-start pt-0 sm:pt-0">
        <CreateSubmitButton locked={isLocked || isSubmitBlocked} feedbackState={feedbackState} />
      </div>
    </form>
  )
}
