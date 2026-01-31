import { requireAuthUserWithConsentOrRedirect } from '@/viewmodels/auth/guards'
import { listTransactionsByUserId } from '@/repositories/transactions/transactionRepository'

// Loads recent transactions for the current user.
export async function getRecentTransactions(limit = 20) {
  const { user } = await requireAuthUserWithConsentOrRedirect()
  return listTransactionsByUserId(user.id, limit)
}
