'use client'

import { useMemo, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { HOSTED_PAGE_SLUG_MAX_LENGTH, normalizeHostedPageSlug } from '@/domain/hostedPage'
import { Button } from '@/ui/components/ui/button'

type HostedPageSettingsFormProps = {
  hostedPageId: string
  defaultSlug: string
  defaultThemeColor: string | null
  defaultIsPublished: boolean
  redirectTo?: string
  feedbackState?: 'idle' | 'saved' | 'failed'
  action: (formData: FormData) => Promise<void>
}

type SubmitButtonProps = {
  isDirty: boolean
  isBlocked: boolean
  feedbackState: 'idle' | 'saved' | 'failed'
}

type FormStateHintProps = {
  isDirty: boolean
}

function normalizeValue(value: string) {
  return value.trim()
}

function normalizeThemeColor(value: string) {
  return value.trim().toLowerCase()
}

function SubmitButton({ isDirty, isBlocked, feedbackState }: SubmitButtonProps) {
  const { pending } = useFormStatus()
  const label = pending
    ? '저장 중...'
    : feedbackState === 'saved'
      ? '저장됨'
      : feedbackState === 'failed'
        ? '저장 실패'
        : '변경사항 저장'

  return (
    <Button
      type="submit"
      disabled={pending || !isDirty || isBlocked}
      className="w-full sm:w-auto"
      aria-disabled={pending || !isDirty || isBlocked}
    >
      {label}
    </Button>
  )
}

function FormStateHint({ isDirty }: FormStateHintProps) {
  const { pending } = useFormStatus()

  if (pending) {
    return <p className="text-xs text-slate-500">설정을 저장하고 있습니다...</p>
  }

  if (isDirty) {
    return <p className="text-xs text-emerald-700">변경사항이 있습니다. 저장 후 즉시 반영됩니다.</p>
  }

  return <p className="text-xs text-slate-500">변경된 항목이 없습니다.</p>
}

export default function HostedPageSettingsForm({
  hostedPageId,
  defaultSlug,
  defaultThemeColor,
  defaultIsPublished,
  redirectTo,
  feedbackState = 'idle',
  action,
}: HostedPageSettingsFormProps) {
  const normalizedDefaultSlug = normalizeValue(defaultSlug)
  const normalizedDefaultThemeColor = normalizeThemeColor(defaultThemeColor ?? '')
  const defaultPublishedValue = defaultIsPublished ? 'true' : 'false'

  const [slug, setSlug] = useState(defaultSlug)
  const [themeColor, setThemeColor] = useState(defaultThemeColor ?? '')
  const [isPublished, setIsPublished] = useState(defaultPublishedValue)
  const normalizedSlug = useMemo(() => normalizeHostedPageSlug(slug), [slug])
  const isSlugInputProvided = slug.trim().length > 0
  const isSlugInvalid = isSlugInputProvided && normalizedSlug.length === 0
  const isSlugTooLong = normalizedSlug.length > HOSTED_PAGE_SLUG_MAX_LENGTH
  const isSubmitBlocked = isSlugInvalid || isSlugTooLong

  const isDirty = useMemo(() => {
    const slugChanged = normalizeValue(slug) !== normalizedDefaultSlug
    const themeColorChanged = normalizeThemeColor(themeColor) !== normalizedDefaultThemeColor
    const publishChanged = isPublished !== defaultPublishedValue
    return slugChanged || themeColorChanged || publishChanged
  }, [
    defaultPublishedValue,
    isPublished,
    normalizedDefaultSlug,
    normalizedDefaultThemeColor,
    slug,
    themeColor,
  ])

  return (
    <form action={action} className="mt-5 space-y-5">
      <input type="hidden" name="hostedPageId" value={hostedPageId} />
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2.5">
          <span className="text-sm font-semibold text-slate-800">Slug</span>
          <input
            type="text"
            name="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            aria-invalid={isSubmitBlocked}
            className={`h-10 rounded-md border bg-white px-3 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 ${
              isSubmitBlocked
                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                : 'border-slate-300 focus:border-slate-500 focus:ring-slate-200'
            }`}
          />
          {isSlugInvalid ? (
            <span className="text-xs text-rose-600">영문/숫자/하이픈(-) 조합으로 입력해 주세요.</span>
          ) : isSlugTooLong ? (
            <span className="text-xs text-rose-600">
              slug는 최대 {HOSTED_PAGE_SLUG_MAX_LENGTH}자까지 입력할 수 있습니다.
            </span>
          ) : (
            <span className="text-xs text-slate-500">
              영문/숫자/하이픈(-) 조합, 최대 {HOSTED_PAGE_SLUG_MAX_LENGTH}자 ({normalizedSlug.length}/
              {HOSTED_PAGE_SLUG_MAX_LENGTH})
            </span>
          )}
        </label>

        <label className="flex flex-col gap-2.5">
          <span className="text-sm font-semibold text-slate-800">Theme Color</span>
          <input
            type="text"
            name="themeColor"
            value={themeColor}
            onChange={(event) => setThemeColor(event.target.value)}
            placeholder="#111827"
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
          <span className="text-xs text-slate-500">기본값을 사용하려면 비워두세요.</span>
        </label>
      </div>

      <label className="flex max-w-md flex-col gap-2.5">
        <span className="text-sm font-semibold text-slate-800">게시 상태</span>
        <select
          name="isPublished"
          value={isPublished}
          onChange={(event) => setIsPublished(event.target.value)}
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          <option value="true">게시 중</option>
          <option value="false">비공개</option>
        </select>
      </label>

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FormStateHint isDirty={isDirty} />
          <SubmitButton
            isDirty={isDirty}
            isBlocked={isSubmitBlocked}
            feedbackState={feedbackState}
          />
        </div>
      </div>
    </form>
  )
}
