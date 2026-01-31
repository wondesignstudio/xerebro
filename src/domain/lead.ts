export type LeadStatus = 'new' | 'contacted' | 'converted' | 'reported'

export type Lead = {
  id: string
  sourceChannel: string | null
  originalUrl: string | null
  contentSummary: string | null
  draftMessage: string | null
  aiIntent: string | null
  aiUrgencyScore: number | null
  status: LeadStatus
  createdAt: string | null
}
