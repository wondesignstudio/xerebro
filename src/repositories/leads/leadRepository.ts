import { createServerSupabaseClient } from '@/repositories/supabase/server'
import { toLead, type LeadRow } from '@/repositories/leads/leadMapper'

export type LeadContextOption = {
  id: string
  contentSummary: string | null
}

type LeadContextOptionRow = {
  id: string
  content_summary: string | null
}

export async function listDailyRecommendedLeads(limit = 5) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('status', 'new')
    .order('ai_urgency_score', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error('Failed to load daily leads.')
  }

  return (data ?? []).map((row) => toLead(row as LeadRow))
}

export async function fetchLeadById(leadId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .maybeSingle<LeadRow>()

  if (error) {
    throw new Error('Failed to load lead.')
  }

  return data ? toLead(data) : null
}

// Loads recent leads for context-link creation (lead ↔ landing connection).
export async function listLeadContextOptions(limit = 20) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('leads')
    .select('id, content_summary')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error('Failed to load lead options.')
  }

  return (data ?? []).map((row) => {
    const typedRow = row as LeadContextOptionRow
    return {
      id: typedRow.id,
      contentSummary: typedRow.content_summary,
    } satisfies LeadContextOption
  })
}
