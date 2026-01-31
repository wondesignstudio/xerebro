import { headers } from 'next/headers'

export type AiDraftRequest = {
  prompt: string
  draftMessage: string
}

function getRequestOrigin() {
  const headerList = headers()
  const forwardedProto = headerList.get('x-forwarded-proto')
  const forwardedHost = headerList.get('x-forwarded-host')
  const host = forwardedHost ?? headerList.get('host')
  const proto = forwardedProto ?? 'http'

  if (!host) {
    throw new Error('Unable to resolve request host for AI route.')
  }

  return `${proto}://${host}`
}

// Calls the internal AI draft API route to get a revised message.
export async function requestAiDraftUpdate(params: AiDraftRequest) {
  const origin = getRequestOrigin()
  const response = await fetch(`${origin}/api/ai/draft`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: params.prompt,
      draftMessage: params.draftMessage,
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(errorBody || 'AI draft request failed.')
  }

  const data = (await response.json()) as { draft?: string }

  if (!data.draft) {
    throw new Error('No draft returned from AI service.')
  }

  return data.draft
}
