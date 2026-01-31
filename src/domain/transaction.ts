export type TransactionType =
  | 'daily_reset'
  | 'lead_view'
  | 'report_reward'
  | 'manual_topup'
  | 'payment_charge'
  | 'abuse_restriction'

export type Transaction = {
  id: string
  userId: string
  amount: number
  type: TransactionType
  description: string | null
  relatedLeadId: string | null
  createdAt: string
}

// Simple semantic helpers for UI labeling or filtering.
export function isReward(transaction: Transaction) {
  return transaction.type === 'report_reward'
}

type TransactionDescriptionParams = {
  type: TransactionType
  leadId?: string | null
}

// Formats human-readable transaction descriptions for ledger records.
export function formatTransactionDescription({ type, leadId }: TransactionDescriptionParams) {
  switch (type) {
    case 'lead_view':
      return leadId ? `[Lead View] 리드 열람 (Lead ID: ${leadId})` : '[Lead View] 리드 열람'
    case 'daily_reset':
      return '[Daily Reset] 일일 무료 크레딧 초기화'
    case 'report_reward':
      return leadId ? `[Reward] 불량 리드 신고 보상 (Lead ID: ${leadId})` : '[Reward] 불량 리드 신고 보상'
    case 'abuse_restriction':
      return '[Restriction] 재가입 어뷰징 감지'
    case 'manual_topup':
      return '[Topup] 수동 크레딧 충전'
    case 'payment_charge':
      return '[Payment] 결제 처리'
    default:
      return `[Type] ${type}`
  }
}
