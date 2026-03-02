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

export default async function globalSetup() {
  if (existsSync(AUTH_STATE_FILE)) {
    return
  }

  const encodedAuthState = process.env.PLAYWRIGHT_AUTH_STATE_B64?.trim()

  if (encodedAuthState) {
    const decodedAuthState = decodeAuthStateFromBase64(encodedAuthState)
    const targetOrigin = process.env.PLAYWRIGHT_BASE_URL?.trim() || 'http://localhost:3000'
    const normalizedAuthState = mapSupabaseAuthCookiesToLocalhost(decodedAuthState, targetOrigin)
    await fs.mkdir(path.dirname(AUTH_STATE_FILE), { recursive: true })
    await fs.writeFile(AUTH_STATE_FILE, JSON.stringify(normalizedAuthState, null, 2), 'utf8')
    return
  }

  if (process.env.CI) {
    throw new Error('Missing PLAYWRIGHT_AUTH_STATE_B64. Configure CI secret for authenticated E2E runs.')
  }
}
