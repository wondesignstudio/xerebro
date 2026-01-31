import { createServerSupabaseClient } from '@/repositories/supabase/server'

// Exchanges OAuth code for a session and sets auth cookies.
export async function exchangeCodeForSession(code: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    throw new Error('Failed to exchange OAuth code for session.')
  }
}
