import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { test, expect } from '@playwright/test'

const AUTH_FILE = path.resolve(__dirname, '.auth/user.json')
const hasAuthState = fs.existsSync(AUTH_FILE)

async function cleanupHostedPageBySlug(slug: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const { error } = await supabase
    .from('hosted_pages')
    .delete()
    .eq('slug', slug)

  if (error) {
    throw new Error(`Hosted page cleanup failed: ${error.message}`)
  }
}

test.describe('hosted pages critical flow', () => {
  test.skip(!hasAuthState, 'Run `npm run e2e:auth` first to create tests/e2e/.auth/user.json')
  test.use({ storageState: hasAuthState ? AUTH_FILE : undefined })

  test('create -> detail save -> list publish toggle', async ({ page }) => {
    const slug = `e2e-${Date.now().toString(36)}`

    try {
      await page.goto('/hosted-pages')
      await expect(page).toHaveURL(/\/hosted-pages/)

      await page.getByPlaceholder(/선택 입력: slug/).fill(slug)
      await page.getByRole('button', { name: '새 랜딩 페이지 만들기' }).click()

      await expect(page).toHaveURL(new RegExp(`/hosted-pages/[^/?]+\\?created=1`))
      await expect(page.getByText(slug, { exact: true })).toBeVisible()

      await page.getByLabel('Theme Color').fill('#1f2937')
      await page.getByRole('button', { name: '변경사항 저장' }).click()

      await expect(page).toHaveURL(new RegExp(`/hosted-pages/[^/?]+\\?updated=1`))
      await expect(page.getByRole('button', { name: '저장됨' })).toBeVisible()

      await page.getByRole('link', { name: '목록으로 돌아가기' }).click()
      await expect(page).toHaveURL(/\/hosted-pages/)

      const row = page.locator('li', { hasText: slug }).first()
      await expect(row).toBeVisible()

      await row.getByRole('button', { name: '게시하기' }).click()
      await expect(page).toHaveURL(/\/hosted-pages\?updated=1/)

      const updatedRow = page.locator('li', { hasText: slug }).first()
      await expect(updatedRow.getByText('게시 중')).toBeVisible()
      await expect(updatedRow.getByRole('link', { name: '공개 페이지 보기' })).toHaveAttribute('href', `/p/${slug}`)
    } finally {
      await cleanupHostedPageBySlug(slug)
    }
  })
})
