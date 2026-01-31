import type { UserProfile } from '@/domain/userProfile'

export type UserRow = {
  id: string
  email: string | null
  terms_agreed_at: string | null
  last_left_at: string | null
  marketing_agreed: boolean | null
}

// Maps database row shape to domain model used by viewmodels.
export function toUserProfile(row: UserRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    termsAgreedAt: row.terms_agreed_at,
    lastLeftAt: row.last_left_at,
    marketingAgreed: row.marketing_agreed,
  }
}
