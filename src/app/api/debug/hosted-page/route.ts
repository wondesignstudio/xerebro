import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/repositories/auth/sessionRepository'
import { debugHostedPageAccess } from '@/repositories/hostedPages/hostedPageRepository'
import { fetchUserProfileById } from '@/repositories/users/userRepository'
import { isDebugAccessEnabled } from '@/viewmodels/auth/runtime'

// Debug endpoint: returns hosted page ownership + plan snapshot for the current session user.
// Safe by design: admin data is only returned when the hosted page belongs to the session user.
export async function GET(request: Request) {
  if (!isDebugAccessEnabled()) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const url = new URL(request.url)
  const hostedPageId = (url.searchParams.get('id') ?? '').trim()

  if (!hostedPageId) {
    return NextResponse.json(
      {
        host: url.host,
        error: 'missing_id',
        message: 'Query param "id" is required.',
      },
      { status: 400 },
    )
  }

  const user = await getCurrentUser()

  let profile: Awaited<ReturnType<typeof fetchUserProfileById>> | null = null
  let profileError: string | null = null

  if (user) {
    try {
      profile = await fetchUserProfileById(user.id)
    } catch (error) {
      profileError = error instanceof Error ? error.message : 'Failed to load profile.'
    }
  }

  const debug = await debugHostedPageAccess(user?.id ?? null, hostedPageId)

  return NextResponse.json({
    host: url.host,
    hostedPageId,
    user,
    profile,
    profileError,
    debug,
  })
}
