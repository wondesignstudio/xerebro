import { redirect } from 'next/navigation'
import { isConsentComplete, isProPlan } from '@/domain/userProfile'
import { getCurrentUser } from '@/repositories/auth/sessionRepository'
import { fetchUserProfileById } from '@/repositories/users/userRepository'

// Ensures an authenticated user is present for server-rendered pages.
// Redirects to login instead of throwing to avoid hard errors in UI.
export async function requireAuthUserOrRedirect() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

// Ensures the user is authenticated and has completed required consent.
// Redirects to /consent if terms are missing.
export async function requireAuthUserWithConsentOrRedirect() {
  const user = await requireAuthUserOrRedirect()
  const profile = await fetchUserProfileById(user.id)

  if (!isConsentComplete(profile)) {
    redirect('/consent')
  }

  return { user, profile }
}

// Ensures the user is on a Pro plan. Redirects to pricing when not eligible.
export async function requireProPlanOrRedirect() {
  const { user, profile } = await requireAuthUserWithConsentOrRedirect()

  if (!isProPlan(profile)) {
    redirect('/pricing')
  }

  return { user, profile }
}
