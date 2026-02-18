export type ContextLink = {
  id: string
  userId: string
  leadId: string
  hostedPageId: string
  slug: string
  targetMessage: string | null
  clickCount: number
  isActive: boolean
  createdAt: string | null
  updatedAt: string | null
}

export type ContextLinkCreateInput = {
  userId: string
  leadId: string
  hostedPageId: string
  slug: string
  targetMessage?: string | null
  isActive?: boolean
}

export type ContextLinkUpdateInput = {
  id: string
  userId: string
  hostedPageId: string
  leadId?: string
  slug?: string
  targetMessage?: string | null
  isActive?: boolean
}

const SLUG_PREFIX = 'ctx-'
export const CONTEXT_LINK_SLUG_MAX_LENGTH = 40
const UUID_V4_LIKE_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Generates a compact, URL-safe slug for public context links.
export function generateContextLinkSlug() {
  const suffix = Math.random().toString(36).slice(2, 8)
  return `${SLUG_PREFIX}${suffix}`
}

// Normalizes user-entered context slugs to URL-safe text.
export function normalizeContextLinkSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_\s]/g, ' ')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Enforces the context-link slug maximum length.
export function isContextLinkSlugLengthValid(value: string) {
  return value.length <= CONTEXT_LINK_SLUG_MAX_LENGTH
}

export function isValidContextLinkId(value: string) {
  return UUID_V4_LIKE_PATTERN.test(value.trim())
}
