import { isReSignupRestricted } from '@/domain/userProfile'
import { createTransaction, findLatestTransactionByType } from '@/repositories/transactions/transactionRepository'
import { ensureWallet, restrictFreeCredits } from '@/repositories/wallets/walletRepository'
import { fetchUserProfileById } from '@/repositories/users/userRepository'

// Applies re-signup restrictions (REQ-34) if last_left_at is within 30 days.
// Safe to call multiple times; avoids duplicate logging after the first restriction.
export async function applyReSignupRestriction(userId: string) {
  const profile = await fetchUserProfileById(userId)

  if (!isReSignupRestricted(profile)) {
    return { applied: false }
  }

  const wallet = await ensureWallet(userId)

  // Ensure the free credits are restricted regardless of previous state.
  if (wallet.freeCredits !== 0) {
    await restrictFreeCredits(userId)
  }

  // Log the restriction once per re-signup event.
  const lastRestriction = await findLatestTransactionByType(userId, 'abuse_restriction')
  const lastLeftAt = profile?.lastLeftAt ? new Date(profile.lastLeftAt) : null

  const shouldLog =
    !lastRestriction ||
    (lastLeftAt ? new Date(lastRestriction.createdAt) < lastLeftAt : true)

  if (shouldLog) {
    await createTransaction({
      userId,
      amount: 0,
      type: 'abuse_restriction',
      description: '재가입 어뷰징 감지로 인한 초기 크레딧 미지급',
    })
  }

  return { applied: true }
}
