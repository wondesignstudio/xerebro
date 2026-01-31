import { createServerSupabaseClient } from '@/repositories/supabase/server'

export type LeadDraftVersion = {
  id: string
  leadId: string
  userId: string
  draftMessage: string
  createdAt: string
}

type LeadDraftVersionRow = {
  id: string
  lead_id: string
  user_id: string
  draft_message: string
  created_at: string
}

function toLeadDraftVersion(row: LeadDraftVersionRow): LeadDraftVersion {
  return {
    id: row.id,
    leadId: row.lead_id,
    userId: row.user_id,
    draftMessage: row.draft_message,
    createdAt: row.created_at,
  }
}

export async function insertDraftVersion(params: {
  leadId: string
  userId: string
  draftMessage: string
}) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('lead_draft_versions')
    .insert({
      lead_id: params.leadId,
      user_id: params.userId,
      draft_message: params.draftMessage,
    })
    .select('*')
    .single<LeadDraftVersionRow>()

  if (error) {
    throw new Error('Failed to save draft history.')
  }

  return toLeadDraftVersion(data)
}

export async function listDraftVersions(leadId: string, limit = 2) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('lead_draft_versions')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error('Failed to load draft history.')
  }

  return (data ?? []).map((row) => toLeadDraftVersion(row as LeadDraftVersionRow))
}

export async function hasDraftHistory(leadId: string) {
  const versions = await listDraftVersions(leadId, 1)
  return versions.length > 0
}

export async function fetchDraftVersionById(params: {
  leadId: string
  userId: string
  versionId: string
}) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('lead_draft_versions')
    .select('*')
    .eq('id', params.versionId)
    .eq('lead_id', params.leadId)
    .eq('user_id', params.userId)
    .maybeSingle<LeadDraftVersionRow>()

  if (error) {
    throw new Error('Failed to load draft version.')
  }

  return data ? toLeadDraftVersion(data) : null
}

export async function updateLeadDraftMessage(leadId: string, draftMessage: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('leads')
    .update({ draft_message: draftMessage })
    .eq('id', leadId)
    .select('id')
    .single()

  if (error) {
    throw new Error('Failed to update draft message.')
  }

  return data
}
