'use server'

import { formatTransactionDescription, type TransactionType } from '@/domain/transaction'
import { ledgerDeductCredits } from '@/repositories/ledger/ledgerRepository'
import { requireAuthUserWithConsentOrRedirect } from '@/viewmodels/auth/guards'

export type DeductCreditsParams = {
  amount: number
  type: TransactionType
  relatedLeadId?: string | null
}

// Deducts credits via the atomic ledger RPC.
export async function deductCreditsAction(params: DeductCreditsParams) {
  const { user } = await requireAuthUserWithConsentOrRedirect()

  if (params.amount <= 0) {
    throw new Error('Amount must be a positive integer.')
  }

  const description = formatTransactionDescription({
    type: params.type,
    leadId: params.relatedLeadId,
  })

  return ledgerDeductCredits({
    userId: user.id,
    amount: params.amount,
    type: params.type,
    description,
    relatedLeadId: params.relatedLeadId ?? null,
  })
}
