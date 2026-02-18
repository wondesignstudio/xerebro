import { createServerSupabaseClient } from '@/repositories/supabase/server'
import type { PersonaTone } from '@/domain/userProfile'
import { toUserProfile, type UserRow } from '@/repositories/users/userMapper'

const USER_PROFILE_BASE_SELECT_COLUMNS = [
  'id',
  'email',
  'current_plan',
  'terms_agreed_at',
  'last_left_at',
  'marketing_agreed',
].join(', ')

const USER_PROFILE_WITH_BRAND_COLUMNS = [
  USER_PROFILE_BASE_SELECT_COLUMNS,
  'brand_industry',
  'brand_target_audience',
  'brand_usp',
  'persona_tone',
  'persona_guideline',
].join(', ')

function isMissingBrandColumnsError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false
  }

  const code = 'code' in error ? String((error as { code?: string }).code ?? '') : ''
  const message = 'message' in error ? String((error as { message?: string }).message ?? '') : ''

  return code === '42703' || message.includes('brand_industry')
}

// Loads the user profile row, if present.
export async function fetchUserProfileById(userId: string) {
  const supabase = await createServerSupabaseClient()
  const primary = await supabase
    .from('users')
    .select(USER_PROFILE_WITH_BRAND_COLUMNS)
    .eq('id', userId)
    .maybeSingle<UserRow>()

  if (!primary.error) {
    return primary.data ? toUserProfile(primary.data) : null
  }

  if (!isMissingBrandColumnsError(primary.error)) {
    throw new Error('Failed to load user profile.')
  }

  // Backward compatibility: if migration is not applied yet, load base columns only.
  const fallback = await supabase
    .from('users')
    .select(USER_PROFILE_BASE_SELECT_COLUMNS)
    .eq('id', userId)
    .maybeSingle<UserRow>()

  if (fallback.error) {
    throw new Error('Failed to load user profile.')
  }

  return fallback.data ? toUserProfile(fallback.data) : null
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
    .select(USER_PROFILE_BASE_SELECT_COLUMNS)
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
    .select(USER_PROFILE_BASE_SELECT_COLUMNS)
    .single<UserRow>()

  if (error) {
    throw new Error('Failed to update withdrawal timestamp.')
  }

  return toUserProfile(data)
}

// Upserts Brand Identity fields used by AI interview and persona tuning.
export async function upsertUserBrandIdentity(params: {
  userId: string
  email?: string | null
  brandIndustry: string | null
  brandTargetAudience: string | null
  brandUsp: string | null
  personaTone: PersonaTone | null
  personaGuideline: string | null
}) {
  const supabase = await createServerSupabaseClient()

  const payload: Partial<UserRow> & { id: string } = {
    id: params.userId,
    brand_industry: params.brandIndustry,
    brand_target_audience: params.brandTargetAudience,
    brand_usp: params.brandUsp,
    persona_tone: params.personaTone,
    persona_guideline: params.personaGuideline,
  }

  if (params.email) {
    payload.email = params.email
  }

  const { data, error } = await supabase
    .from('users')
    .upsert(payload)
    .select(USER_PROFILE_WITH_BRAND_COLUMNS)
    .single<UserRow>()

  if (error) {
    throw new Error('Failed to update brand identity.')
  }

  return toUserProfile(data)
}
