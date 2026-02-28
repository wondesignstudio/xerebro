type HeaderMap = NodeJS.Dict<string | string[]>

function normalizeHeaderValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.join(',')
  }
  return value ?? ''
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const remainder = padded.length % 4
  const suffix = remainder === 0 ? '' : '='.repeat(4 - remainder)
  return Buffer.from(`${padded}${suffix}`, 'base64').toString('utf8')
}

function parseCookieHeader(rawCookie: string) {
  const cookies = new Map<string, string>()

  for (const part of rawCookie.split(';')) {
    const index = part.indexOf('=')
    if (index === -1) {
      continue
    }

    const name = part.slice(0, index).trim()
    const value = part.slice(index + 1).trim()
    if (!name) {
      continue
    }

    cookies.set(name, value)
  }

  return cookies
}

function mergeChunkedCookies(cookies: Map<string, string>) {
  const merged = new Map(cookies)
  const chunkGroups = new Map<string, Array<{ index: number; value: string }>>()

  for (const [name, value] of cookies.entries()) {
    const matched = name.match(/^(.*)\.(\d+)$/)
    if (!matched) {
      continue
    }

    const [, baseName, chunkIndex] = matched
    const chunks = chunkGroups.get(baseName) ?? []
    chunks.push({ index: Number(chunkIndex), value })
    chunkGroups.set(baseName, chunks)
  }

  for (const [baseName, chunks] of chunkGroups.entries()) {
    const combined = chunks
      .sort((a, b) => a.index - b.index)
      .map((chunk) => chunk.value)
      .join('')
    merged.set(baseName, combined)
  }

  return merged
}

function decodeCookieValue(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function extractJwtSubjectFromToken(token: string) {
  const segments = token.split('.')
  if (segments.length < 2) {
    return null
  }

  try {
    const payload = JSON.parse(base64UrlDecode(segments[1])) as { sub?: unknown }
    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
      return null
    }
    return payload.sub
  } catch {
    return null
  }
}

function extractAccessToken(candidateValue: string) {
  const decoded = decodeCookieValue(candidateValue)

  if (decoded.startsWith('base64-')) {
    try {
      const base64Json = Buffer.from(decoded.slice('base64-'.length), 'base64').toString('utf8')
      return extractAccessToken(base64Json)
    } catch {
      return null
    }
  }

  if (decoded.includes('.')) {
    return decoded
  }

  try {
    const parsed = JSON.parse(decoded) as
      | string
      | [string, string]
      | { access_token?: string; currentSession?: { access_token?: string } }

    if (typeof parsed === 'string') {
      return parsed
    }

    if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
      return parsed[0]
    }

    if (parsed && !Array.isArray(parsed) && typeof parsed === 'object') {
      if (typeof parsed.access_token === 'string') {
        return parsed.access_token
      }

      if (typeof parsed.currentSession?.access_token === 'string') {
        return parsed.currentSession.access_token
      }
    }
  } catch {
    return null
  }

  return null
}

export function extractSupabaseUserIdFromHeaders(headers: HeaderMap) {
  const rawCookie = normalizeHeaderValue(headers.cookie)
  if (!rawCookie) {
    return null
  }

  const cookies = mergeChunkedCookies(parseCookieHeader(rawCookie))
  const authCookieValues = [...cookies.entries()]
    .filter(([name]) => name.includes('-auth-token') && !name.includes('code-verifier'))
    .map(([, value]) => value)

  for (const cookieValue of authCookieValues) {
    const accessToken = extractAccessToken(cookieValue)
    if (!accessToken) {
      continue
    }

    const userId = extractJwtSubjectFromToken(accessToken)
    if (userId) {
      return userId
    }
  }

  return null
}

export function extractErrorDigest(error: unknown) {
  if (!error || typeof error !== 'object') {
    return null
  }

  const digest = (error as { digest?: unknown }).digest
  return typeof digest === 'string' && digest.length > 0 ? digest : null
}

export function buildRequestUrl(path: string, headers: HeaderMap) {
  const host = normalizeHeaderValue(headers['x-forwarded-host']) || normalizeHeaderValue(headers.host)
  if (!host) {
    return path
  }

  const proto = normalizeHeaderValue(headers['x-forwarded-proto']) || 'https'
  return `${proto}://${host}${path}`
}
