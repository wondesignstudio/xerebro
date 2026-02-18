import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { AUTH_STATE_FILE } from './auth-state'

function decodeAuthStateFromBase64(encoded: string) {
  const normalized = encoded.replace(/\s+/g, '')
  const json = Buffer.from(normalized, 'base64').toString('utf8')
  JSON.parse(json)
  return json
}

export default async function globalSetup() {
  if (existsSync(AUTH_STATE_FILE)) {
    return
  }

  const encodedAuthState = process.env.PLAYWRIGHT_AUTH_STATE_B64?.trim()

  if (encodedAuthState) {
    const decodedAuthState = decodeAuthStateFromBase64(encodedAuthState)
    await fs.mkdir(path.dirname(AUTH_STATE_FILE), { recursive: true })
    await fs.writeFile(AUTH_STATE_FILE, decodedAuthState, 'utf8')
    return
  }

  if (process.env.CI) {
    throw new Error('Missing PLAYWRIGHT_AUTH_STATE_B64. Configure CI secret for authenticated E2E runs.')
  }
}
