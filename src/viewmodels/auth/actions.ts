'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { PersonaTone } from '@/domain/userProfile'
import { createOAuthSignInUrl, signOut, type OAuthProvider } from '@/repositories/auth/oauthRepository'
import { setUserLastLeftAt, upsertUserBrandIdentity, upsertUserConsent } from '@/repositories/users/userRepository'
import { requireAuthUserOrRedirect, requireAuthUserWithConsentOrRedirect } from '@/viewmodels/auth/guards'

const ALLOWED_PERSONA_TONES: PersonaTone[] = ['polite', 'friendly', 'professional', 'bold']

// Resolves the request origin to build absolute OAuth redirect URLs.
async function getRequestOrigin() {
  const headerList = await headers()
  const forwardedProto = headerList.get('x-forwarded-proto')
  const forwardedHost = headerList.get('x-forwarded-host')
  const host = forwardedHost ?? headerList.get('host')
  const proto = forwardedProto ?? 'http'

  if (!host) {
    throw new Error('Unable to resolve request host for OAuth redirect.')
  }

  return `${proto}://${host}`
}

function parseOptionalText(value: FormDataEntryValue | null) {
  if (!value) {
    return null
  }

  const trimmed = String(value).trim()
  return trimmed.length > 0 ? trimmed : null
}

// Starts OAuth sign-in and redirects the user to the provider.
export async function signInWithProvider(provider: OAuthProvider) {
  const redirectTo = `${await getRequestOrigin()}/auth/callback`
  const url = await createOAuthSignInUrl(provider, redirectTo)
  redirect(url)
}

// Clears the session and returns the user to login.
export async function signOutAction() {
  await signOut()
  redirect('/login')
}

// Stores mandatory terms consent and optional marketing consent.
export async function submitConsentAction(formData: FormData) {
  const termsAccepted = formData.get('terms') === 'on'
  const marketingAccepted = formData.get('marketing') === 'on'

  if (!termsAccepted) {
    redirect('/consent?error=terms_required')
  }

  const user = await requireAuthUserOrRedirect()

  await upsertUserConsent({
    userId: user.id,
    email: user.email ?? undefined,
    termsAgreedAt: new Date().toISOString(),
    marketingAgreed: marketingAccepted,
  })

  redirect('/dashboard')
}

// Handles user-initiated withdrawal (soft delete via last_left_at).
export async function withdrawAction() {
  const user = await requireAuthUserOrRedirect()
  const timestamp = new Date().toISOString()

  await setUserLastLeftAt(user.id, timestamp)
  await signOut()

  redirect('/login?withdrawn=1')
}

// Saves Brand Identity interview + persona tuning data.
export async function submitBrandIdentityAction(formData: FormData) {
  const { user } = await requireAuthUserWithConsentOrRedirect()

  const brandIndustry = parseOptionalText(formData.get('brandIndustry'))
  const brandTargetAudience = parseOptionalText(formData.get('brandTargetAudience'))
  const brandUsp = parseOptionalText(formData.get('brandUsp'))
  const personaGuideline = parseOptionalText(formData.get('personaGuideline'))
  const personaToneInput = parseOptionalText(formData.get('personaTone'))

  let personaTone: PersonaTone | null = null
  if (personaToneInput) {
    if (!ALLOWED_PERSONA_TONES.includes(personaToneInput as PersonaTone)) {
      redirect('/brand-identity?error=invalid_tone')
    }
    personaTone = personaToneInput as PersonaTone
  }

  try {
    await upsertUserBrandIdentity({
      userId: user.id,
      email: user.email ?? undefined,
      brandIndustry,
      brandTargetAudience,
      brandUsp,
      personaTone,
      personaGuideline,
    })
  } catch {
    redirect('/brand-identity?error=save_failed')
  }

  redirect('/brand-identity?saved=1')
}
