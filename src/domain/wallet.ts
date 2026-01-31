export type Wallet = {
  userId: string
  freeCredits: number
  subscriptionCredits: number
  purchasedCredits: number
  lastDailyReset: string | null
}

// Derived total credits for display and validation.
export function getTotalCredits(wallet: Wallet) {
  return wallet.freeCredits + wallet.subscriptionCredits + wallet.purchasedCredits
}

// Guard to ensure the user has enough credits before a deduction.
export function hasSufficientCredits(wallet: Wallet, required: number) {
  return getTotalCredits(wallet) >= required
}
