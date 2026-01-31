import type { Wallet } from '@/domain/wallet'

export type WalletRow = {
  user_id: string
  free_credits: number
  subscription_credits: number
  purchased_credits: number
  last_daily_reset: string | null
}

// Maps database shape to domain model.
export function toWallet(row: WalletRow): Wallet {
  return {
    userId: row.user_id,
    freeCredits: row.free_credits,
    subscriptionCredits: row.subscription_credits,
    purchasedCredits: row.purchased_credits,
    lastDailyReset: row.last_daily_reset,
  }
}
