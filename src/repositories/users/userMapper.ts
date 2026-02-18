import type { UserProfile } from '@/domain/userProfile'

export type UserRow = {
  id: string
  email: string | null
  current_plan: string | null
  terms_agreed_at: string | null
  last_left_at: string | null
  marketing_agreed: boolean | null
  brand_industry?: string | null
  brand_target_audience?: string | null
  brand_usp?: string | null
  persona_tone?: string | null
  persona_guideline?: string | null
}

// Maps database row shape to domain model used by viewmodels.
export function toUserProfile(row: UserRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    currentPlan: (row.current_plan ?? 'free') as UserProfile['currentPlan'],
    termsAgreedAt: row.terms_agreed_at,
    lastLeftAt: row.last_left_at,
    marketingAgreed: row.marketing_agreed,
    brandIndustry: row.brand_industry ?? null,
    brandTargetAudience: row.brand_target_audience ?? null,
    brandUsp: row.brand_usp ?? null,
    personaTone: (row.persona_tone ?? null) as UserProfile['personaTone'],
    personaGuideline: row.persona_guideline ?? null,
  }
}
