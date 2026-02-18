import fs from 'node:fs/promises'
import path from 'node:path'
import { test, expect } from '@playwright/test'
import { AUTH_STATE_FILE } from './auth-state'

test('capture auth state via manual social login', async ({ page, context }) => {
  test.setTimeout(5 * 60 * 1000)

  await fs.mkdir(path.dirname(AUTH_STATE_FILE), { recursive: true })

  await page.goto('/login')
  await expect(page.getByRole('heading', { name: '3초 만에 시작하기' })).toBeVisible()

  console.log('[e2e:auth] 브라우저에서 Google/Kakao 로그인 완료 후 대시보드 또는 hosted-pages로 이동하세요.')

  await page.waitForURL((url) => {
    const pathname = url.pathname.toLowerCase()
    return pathname.startsWith('/dashboard') || pathname.startsWith('/hosted-pages')
  }, { timeout: 4 * 60 * 1000 })

  await context.storageState({ path: AUTH_STATE_FILE })
  console.log(`[e2e:auth] 저장 완료: ${AUTH_STATE_FILE}`)
})
