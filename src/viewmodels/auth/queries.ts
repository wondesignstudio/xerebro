import { isConsentComplete } from '@/domain/userProfile'
import { getCurrentUser } from '@/repositories/auth/sessionRepository'
import { fetchUserProfileById } from '@/repositories/users/userRepository'
import { requireAuthUserOrRedirect } from '@/viewmodels/auth/guards'

// Viewmodel wrapper for UI to access current user (nullable).
export async function getAuthUser() {
  return getCurrentUser()
}

// Determines the first screen for the root route based on auth/consent.
export async function getAuthEntryRoute() {
  const user = await getCurrentUser()

  if (!user) {
    return '/login'
  }

  const profile = await fetchUserProfileById(user.id)
  return isConsentComplete(profile) ? '/dashboard' : '/consent'
}

// Loads consent-related state for the consent UI.
export async function getConsentState() {
  const user = await requireAuthUserOrRedirect()
  const profile = await fetchUserProfileById(user.id)

  return {
    user,
    profile,
    hasConsented: isConsentComplete(profile),
  }
}
