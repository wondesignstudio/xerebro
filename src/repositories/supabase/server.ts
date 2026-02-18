import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Centralized, server-only Supabase client with cookie passthrough.
// This keeps auth/session handling out of UI and viewmodels.
export async function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables.')
  }

  const cookieStore = await cookies()

  type CookieSetOptions = Omit<Parameters<typeof cookieStore.set>[0], 'name' | 'value'>

  const safeSetCookie = (name: string, value: string, options?: CookieSetOptions) => {
    try {
      cookieStore.set({ name, value, ...(options ?? {}) })
    } catch {
      // Ignore cookie mutation errors in server components.
    }
  }

  const safeRemoveCookie = (name: string, options?: CookieSetOptions) => {
    try {
      cookieStore.set({ name, value: '', ...(options ?? {}) })
    } catch {
      // Ignore cookie mutation errors in server components.
    }
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      set(name, value, options) {
        safeSetCookie(name, value, options)
      },
      remove(name, options) {
        safeRemoveCookie(name, options)
      },
    },
  })
}
