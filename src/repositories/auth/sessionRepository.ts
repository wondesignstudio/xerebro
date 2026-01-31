import type { AuthUser } from '@/domain/auth'
import { createServerSupabaseClient } from '@/repositories/supabase/server'

// Fetches the current user from Supabase auth session.
// Returns null when no active session exists.
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error('Failed to load current user session.')
  }

  if (!data.user) {
    return null
  }

  return {
    id: data.user.id,
    email: data.user.email ?? null,
  }
}

// Convenience helper that throws when no session exists.
export async function requireCurrentUser(): Promise<AuthUser> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized: user session required.')
  }

  return user
}
