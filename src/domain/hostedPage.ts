export type HostedPage = {
  id: string
  userId: string
  slug: string
  layoutConfig: Record<string, unknown>
  themeColor: string | null
  ogImageUrl: string | null
  isPublished: boolean
  createdAt: string | null
  updatedAt: string | null
}

export type HostedPageCreateInput = {
  userId: string
  slug: string
  layoutConfig?: Record<string, unknown> | null
  themeColor?: string | null
  ogImageUrl?: string | null
  isPublished?: boolean
}

export type HostedPageUpdateInput = {
  id: string
  userId: string
  slug?: string
  layoutConfig?: Record<string, unknown> | null
  themeColor?: string | null
  ogImageUrl?: string | null
  isPublished?: boolean
}

const SLUG_PREFIX = 'page-'
export const HOSTED_PAGE_SLUG_MAX_LENGTH = 40
const UUID_V4_LIKE_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Generates a short, URL-safe slug for hosted pages.
export function generateHostedPageSlug() {
  const suffix = Math.random().toString(36).slice(2, 8)
  return `${SLUG_PREFIX}${suffix}`
}

// Normalizes a user-provided slug to a URL-safe format.
export function normalizeHostedPageSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    // Allow spaces during normalization so we can convert them into hyphens.
    .replace(/[^a-z0-9-_\s]/g, '')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Enforces the hosted-page slug maximum length.
export function isHostedPageSlugLengthValid(value: string) {
  return value.length <= HOSTED_PAGE_SLUG_MAX_LENGTH
}

// Validates hosted page ids used in dynamic routes.
// This prevents malformed ids from causing database-level cast errors.
export function isValidHostedPageId(value: string) {
  return UUID_V4_LIKE_PATTERN.test(value.trim())
}
