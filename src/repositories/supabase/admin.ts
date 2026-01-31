import { createClient } from '@supabase/supabase-js'

// Server-only Supabase client with service role key for cron/admin tasks.
export function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin environment variables.')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}
