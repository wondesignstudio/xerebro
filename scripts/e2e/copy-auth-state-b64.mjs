import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'

const authStatePath = path.resolve(process.cwd(), 'tests/e2e/.auth/user.json')

try {
  const authState = await fs.readFile(authStatePath, 'utf8')
  const encoded = Buffer.from(authState, 'utf8').toString('base64')

  const copyResult = spawnSync('pbcopy', { input: encoded, encoding: 'utf8' })
  if (copyResult.status !== 0) {
    throw new Error(copyResult.stderr || 'pbcopy failed')
  }

  const pasted = execFileSync('pbpaste', { encoding: 'utf8' })
  if (pasted.length !== encoded.length) {
    throw new Error(`Clipboard length mismatch. expected=${encoded.length} actual=${pasted.length}`)
  }

  console.log(`Copied PLAYWRIGHT_AUTH_STATE_B64 to clipboard. length=${encoded.length}`)
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Failed to copy auth state from: ${authStatePath}`)
  console.error(message)
  process.exit(1)
}
