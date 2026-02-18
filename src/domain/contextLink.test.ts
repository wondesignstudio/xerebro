import { describe, expect, it } from 'vitest'
import {
  CONTEXT_LINK_SLUG_MAX_LENGTH,
  generateContextLinkSlug,
  isContextLinkSlugLengthValid,
  isValidContextLinkId,
  normalizeContextLinkSlug,
} from '@/domain/contextLink'

describe('context link domain', () => {
  it('generates a context slug with prefix', () => {
    const slug = generateContextLinkSlug()
    expect(slug.startsWith('ctx-')).toBe(true)
    expect(slug.length).toBeGreaterThan(5)
  })

  it('normalizes user-entered slugs', () => {
    expect(normalizeContextLinkSlug('  Launch Campaign  ')).toBe('launch-campaign')
    expect(normalizeContextLinkSlug('Lead__To!!Page')).toBe('lead-to-page')
  })

  it('validates context-link slug max length', () => {
    expect(isContextLinkSlugLengthValid('a'.repeat(CONTEXT_LINK_SLUG_MAX_LENGTH))).toBe(true)
    expect(isContextLinkSlugLengthValid('a'.repeat(CONTEXT_LINK_SLUG_MAX_LENGTH + 1))).toBe(false)
  })

  it('validates context link ids', () => {
    expect(isValidContextLinkId('976b7694-cfa2-42b2-baef-e80b760d79bb')).toBe(true)
    expect(isValidContextLinkId('abc')).toBe(false)
  })
})
