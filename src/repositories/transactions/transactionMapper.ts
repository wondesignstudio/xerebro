import type { Transaction, TransactionType } from '@/domain/transaction'

export type TransactionRow = {
  id: string
  user_id: string
  amount: number
  type: TransactionType
  description: string | null
  related_lead_id: string | null
  created_at: string
}

// Maps database row to domain model.
export function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    amount: row.amount,
    type: row.type,
    description: row.description,
    relatedLeadId: row.related_lead_id,
    createdAt: row.created_at,
  }
}
