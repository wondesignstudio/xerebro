import type { ContextLink } from '@/domain/contextLink'

export type ContextLinkRow = {
  id: string
  user_id: string
  lead_id: string
  hosted_page_id: string
  slug: string
  target_message: string | null
  click_count: number | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

export function toContextLink(row: ContextLinkRow): ContextLink {
  return {
    id: row.id,
    userId: row.user_id,
    leadId: row.lead_id,
    hostedPageId: row.hosted_page_id,
    slug: row.slug,
    targetMessage: row.target_message,
    clickCount: row.click_count ?? 0,
    isActive: row.is_active ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
