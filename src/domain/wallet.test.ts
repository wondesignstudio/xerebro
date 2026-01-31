import { describe, expect, it } from 'vitest'
import { getTotalCredits, hasSufficientCredits } from '@/domain/wallet'

const baseWallet = {
  userId: 'user-1',
  freeCredits: 2,
  subscriptionCredits: 3,
  purchasedCredits: 5,
  lastDailyReset: null,
}

describe('wallet domain', () => {
  it('sums total credits across buckets', () => {
    expect(getTotalCredits(baseWallet)).toBe(10)
  })

  it('checks for sufficient credits', () => {
    expect(hasSufficientCredits(baseWallet, 9)).toBe(true)
    expect(hasSufficientCredits(baseWallet, 11)).toBe(false)
  })
})
