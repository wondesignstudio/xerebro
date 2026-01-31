import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  listPendingLeadNotifications,
  markLeadNotificationsSent,
} from '@/repositories/leads/leadNotificationRepository'
import { sendLeadReadyEmail } from '@/repositories/notifications/resendMailer'
import { createAdminSupabaseClient } from '@/repositories/supabase/admin'

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (!secret) {
    return false
  }

  return authHeader === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const baseUrl = process.env.APP_BASE_URL || request.nextUrl.origin
  const adminClient = createAdminSupabaseClient()
  const pending = await listPendingLeadNotifications(100, adminClient)

  if (pending.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0 })
  }

  const sentIds: string[] = []
  let failedCount = 0

  for (const item of pending) {
    if (!item.email) {
      failedCount += 1
      continue
    }

    try {
      await sendLeadReadyEmail({
        to: item.email,
        dashboardUrl: `${baseUrl}/dashboard`,
      })
      sentIds.push(item.id)
    } catch {
      failedCount += 1
    }
  }

  await markLeadNotificationsSent(sentIds, adminClient)

  return NextResponse.json({ sent: sentIds.length, failed: failedCount })
}
