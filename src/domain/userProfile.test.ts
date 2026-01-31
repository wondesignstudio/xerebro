import { describe, expect, it } from 'vitest'
import { isConsentComplete, isReSignupRestricted } from '@/domain/userProfile'

const baseProfile = {
  id: 'user-1',
  email: 'test@example.com',
  termsAgreedAt: null,
  lastLeftAt: null,
  marketingAgreed: null,
}

describe('user profile consent', () => {
  it('returns false when terms are missing', () => {
    expect(isConsentComplete(baseProfile)).toBe(false)
  })

  it('returns true when terms are agreed', () => {
    expect(isConsentComplete({ ...baseProfile, termsAgreedAt: '2026-01-30T00:00:00Z' })).toBe(true)
  })
})

describe('user profile re-signup restriction', () => {
  it('returns false when last_left_at is missing', () => {
    expect(isReSignupRestricted(baseProfile, new Date('2026-01-30T00:00:00Z'))).toBe(false)
  })

  it('returns true when within 30 days of last_left_at', () => {
    expect(
      isReSignupRestricted(
        { ...baseProfile, lastLeftAt: '2026-01-01T00:00:00Z' },
        new Date('2026-01-20T00:00:00Z')
      )
    ).toBe(true)
  })

  it('returns false when beyond 30 days of last_left_at', () => {
    expect(
      isReSignupRestricted(
        { ...baseProfile, lastLeftAt: '2025-12-01T00:00:00Z' },
        new Date('2026-01-15T00:00:00Z')
      )
    ).toBe(false)
  })
})
