import { createServerSupabaseClient } from '@/repositories/supabase/server'
import { toLead, type LeadRow } from '@/repositories/leads/leadMapper'

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
