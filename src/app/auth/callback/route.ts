import { NextResponse } from 'next/server'
import { exchangeCodeForSession } from '@/repositories/auth/callbackRepository'
import { getAuthUser } from '@/viewmodels/auth/queries'
import { applyReSignupRestriction } from '@/viewmodels/auth/restrictions'

// Handles the OAuth redirect from Supabase and establishes a session.
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', requestUrl.origin))
  }

  await exchangeCodeForSession(code)

  // Apply re-signup restriction after session is established.
  const user = await getAuthUser()
  if (user) {
    await applyReSignupRestriction(user.id)
  }

  // Route through home to respect consent gating logic.
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
