import { createServerSupabaseClient } from '@/repositories/supabase/server'
import { toWallet, type WalletRow } from '@/repositories/wallets/walletMapper'

// Reads the wallet row for a user. Returns null if not found.
export async function fetchWalletByUserId(userId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<WalletRow>()

  if (error) {
    throw new Error('Failed to load wallet.')
  }

  return data ? toWallet(data) : null
}

// Basic wallet updater for future credit adjustments.
// This is intentionally minimal and should be extended in viewmodels when needed.
export async function updateWalletCredits(
  userId: string,
  updates: Partial<Pick<WalletRow, 'free_credits' | 'subscription_credits' | 'purchased_credits'>>
) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('wallets')
    .update(updates)
    .eq('user_id', userId)
    .select('*')
    .single<WalletRow>()

  if (error) {
    throw new Error('Failed to update wallet credits.')
  }

  return toWallet(data)
}

// Ensures a wallet row exists and returns it.
// Uses a read-before-insert flow to avoid overwriting existing balances.
export async function ensureWallet(userId: string) {
  const existingWallet = await fetchWalletByUserId(userId)

  if (existingWallet) {
    return existingWallet
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('wallets')
    .insert({
      user_id: userId,
      free_credits: 5,
      subscription_credits: 0,
      purchased_credits: 0,
    })
    .select('*')
    .single<WalletRow>()

  if (error) {
    throw new Error('Failed to create wallet row.')
  }

  return toWallet(data)
}

// Restricts free credits for re-signup users (sets free_credits to 0).
export async function restrictFreeCredits(userId: string) {
  return updateWalletCredits(userId, { free_credits: 0 })
}
