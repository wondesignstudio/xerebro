import { describe, expect, it } from 'vitest'
import { formatTransactionDescription, isReward } from '@/domain/transaction'

const rewardTransaction = {
  id: 'tx-1',
  userId: 'user-1',
  amount: 1,
  type: 'report_reward' as const,
  description: null,
  relatedLeadId: null,
  createdAt: new Date().toISOString(),
}

describe('transaction domain', () => {
  it('detects reward transaction type', () => {
    expect(isReward(rewardTransaction)).toBe(true)
  })

  it('formats lead view descriptions with lead id', () => {
    expect(
      formatTransactionDescription({ type: 'lead_view', leadId: 'lead-123' })
    ).toBe('[Lead View] 리드 열람 (Lead ID: lead-123)')
  })

  it('formats daily reset descriptions', () => {
    expect(formatTransactionDescription({ type: 'daily_reset' })).toBe(
      '[Daily Reset] 일일 무료 크레딧 초기화'
    )
  })

  it('formats report reward descriptions', () => {
    expect(
      formatTransactionDescription({ type: 'report_reward', leadId: 'lead-9' })
    ).toBe('[Reward] 불량 리드 신고 보상 (Lead ID: lead-9)')
  })
})
