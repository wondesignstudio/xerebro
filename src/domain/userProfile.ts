// Domain model for user profile data needed by consent flows.
export type UserProfile = {
  id: string
  email: string | null
  termsAgreedAt: string | null
  // Timestamp of user-initiated withdrawal (soft delete).
  lastLeftAt: string | null
  marketingAgreed: boolean | null
}

// Consent is considered complete once the mandatory terms timestamp is set.
export function isConsentComplete(profile: UserProfile | null) {
  return Boolean(profile?.termsAgreedAt)
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
