import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const AUTH_STATE_FILE = path.resolve(process.cwd(), 'tests/e2e/.auth/user.json')
const CDP_ENDPOINT = process.env.PLAYWRIGHT_CDP_ENDPOINT ?? 'http://127.0.0.1:9222'
const TARGET_ORIGIN = process.env.PLAYWRIGHT_AUTH_ORIGIN ?? 'http://localhost:3000'

function hasTargetCookie(state, targetOrigin) {
  const hostname = new URL(targetOrigin).hostname
  return state.cookies.some((cookie) => {
    if (cookie.domain === hostname) {
      return true
    }
    if (hostname === 'localhost' && cookie.domain === '127.0.0.1') {
      return true
    }
    return cookie.domain.endsWith(`.${hostname}`)
  })
}

function addMappedAuthCookiesForLocalhost(state, targetOrigin) {
  const hostname = new URL(targetOrigin).hostname
  if (hostname !== 'localhost') {
    return { state, added: 0 }
  }

  const authCookies = state.cookies.filter((cookie) => {
    return cookie.domain.includes('xerebro.me')
      && cookie.name.includes('-auth-token')
      && cookie.name.startsWith('sb-')
  })

  if (authCookies.length === 0) {
    return { state, added: 0 }
  }

  const existing = new Set(state.cookies.map((cookie) => `${cookie.name}|${cookie.domain}|${cookie.path}`))
  const mapped = []

  for (const cookie of authCookies) {
    const key = `${cookie.name}|localhost|${cookie.path}`
    if (existing.has(key)) {
      continue
    }

    mapped.push({
      ...cookie,
      domain: 'localhost',
      secure: false,
    })
  }

  return {
    state: {
      ...state,
      cookies: [...state.cookies, ...mapped],
    },
    added: mapped.length,
  }
}

try {
  const browser = await chromium.connectOverCDP(CDP_ENDPOINT)
  const [context] = browser.contexts()

  if (!context) {
    throw new Error('No browser context found. Open a tab in the remote-debug Chrome first.')
  }

  const capturedState = await context.storageState()
  const mappedResult = addMappedAuthCookiesForLocalhost(capturedState, TARGET_ORIGIN)
  const state = mappedResult.state
  const targetCookieExists = hasTargetCookie(state, TARGET_ORIGIN)

  await fs.mkdir(path.dirname(AUTH_STATE_FILE), { recursive: true })
  await fs.writeFile(AUTH_STATE_FILE, JSON.stringify(state, null, 2), 'utf8')
  await browser.close()

  if (!targetCookieExists) {
    console.warn(
      `[e2e:auth:from-chrome] Saved auth state, but no cookie matched ${TARGET_ORIGIN}. ` +
        'Sign in on that origin and re-export.',
    )
  } else {
    console.log(`[e2e:auth:from-chrome] Saved auth state: ${AUTH_STATE_FILE}`)
    if (mappedResult.added > 0) {
      console.log(`[e2e:auth:from-chrome] Added ${mappedResult.added} localhost auth cookie(s) from xerebro.me session.`)
    }
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error('[e2e:auth:from-chrome] Failed to export auth state.')
  console.error(message)
  if (message.includes('ECONNREFUSED')) {
    console.error('')
    console.error('[e2e:auth:from-chrome] Chrome CDP endpoint is not reachable.')
    console.error(`[e2e:auth:from-chrome] Expected endpoint: ${CDP_ENDPOINT}`)
    console.error('[e2e:auth:from-chrome] Try the following sequence:')
    console.error('  1) npm run dev')
    console.error(
      '  2) open -na "Google Chrome" --args --remote-debugging-port=9222 --user-data-dir="$HOME/.xerebro-e2e-profile"',
    )
    console.error(`  3) Sign in at ${TARGET_ORIGIN}/login`)
    console.error('  4) Re-run: npm run e2e:auth:from-chrome')
  }
  process.exit(1)
}
