import { NextResponse } from 'next/server'
import { isValidHostedPageId } from '@/domain/hostedPage'
import { isProPlan } from '@/domain/userProfile'
import { getCurrentUser } from '@/repositories/auth/sessionRepository'
import { fetchHostedPageById } from '@/repositories/hostedPages/hostedPageRepository'
import { fetchUserProfileById } from '@/repositories/users/userRepository'
import { getContextLinkManagementContextForUser } from '@/viewmodels/hostedPages/queries'

type RouteParams = {
  params: Promise<{ id: string }>
}

// Deferred context-loader API for hosted-page detail.
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params

  if (!isValidHostedPageId(id)) {
    return NextResponse.json(
      { error: 'invalid_hosted_page_id' },
      { status: 400 },
    )
  }

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const profile = await fetchUserProfileById(user.id)
  if (!isProPlan(profile)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const hostedPage = await fetchHostedPageById(user.id, id, user.email)
  if (!hostedPage) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const payload = await getContextLinkManagementContextForUser(user.id, id)
  return NextResponse.json(payload, {
    headers: {
      'cache-control': 'no-store',
    },
  })
}
