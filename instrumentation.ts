import type { Instrumentation } from 'next'
import { captureRequestError } from './src/repositories/monitoring/sentryRepository'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  await captureRequestError({
    error,
    request,
    context,
  })
}
