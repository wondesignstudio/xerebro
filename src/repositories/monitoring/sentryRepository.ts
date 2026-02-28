import * as Sentry from '@sentry/nextjs'
import { buildRequestUrl, extractErrorDigest, extractSupabaseUserIdFromHeaders } from '@/domain/monitoring'

type RequestErrorPayload = {
  error: unknown
  request: {
    path: string
    method: string
    headers: NodeJS.Dict<string | string[]>
  }
  context: {
    routerKind: string
    routePath: string
    routeType: string
    renderSource?: string
    revalidateReason?: string
  }
}

function normalizeException(error: unknown) {
  if (error instanceof Error) {
    return error
  }
  return new Error(typeof error === 'string' ? error : 'Unknown request error')
}

export async function captureRequestError(payload: RequestErrorPayload) {
  const { error, request, context } = payload
  const digest = extractErrorDigest(error)
  const requestUrl = buildRequestUrl(request.path, request.headers)
  const userId = extractSupabaseUserIdFromHeaders(request.headers)

  Sentry.withScope((scope) => {
    scope.setTag('error.source', 'next.onRequestError')
    scope.setTag('request.method', request.method)
    scope.setTag('request.path', request.path)
    scope.setTag('request.router_kind', context.routerKind)
    scope.setTag('request.route_type', context.routeType)
    scope.setTag('request.route_path', context.routePath)

    if (digest) {
      scope.setTag('next.digest', digest)
    }

    if (userId) {
      scope.setUser({ id: userId })
    }

    scope.setContext('request', {
      url: requestUrl,
      method: request.method,
    })
    scope.setContext('next', {
      digest: digest ?? null,
      routePath: context.routePath,
      routeType: context.routeType,
      renderSource: context.renderSource ?? null,
      revalidateReason: context.revalidateReason ?? null,
    })

    Sentry.captureException(normalizeException(error))
  })

  console.error(
    '[monitoring][request-error]',
    JSON.stringify({
      digest,
      requestUrl,
      method: request.method,
      routePath: context.routePath,
      routeType: context.routeType,
      userId,
    }),
  )
}
