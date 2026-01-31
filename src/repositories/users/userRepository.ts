import { createServerSupabaseClient } from '@/repositories/supabase/server'
import { toUserProfile, type UserRow } from '@/repositories/users/userMapper'

// Loads the user profile row, if present.
export async function fetchUserProfileById(userId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, email, terms_agreed_at, last_left_at, marketing_agreed')
    .eq('id', userId)
    .maybeSingle<UserRow>()

  if (error) {
    throw new Error('Failed to load user profile.')
  }

  return data ? toUserProfile(data) : null
}

// Upserts consent fields on the user profile.
// Uses upsert to handle first-time profiles without a separate create step.
export async function upsertUserConsent(params: {
  userId: string
  email?: string | null
  termsAgreedAt: string
  marketingAgreed: boolean
}) {
  const supabase = await createServerSupabaseClient()

  const payload: Partial<UserRow> & { id: string } = {
    id: params.userId,
    terms_agreed_at: params.termsAgreedAt,
    marketing_agreed: params.marketingAgreed,
  }

  if (params.email) {
    payload.email = params.email
  }

  const { data, error } = await supabase
    .from('users')
    .upsert(payload)
    .select('id, email, terms_agreed_at, last_left_at, marketing_agreed')
    .single<UserRow>()

  if (error) {
    throw new Error('Failed to update consent status.')
  }

  return toUserProfile(data)
}

// Records a withdrawal timestamp for soft-delete behavior.
export async function setUserLastLeftAt(userId: string, timestamp: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .update({ last_left_at: timestamp })
    .eq('id', userId)
    .select('id, email, terms_agreed_at, last_left_at, marketing_agreed')
    .single<UserRow>()

  if (error) {
    throw new Error('Failed to update withdrawal timestamp.')
  }

  return toUserProfile(data)
}
