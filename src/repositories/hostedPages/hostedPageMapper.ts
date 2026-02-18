import type { HostedPage } from '@/domain/hostedPage'

export type HostedPageRow = {
  id: string
  user_id: string
  slug: string
  layout_config: Record<string, unknown> | null
  theme_color: string | null
  og_image_url: string | null
  is_published: boolean | null
  created_at: string | null
  updated_at: string | null
}

// Maps database row to domain model.
export function toHostedPage(row: HostedPageRow): HostedPage {
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    layoutConfig: row.layout_config ?? {},
    themeColor: row.theme_color,
    ogImageUrl: row.og_image_url,
    isPublished: row.is_published ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
