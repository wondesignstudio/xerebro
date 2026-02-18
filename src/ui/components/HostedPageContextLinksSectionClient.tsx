'use client'

import { useMemo, useState } from 'react'
import { CONTEXT_LINK_SLUG_MAX_LENGTH, normalizeContextLinkSlug } from '@/domain/contextLink'
import GsapReveal from '@/ui/components/GsapReveal'
import SectionLoadingState from '@/ui/components/SectionLoadingState'
import { useHostedPageContextData } from '@/viewmodels/hostedPages/client'
import { Button, buttonVariants } from '@/ui/components/ui/button'
import { Badge } from '@/ui/components/ui/badge'
import { Card, CardContent } from '@/ui/components/ui/card'

type HostedPageContextLinksSectionClientProps = {
  hostedPageId: string
  createContextLinkAction: (formData: FormData) => Promise<void>
  toggleContextLinkAction: (formData: FormData) => Promise<void>
  deleteContextLinkAction: (formData: FormData) => Promise<void>
}

export default function HostedPageContextLinksSectionClient({
  hostedPageId,
  createContextLinkAction,
  toggleContextLinkAction,
  deleteContextLinkAction,
}: HostedPageContextLinksSectionClientProps) {
  const { contextLinks, leadOptions, isLoading, errorMessage, reload } = useHostedPageContextData(hostedPageId)
  const [contextSlugInput, setContextSlugInput] = useState('')

  const normalizedContextSlug = useMemo(
    () => normalizeContextLinkSlug(contextSlugInput),
    [contextSlugInput],
  )
  const isContextSlugInputProvided = contextSlugInput.trim().length > 0
  const isContextSlugInvalid = isContextSlugInputProvided && normalizedContextSlug.length === 0
  const isContextSlugTooLong = normalizedContextSlug.length > CONTEXT_LINK_SLUG_MAX_LENGTH
  const isContextLinkSubmitBlocked = isContextSlugInvalid || isContextSlugTooLong

  if (isLoading) {
    return <SectionLoadingState />
  }

  if (errorMessage) {
    return (
      <Card className="rounded-2xl border border-amber-200 bg-amber-50">
        <CardContent className="flex flex-col gap-3 p-5">
          <p className="text-sm font-semibold text-amber-900">{errorMessage}</p>
          <div>
            <Button type="button" variant="outline" size="sm" className="w-auto" onClick={() => void reload()}>
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <GsapReveal delay={0.04}>
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-5">
          <h2 className="text-lg font-semibold text-slate-900">Context Links</h2>
          <p className="mt-1 text-sm text-slate-500">
            리드와 랜딩 페이지를 연결하는 추적 링크를 생성하고 활성 상태를 관리합니다.
          </p>

          <form action={createContextLinkAction} className="mt-5 grid gap-3 md:grid-cols-4">
            <input type="hidden" name="hostedPageId" value={hostedPageId} />
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
              연결 리드
              <select
                name="leadId"
                required
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 focus:border-slate-300 focus:outline-none"
              >
                <option value="">리드 선택</option>
                {leadOptions.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {(lead.contentSummary ?? '요약 없음').slice(0, 60)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Link Slug (선택)
              <input
                type="text"
                name="slug"
                placeholder="예: campaign-a"
                value={contextSlugInput}
                onChange={(event) => setContextSlugInput(event.target.value)}
                className={`h-10 rounded-md border bg-white px-3 text-sm font-normal text-slate-700 focus:outline-none ${
                  isContextLinkSubmitBlocked
                    ? 'border-rose-300 focus:border-rose-400'
                    : 'border-slate-200 focus:border-slate-300'
                }`}
                aria-invalid={isContextLinkSubmitBlocked}
              />
              {isContextSlugInvalid ? (
                <span className="text-xs font-normal text-rose-600">
                  영문/숫자/하이픈(-) 조합으로 입력해 주세요.
                </span>
              ) : isContextSlugTooLong ? (
                <span className="text-xs font-normal text-rose-600">
                  최대 {CONTEXT_LINK_SLUG_MAX_LENGTH}자까지 입력할 수 있습니다.
                </span>
              ) : (
                <span className="text-xs font-normal text-slate-500">
                  영문/숫자/하이픈(-) 조합, 최대 {CONTEXT_LINK_SLUG_MAX_LENGTH}자 ({normalizedContextSlug.length}/
                  {CONTEXT_LINK_SLUG_MAX_LENGTH})
                </span>
              )}
            </label>
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={isContextLinkSubmitBlocked}>
                링크 생성
              </Button>
            </div>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700 md:col-span-4">
              Target Message (선택)
              <input
                type="text"
                name="targetMessage"
                placeholder="예: 신규 문의 10건 달성"
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 focus:border-slate-300 focus:outline-none"
              />
            </label>
          </form>

          {contextLinks.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
              생성된 컨텍스트 링크가 없습니다.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {contextLinks.map((link) => {
                const linkedLead = leadOptions.find((lead) => lead.id === link.leadId)

                return (
                  <article
                    key={link.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <p className="break-all text-base font-semibold text-slate-900">
                          /c/{link.slug}
                        </p>
                        <p className="text-xs text-slate-500">
                          리드: {linkedLead?.contentSummary ?? link.leadId}
                        </p>
                        <p className="text-xs text-slate-500">
                          클릭수: {link.clickCount}
                        </p>
                      </div>
                    <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
                      {link.isActive ? (
                        <Badge className="rounded-full">활성</Badge>
                      ) : (
                        <Badge variant="outline" className="rounded-full">
                          비활성
                          </Badge>
                        )}
                        <a
                          href={`/c/${link.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className={buttonVariants({ variant: 'outline', size: 'sm', className: 'w-full sm:w-auto' })}
                        >
                          열기
                        </a>
                        <form action={toggleContextLinkAction}>
                          <input type="hidden" name="hostedPageId" value={hostedPageId} />
                          <input type="hidden" name="contextLinkId" value={link.id} />
                          <input
                            type="hidden"
                            name="isActive"
                            value={link.isActive ? 'false' : 'true'}
                          />
                          <button
                            type="submit"
                            className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'w-full sm:w-auto' })}
                          >
                            {link.isActive ? '비활성화' : '활성화'}
                          </button>
                        </form>
                        <form action={deleteContextLinkAction}>
                          <input type="hidden" name="hostedPageId" value={hostedPageId} />
                          <input type="hidden" name="contextLinkId" value={link.id} />
                          <button
                            type="submit"
                            className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'w-full sm:w-auto text-rose-600 hover:text-rose-700' })}
                          >
                            삭제
                          </button>
                        </form>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </GsapReveal>
  )
}
