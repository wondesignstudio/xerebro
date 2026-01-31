import { createServerSupabaseClient } from '@/repositories/supabase/server'
import type { LeadStatus } from '@/domain/lead'

// Updates lead status only when the current status is 'new'.
export async function updateLeadStatusOnCopy(leadId: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('leads')
    .update({ status: 'contacted' as LeadStatus })
    .eq('id', leadId)
    .eq('status', 'new')
    .select('id')
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error('Failed to update lead status.')
  }

  return data
}
