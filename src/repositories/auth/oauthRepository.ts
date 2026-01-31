import { createServerSupabaseClient } from '@/repositories/supabase/server'

export type OAuthProvider = 'google' | 'kakao'

// Starts OAuth sign-in and returns the provider redirect URL.
export async function createOAuthSignInUrl(provider: OAuthProvider, redirectTo: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  })

  if (error || !data.url) {
    throw new Error('Failed to initialize OAuth sign-in.')
  }

  return data.url
}

// Ends the current session.
export async function signOut() {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error('Failed to sign out.')
  }
}
