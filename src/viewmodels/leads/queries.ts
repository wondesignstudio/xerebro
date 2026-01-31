import { requireAuthUserWithConsentOrRedirect } from '@/viewmodels/auth/guards'
import { fetchLeadNotification } from '@/repositories/leads/leadNotificationRepository'
import { listDraftVersions } from '@/repositories/leads/leadDraftRepository'
import { fetchLeadById, listDailyRecommendedLeads } from '@/repositories/leads/leadRepository'

// Loads daily recommended leads for the current user.
export async function getDailyLeads() {
  await requireAuthUserWithConsentOrRedirect()
  return listDailyRecommendedLeads(5)
}

// Loads a single lead for detail display.
export async function getLeadDetail(leadId: string) {
  await requireAuthUserWithConsentOrRedirect()
  return fetchLeadById(leadId)
}

// Returns lead detail with draft undo availability.
export async function getLeadDraftContext(leadId: string) {
  await requireAuthUserWithConsentOrRedirect()
  const lead = await fetchLeadById(leadId)

  if (!lead) {
    return { lead: null, canUndo: false, history: [] }
  }

  const versions = await listDraftVersions(leadId, 5)
  return { lead, canUndo: versions.length >= 2, history: versions }
}

export async function getLeadNotificationStatus() {
  const { user } = await requireAuthUserWithConsentOrRedirect()
  return fetchLeadNotification(user.id, 'initial_search')
}
