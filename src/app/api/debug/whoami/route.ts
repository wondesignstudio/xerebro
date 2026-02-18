import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/repositories/supabase/server'
import { isDebugAccessEnabled } from '@/viewmodels/auth/runtime'

// Simple debug endpoint to confirm which Supabase auth user is currently in session.
// This helps diagnose "page not found" issues caused by account/session mismatches.
export async function GET(request: Request) {
  if (!isDebugAccessEnabled()) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.getUser()

  if (error && error.name === 'AuthSessionMissingError') {
    return NextResponse.json({
      host: new URL(request.url).host,
      loggedIn: false,
      user: null,
    })
  }

  if (error) {
    return NextResponse.json(
      {
        host: new URL(request.url).host,
        loggedIn: false,
        error: error.message,
      },
      { status: 500 },
    )
  }

  const user = data.user
    ? {
        id: data.user.id,
        email: data.user.email ?? null,
      }
    : null

  return NextResponse.json({
    host: new URL(request.url).host,
    loggedIn: Boolean(user),
    user,
  })
}
