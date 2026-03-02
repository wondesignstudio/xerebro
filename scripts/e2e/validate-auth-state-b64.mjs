const encoded = process.env.PLAYWRIGHT_AUTH_STATE_B64?.trim()

if (!encoded) {
  console.error('Missing PLAYWRIGHT_AUTH_STATE_B64.')
  process.exit(1)
}

function fail(message) {
  console.error(`[e2e:auth:validate] ${message}`)
  process.exit(1)
}

try {
  const json = Buffer.from(encoded.replace(/\s+/g, ''), 'base64').toString('utf8')
  const state = JSON.parse(json)

  if (!state || typeof state !== 'object') {
    fail('Decoded payload is not a JSON object.')
  }

  const cookies = Array.isArray(state.cookies) ? state.cookies : null
  if (!cookies || cookies.length === 0) {
    fail('Decoded auth state has no cookies.')
  }

  const hasSupabaseAuthCookie = cookies.some((cookie) => {
    if (!cookie || typeof cookie !== 'object') {
      return false
    }

    const name = String(cookie.name ?? '')
    return name.startsWith('sb-') && name.includes('-auth-token')
  })

  if (!hasSupabaseAuthCookie) {
    fail('Decoded auth state is missing Supabase auth-token cookies.')
  }

  console.log(`[e2e:auth:validate] OK (cookies=${cookies.length})`)
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  fail(`Invalid base64 auth state. ${message}`)
}
