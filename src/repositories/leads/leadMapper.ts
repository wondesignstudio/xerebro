import type { Lead, LeadStatus } from '@/domain/lead'

export type LeadRow = {
  id: string
  source_channel: string | null
  original_url: string | null
  content_summary: string | null
  draft_message: string | null
  ai_intent: string | null
  ai_urgency_score: number | null
  status: LeadStatus
  created_at: string | null
}

export function toLead(row: LeadRow): Lead {
  return {
    id: row.id,
    sourceChannel: row.source_channel,
    originalUrl: row.original_url,
    contentSummary: row.content_summary,
    draftMessage: row.draft_message,
    aiIntent: row.ai_intent,
    aiUrgencyScore: row.ai_urgency_score,
    status: row.status,
    createdAt: row.created_at,
  }
}
