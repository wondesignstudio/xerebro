type TracePayload = Record<string, unknown> | undefined

export type HostedPagesTrace = {
  traceId: string
  scope: string
}

function safeJson(value: unknown) {
  try {
    return JSON.stringify(value)
  } catch {
    return JSON.stringify({ serializationError: true })
  }
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    const errorWithCode = error as Error & { code?: string }
    return {
      name: error.name,
      message: error.message,
      code: errorWithCode.code ?? null,
      stack: error.stack ?? null,
    }
  }

  return {
    name: 'UnknownError',
    message: String(error),
    code: null,
    stack: null,
  }
}

export function startHostedPagesTrace(scope: string, payload?: TracePayload): HostedPagesTrace {
  const trace: HostedPagesTrace = {
    traceId: crypto.randomUUID(),
    scope,
  }

  console.info(
    `[hosted-pages][start] ${safeJson({
      traceId: trace.traceId,
      scope,
      payload: payload ?? null,
    })}`,
  )

  return trace
}

export function logHostedPagesInfo(trace: HostedPagesTrace, event: string, payload?: TracePayload) {
  console.info(
    `[hosted-pages][info] ${safeJson({
      traceId: trace.traceId,
      scope: trace.scope,
      event,
      payload: payload ?? null,
    })}`,
  )
}

export function logHostedPagesError(
  trace: HostedPagesTrace,
  event: string,
  error: unknown,
  payload?: TracePayload,
) {
  console.error(
    `[hosted-pages][error] ${safeJson({
      traceId: trace.traceId,
      scope: trace.scope,
      event,
      payload: payload ?? null,
      error: normalizeError(error),
    })}`,
  )
}
