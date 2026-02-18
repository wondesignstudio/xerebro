export type UserPlan = 'free' | 'pro'
export type PersonaTone = 'polite' | 'friendly' | 'professional' | 'bold'

// Domain model for user profile data needed by consent flows and plan checks.
export type UserProfile = {
  id: string
  email: string | null
  currentPlan: UserPlan
  termsAgreedAt: string | null
  // Timestamp of user-initiated withdrawal (soft delete).
  lastLeftAt: string | null
  marketingAgreed: boolean | null
  brandIndustry: string | null
  brandTargetAudience: string | null
  brandUsp: string | null
  personaTone: PersonaTone | null
  personaGuideline: string | null
}

// Consent is considered complete once the mandatory terms timestamp is set.
export function isConsentComplete(profile: UserProfile | null) {
  return Boolean(profile?.termsAgreedAt)
}

// Returns true when the user is on a Pro plan.
export function isProPlan(profile: UserProfile | null) {
  return profile?.currentPlan === 'pro'
}

// Core interview is complete when all required brand fields are filled.
export function isBrandCoreComplete(profile: UserProfile | null) {
  return Boolean(
    profile?.brandIndustry
      && profile.brandTargetAudience
      && profile.brandUsp,
  )
}

// Restrict re-signup benefits within 30 days of last_left_at.
// Uses exact hour-based cutoff (30 * 24 * 60 * 60 * 1000 ms).
export function isReSignupRestricted(profile: UserProfile | null, now = new Date()) {
  if (!profile?.lastLeftAt) {
    return false
  }

  const lastLeftAt = new Date(profile.lastLeftAt)
  const restrictionEndsAt = new Date(lastLeftAt.getTime() + 30 * 24 * 60 * 60 * 1000)

  return now < restrictionEndsAt
}
