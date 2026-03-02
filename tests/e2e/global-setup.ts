import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { AUTH_STATE_FILE } from './auth-state'

type StorageCookie = {
  name: string
  value: string
  domain: string
  path: string
  expires?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}

type StorageState = {
  cookies: StorageCookie[]
  origins?: Array<{ origin: string; localStorage: Array<{ name: string; value: string }> }>
}

const AUTH_COOKIE_NAME_PATTERN = /^(sb-[a-z0-9]+-auth-token)(?:\.(\d+))?$/
const AUTH_COOKIE_CHUNK_SIZE = 3180

function decodeAuthStateFromBase64(encoded: string): StorageState {
  const normalized = encoded.replace(/\s+/g, '')
  const json = Buffer.from(normalized, 'base64').toString('utf8')
  return JSON.parse(json) as StorageState
}

function hasTargetCookie(state: StorageState, targetOrigin: string) {
  const hostname = new URL(targetOrigin).hostname
  return state.cookies.some((cookie) => {
    const domain = cookie.domain.replace(/^\./, '')
    if (domain === hostname) {
      return true
    }
    if (hostname === 'localhost' && domain === '127.0.0.1') {
      return true
    }
    return domain.endsWith(`.${hostname}`)
  })
}

function mapSupabaseAuthCookiesToLocalhost(state: StorageState, targetOrigin: string) {
  const hostname = new URL(targetOrigin).hostname
  if (hostname !== 'localhost' || hasTargetCookie(state, targetOrigin)) {
    return state
  }

  const sourceCookies = state.cookies.filter((cookie) => {
    return cookie.domain.includes('xerebro.me')
      && cookie.name.startsWith('sb-')
      && cookie.name.includes('-auth-token')
  })

  if (sourceCookies.length === 0) {
    return state
  }

  const existingKeys = new Set(state.cookies.map((cookie) => `${cookie.name}|${cookie.domain}|${cookie.path}`))
  const mappedCookies = sourceCookies
    .map((cookie) => ({
      ...cookie,
      domain: 'localhost',
      secure: false,
    }))
    .filter((cookie) => !existingKeys.has(`${cookie.name}|${cookie.domain}|${cookie.path}`))

  if (mappedCookies.length === 0) {
    return state
  }

  return {
    ...state,
    cookies: [...state.cookies, ...mappedCookies],
  }
}

function decodeCookiePayload(cookieValue: string) {
  if (!cookieValue.startsWith('base64-')) {
    return null
  }

  const encoded = cookieValue.slice('base64-'.length)
  const padded = encoded.padEnd(encoded.length + ((4 - (encoded.length % 4)) % 4), '=')
  const json = Buffer.from(padded, 'base64').toString('utf8')
  return JSON.parse(json) as { refresh_token?: string }
}

function encodeCookiePayload(payload: unknown) {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8')
    .toString('base64')
    .replace(/=+$/g, '')
  return `base64-${encoded}`
}

function splitCookieValue(value: string, chunkSize = AUTH_COOKIE_CHUNK_SIZE) {
  const chunks: string[] = []
  for (let index = 0; index < value.length; index += chunkSize) {
    chunks.push(value.slice(index, index + chunkSize))
  }
  return chunks
}

async function refreshSupabaseSessionCookies(state: StorageState) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return state
  }

  const cookieGroups = new Map<string, StorageCookie[]>()
  for (const cookie of state.cookies) {
    const matched = cookie.name.match(AUTH_COOKIE_NAME_PATTERN)
    if (!matched) {
      continue
    }

    const baseName = matched[1]
    const existing = cookieGroups.get(baseName) ?? []
    existing.push(cookie)
    cookieGroups.set(baseName, existing)
  }

  for (const [baseName, cookies] of cookieGroups.entries()) {
    const sortedChunks = cookies
      .map((cookie) => {
        const chunkMatch = cookie.name.match(AUTH_COOKIE_NAME_PATTERN)
        const index = chunkMatch?.[2] ? Number.parseInt(chunkMatch[2], 10) : 0
        return { cookie, index }
      })
      .sort((left, right) => left.index - right.index)

    const joinedValue = sortedChunks.map((item) => item.cookie.value).join('')
    const decoded = decodeCookiePayload(joinedValue)
    const refreshToken = decoded?.refresh_token

    if (!refreshToken) {
      continue
    }

    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) {
      continue
    }

    const refreshedPayload = await response.json()
    const encodedPayload = encodeCookiePayload(refreshedPayload)
    const chunks = splitCookieValue(encodedPayload)
    const domains = [...new Set(sortedChunks.map((item) => item.cookie.domain))]
    const nextCookies = state.cookies.filter((cookie) => {
      return !(
        cookie.domain && domains.includes(cookie.domain) && cookie.name.startsWith(baseName)
      )
    })

    for (const domain of domains) {
      const template = sortedChunks.find((item) => item.cookie.domain === domain)?.cookie
      if (!template) {
        continue
      }

      chunks.forEach((chunk, index) => {
        nextCookies.push({
          ...template,
          name: index === 0 ? baseName : `${baseName}.${index}`,
          value: chunk,
          domain,
        })
      })
    }

    return {
      ...state,
      cookies: nextCookies,
    }
  }

  return state
}

export default async function globalSetup() {
  if (existsSync(AUTH_STATE_FILE)) {
    return
  }

  const encodedAuthState = process.env.PLAYWRIGHT_AUTH_STATE_B64?.trim()

  if (encodedAuthState) {
    const decodedAuthState = decodeAuthStateFromBase64(encodedAuthState)
    const targetOrigin = process.env.PLAYWRIGHT_BASE_URL?.trim() || 'http://localhost:3000'
    const mappedAuthState = mapSupabaseAuthCookiesToLocalhost(decodedAuthState, targetOrigin)
    const normalizedAuthState = await refreshSupabaseSessionCookies(mappedAuthState)
    await fs.mkdir(path.dirname(AUTH_STATE_FILE), { recursive: true })
    await fs.writeFile(AUTH_STATE_FILE, JSON.stringify(normalizedAuthState, null, 2), 'utf8')
    return
  }

  if (process.env.CI) {
    throw new Error('Missing PLAYWRIGHT_AUTH_STATE_B64. Configure CI secret for authenticated E2E runs.')
  }
}
