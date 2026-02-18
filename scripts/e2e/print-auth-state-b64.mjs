import fs from 'node:fs/promises'
import path from 'node:path'

const authStatePath = path.resolve(process.cwd(), 'tests/e2e/.auth/user.json')

try {
  const authState = await fs.readFile(authStatePath, 'utf8')
  const encoded = Buffer.from(authState, 'utf8').toString('base64')
  process.stdout.write(encoded)
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Failed to read auth state: ${authStatePath}`)
  console.error(message)
  process.exit(1)
}
