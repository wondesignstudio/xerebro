import type { TransactionType } from '@/domain/transaction'
import { createServerSupabaseClient } from '@/repositories/supabase/server'
import { toWallet, type WalletRow } from '@/repositories/wallets/walletMapper'

export type LedgerDeductParams = {
  userId: string
  amount: number
  type: TransactionType
  description: string
  relatedLeadId?: string | null
}

// Executes the atomic ledger deduction RPC and returns the updated wallet state.
export async function ledgerDeductCredits(params: LedgerDeductParams) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .rpc('ledger_deduct_credits', {
      p_user_id: params.userId,
      p_amount: params.amount,
      p_type: params.type,
      p_description: params.description,
      p_related_lead_id: params.relatedLeadId ?? null,
    })
    .single<WalletRow>()

  if (error) {
    throw new Error(error.message || 'Failed to deduct credits.')
  }

  return toWallet(data)
}

export type LedgerRewardParams = {
  userId: string
  leadId: string
  reasonCode: string
  reasonDetail?: string | null
  description: string
}

// Executes the atomic reward RPC and returns the updated wallet state.
export async function ledgerRewardCredits(params: LedgerRewardParams) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .rpc('ledger_reward_credits', {
      p_user_id: params.userId,
      p_lead_id: params.leadId,
      p_reason_code: params.reasonCode,
      p_reason_detail: params.reasonDetail ?? null,
      p_description: params.description,
    })
    .single<WalletRow>()

  if (error) {
    throw new Error(error.message || 'Failed to reward credits.')
  }

  return toWallet(data)
}
