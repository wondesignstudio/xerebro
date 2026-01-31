import type { LeadNotification, LeadNotificationStatus, LeadNotificationType } from '@/domain/leadNotification'
import { createServerSupabaseClient } from '@/repositories/supabase/server'

export type LeadNotificationRow = {
  id: string
  user_id: string
  type: LeadNotificationType
  status: LeadNotificationStatus
  created_at: string
}

function toLeadNotification(row: LeadNotificationRow): LeadNotification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    status: row.status,
    createdAt: row.created_at,
  }
}

export async function fetchLeadNotification(userId: string, type: LeadNotificationType) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('lead_notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .maybeSingle<LeadNotificationRow>()

  if (error) {
    throw new Error('Failed to load notification status.')
  }

  return data ? toLeadNotification(data) : null
}

export async function upsertLeadNotification(userId: string, type: LeadNotificationType) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('lead_notifications')
    .upsert({
      user_id: userId,
      type,
      status: 'pending' as LeadNotificationStatus,
    }, { onConflict: 'user_id,type' })
    .select('*')
    .single<LeadNotificationRow>()

  if (error) {
    throw new Error('Failed to save notification request.')
  }

  return toLeadNotification(data)
}

export type LeadNotificationWithEmail = LeadNotification & {
  email: string | null
}

export async function listPendingLeadNotifications(limit = 100) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('lead_notifications')
    .select('id, user_id, type, status, created_at, users(email)')
    .eq('status', 'pending')
    .eq('type', 'initial_search')
    .limit(limit)

  if (error) {
    throw new Error('Failed to load pending notifications.')
  }

  return (data ?? []).map((row) => {
    const typedRow = row as LeadNotificationRow & { users?: { email: string | null } | null }
    return {
      ...toLeadNotification(typedRow),
      email: typedRow.users?.email ?? null,
    }
  })
}

export async function markLeadNotificationsSent(ids: string[]) {
  if (ids.length === 0) {
    return
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('lead_notifications')
    .update({ status: 'sent' as LeadNotificationStatus })
    .in('id', ids)

  if (error) {
    throw new Error('Failed to update notification status.')
  }
}
