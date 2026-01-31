import { createServerSupabaseClient } from '@/repositories/supabase/server'
import { toTransaction, type TransactionRow } from '@/repositories/transactions/transactionMapper'
import type { TransactionType } from '@/domain/transaction'

// Lists recent transactions for a user, newest first.
export async function listTransactionsByUserId(userId: string, limit = 50) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error('Failed to load transactions.')
  }

  return (data ?? []).map((row) => toTransaction(row as TransactionRow))
}

// Inserts a new transaction row and returns the created domain model.
export async function createTransaction(params: {
  userId: string
  amount: number
  type: TransactionType
  description?: string | null
  relatedLeadId?: string | null
}) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: params.userId,
      amount: params.amount,
      type: params.type,
      description: params.description ?? null,
      related_lead_id: params.relatedLeadId ?? null,
    })
    .select('*')
    .single<TransactionRow>()

  if (error) {
    throw new Error('Failed to create transaction.')
  }

  return toTransaction(data)
}

// Returns the latest transaction of a given type, if any.
export async function findLatestTransactionByType(userId: string, type: TransactionType) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .order('created_at', { ascending: false })
    .maybeSingle<TransactionRow>()

  if (error) {
    throw new Error('Failed to load latest transaction.')
  }

  return data ? toTransaction(data) : null
}
