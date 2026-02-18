'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ContextLink } from '@/domain/contextLink'
import type { LeadContextOption } from '@/repositories/leads/leadRepository'

type HostedPageContextPayload = {
  contextLinks: ContextLink[]
  leadOptions: LeadContextOption[]
}

type HostedPageContextState = {
  contextLinks: ContextLink[]
  leadOptions: LeadContextOption[]
  isLoading: boolean
  errorMessage: string | null
}

const INITIAL_STATE: HostedPageContextState = {
  contextLinks: [],
  leadOptions: [],
  isLoading: true,
  errorMessage: null,
}

// Client-side viewmodel for deferred hosted-page context data loading.
export function useHostedPageContextData(hostedPageId: string) {
  const [state, setState] = useState<HostedPageContextState>(INITIAL_STATE)

  const load = useCallback(async () => {
    if (!hostedPageId) {
      setState({
        contextLinks: [],
        leadOptions: [],
        isLoading: false,
        errorMessage: '잘못된 페이지 식별자입니다.',
      })
      return
    }

    setState((previous) => ({
      ...previous,
      isLoading: true,
      errorMessage: null,
    }))

    try {
      const response = await fetch(`/api/hosted-pages/${hostedPageId}/context`, {
        method: 'GET',
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`Failed to load context data (${response.status})`)
      }

      const payload = await response.json() as HostedPageContextPayload
      setState({
        contextLinks: payload.contextLinks ?? [],
        leadOptions: payload.leadOptions ?? [],
        isLoading: false,
        errorMessage: null,
      })
    } catch {
      setState({
        contextLinks: [],
        leadOptions: [],
        isLoading: false,
        errorMessage: 'Context Links 데이터를 불러오지 못했습니다. 다시 시도해 주세요.',
      })
    }
  }, [hostedPageId])

  useEffect(() => {
    void load()
  }, [load])

  return {
    ...state,
    reload: load,
  }
}
