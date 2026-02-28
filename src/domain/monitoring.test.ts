import { describe, expect, it } from 'vitest'
import { buildRequestUrl, extractErrorDigest, extractSupabaseUserIdFromHeaders } from '@/domain/monitoring'

function encodeBase64Url(value: string) {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function createJwt(subject: string) {
  const header = encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = encodeBase64Url(JSON.stringify({ sub: subject }))
  return `${header}.${payload}.signature`
}

describe('extractSupabaseUserIdFromHeaders', () => {
  it('extracts user id from json-array auth cookie', () => {
    const userId = '8201e906-490e-47b1-a18c-f86cd8eada3b'
    const jwt = createJwt(userId)
    const cookie = encodeURIComponent(JSON.stringify([jwt, 'refresh-token']))

    const actual = extractSupabaseUserIdFromHeaders({
      cookie: `sb-project-auth-token=${cookie}; other=value`,
    })

    expect(actual).toBe(userId)
  })

  it('extracts user id from chunked base64 auth cookie', () => {
    const userId = 'f490a1cf-81ab-e0c7-2081-30cc7ed4c15d'
    const jwt = createJwt(userId)
    const raw = `base64-${Buffer.from(JSON.stringify({ access_token: jwt }), 'utf8').toString('base64')}`
    const half = Math.floor(raw.length / 2)

    const actual = extractSupabaseUserIdFromHeaders({
      cookie: `sb-project-auth-token.0=${raw.slice(0, half)}; sb-project-auth-token.1=${raw.slice(half)}`,
    })

    expect(actual).toBe(userId)
  })

  it('returns null when auth cookie is missing', () => {
    const actual = extractSupabaseUserIdFromHeaders({
      cookie: 'foo=bar',
    })

    expect(actual).toBeNull()
  })
})

describe('extractErrorDigest', () => {
  it('returns digest when error has digest field', () => {
    const actual = extractErrorDigest({ digest: '758985073' })
    expect(actual).toBe('758985073')
  })

  it('returns null for non-object errors', () => {
    expect(extractErrorDigest('boom')).toBeNull()
  })
})

describe('buildRequestUrl', () => {
  it('builds absolute url from forwarded headers', () => {
    const url = buildRequestUrl('/hosted-pages', {
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'xerebro.me',
    })

    expect(url).toBe('https://xerebro.me/hosted-pages')
  })

  it('falls back to raw path when host header is absent', () => {
    const url = buildRequestUrl('/login', {})
    expect(url).toBe('/login')
  })
})
