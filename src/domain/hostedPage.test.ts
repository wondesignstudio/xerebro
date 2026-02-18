import { describe, expect, it } from 'vitest'
import {
  generateHostedPageSlug,
  HOSTED_PAGE_SLUG_MAX_LENGTH,
  isHostedPageSlugLengthValid,
  isValidHostedPageId,
  normalizeHostedPageSlug,
} from '@/domain/hostedPage'

describe('hosted page domain', () => {
  it('generates a page slug with prefix', () => {
    const slug = generateHostedPageSlug()
    expect(slug.startsWith('page-')).toBe(true)
    expect(slug.length).toBeGreaterThan(5)
  })

  it('normalizes user-entered slugs', () => {
    expect(normalizeHostedPageSlug('  Hello World ')).toBe('hello-world')
    expect(normalizeHostedPageSlug('My__Page!!')).toBe('my-page')
  })

  it('validates hosted page ids', () => {
    expect(isValidHostedPageId('976b7694-cfa2-42b2-baef-e80b760d79bb')).toBe(true)
    expect(isValidHostedPageId('{id}')).toBe(false)
    expect(isValidHostedPageId('madong215@gmail.com')).toBe(false)
  })

  it('enforces slug max length', () => {
    expect(isHostedPageSlugLengthValid('a'.repeat(HOSTED_PAGE_SLUG_MAX_LENGTH))).toBe(true)
    expect(isHostedPageSlugLengthValid('a'.repeat(HOSTED_PAGE_SLUG_MAX_LENGTH + 1))).toBe(false)
  })
})
