import { getTotalCredits } from '@/domain/wallet'
import { requireAuthUserWithConsentOrRedirect } from '@/viewmodels/auth/guards'
import { fetchWalletByUserId } from '@/repositories/wallets/walletRepository'

// Loads the current user's wallet for dashboard display.
export async function getWalletSummary() {
  const { user, profile } = await requireAuthUserWithConsentOrRedirect()
  const wallet = await fetchWalletByUserId(user.id)

  return {
    user,
    profile,
    wallet,
    totalCredits: wallet ? getTotalCredits(wallet) : 0,
  }
}
