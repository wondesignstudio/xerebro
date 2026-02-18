import { requireProPlanOrRedirect } from '@/viewmodels/auth/guards'
import {
  incrementContextLinkClickCount,
  listContextLinksByHostedPage,
  resolveActiveContextLinkBySlug,
  resolveActiveContextLinkSlugAlias,
} from '@/repositories/contextLinks/contextLinkRepository'
import {
  debugHostedPageAccess,
  fetchHostedPageById,
  fetchPublishedHostedPageBySlug,
  listHostedPagesByUser,
  resolvePublishedHostedPageSlugAlias,
} from '@/repositories/hostedPages/hostedPageRepository'
import { listLeadContextOptions } from '@/repositories/leads/leadRepository'
import { getCurrentUser } from '@/repositories/auth/sessionRepository'
import { fetchUserProfileById } from '@/repositories/users/userRepository'
import { isProPlan } from '@/domain/userProfile'
import { isValidHostedPageId } from '@/domain/hostedPage'
import {
  logHostedPagesError,
  logHostedPagesInfo,
  startHostedPagesTrace,
} from '@/viewmodels/hostedPages/trace'

// Loads hosted pages for the current Pro user.
export async function getHostedPagesForCurrentUser() {
  const trace = startHostedPagesTrace('getHostedPagesForCurrentUser')
  const { user } = await requireProPlanOrRedirect()
  try {
    const pages = await listHostedPagesByUser(user.id)
    logHostedPagesInfo(trace, 'list_loaded', { userId: user.id, count: pages.length })
    return pages
  } catch (error) {
    logHostedPagesError(trace, 'list_load_failed', error, { userId: user.id })
    return []
  }
}

// Loads a single hosted page for the current Pro user.
export async function getHostedPageForCurrentUser(hostedPageId: string) {
  const detailContext = await getHostedPageDetailContext(hostedPageId)
  return detailContext.hostedPage
}

// Loads a single hosted page with its authenticated user context.
export async function getHostedPageDetailContext(hostedPageId: string) {
  const trace = startHostedPagesTrace('getHostedPageForCurrentUser', { hostedPageId })
  const { user } = await requireProPlanOrRedirect()

  if (!hostedPageId || !isValidHostedPageId(hostedPageId)) {
    logHostedPagesInfo(trace, 'invalid_hosted_page_id', { userId: user.id, hostedPageId })
    return { user, hostedPage: null }
  }

  try {
    const hostedPage = await fetchHostedPageById(user.id, hostedPageId, user.email)
    logHostedPagesInfo(trace, 'detail_loaded', {
      userId: user.id,
      hostedPageId,
      found: Boolean(hostedPage),
    })
    return { user, hostedPage }
  } catch (error) {
    logHostedPagesError(trace, 'detail_load_failed', error, { userId: user.id, hostedPageId })
    throw new Error('Failed to load hosted page detail.')
  }
}

// Debug helper: returns both RLS/admin snapshots for a hosted page.
export async function getHostedPageDebugState(hostedPageId: string) {
  const trace = startHostedPagesTrace('getHostedPageDebugState', { hostedPageId })
  const user = await getCurrentUser()

  if (!hostedPageId || !isValidHostedPageId(hostedPageId)) {
    logHostedPagesInfo(trace, 'invalid_hosted_page_id', { userId: user?.id ?? null, hostedPageId })
    return null
  }

  try {
    const debugState = await debugHostedPageAccess(user?.id ?? null, hostedPageId)
    logHostedPagesInfo(trace, 'debug_state_loaded', {
      userId: user?.id ?? null,
      hostedPageId,
      hasRls: Boolean(debugState?.rls),
      hasAdmin: Boolean(debugState?.admin),
    })
    return debugState
  } catch (error) {
    logHostedPagesError(trace, 'debug_state_failed', error, {
      userId: user?.id ?? null,
      hostedPageId,
    })
    return null
  }
}

// Debug-friendly loader: does not redirect, but still enforces Pro plan for content access.
// This prevents bypassing plan enforcement via ?debug=1 while still letting us inspect session state.
export async function getHostedPageForDebug(hostedPageId: string) {
  const trace = startHostedPagesTrace('getHostedPageForDebug', { hostedPageId })
  const user = await getCurrentUser()

  if (!user || !hostedPageId || !isValidHostedPageId(hostedPageId)) {
    logHostedPagesInfo(trace, 'debug_invalid_context', {
      userId: user?.id ?? null,
      hostedPageId,
    })
    return { user: user ?? null, profile: null, hostedPage: null }
  }

  const profile = await fetchUserProfileById(user.id)
  if (!isProPlan(profile)) {
    logHostedPagesInfo(trace, 'debug_non_pro_profile', { userId: user.id, hostedPageId })
    return { user, profile, hostedPage: null }
  }

  let hostedPage = null
  try {
    hostedPage = await fetchHostedPageById(user.id, hostedPageId, user.email)
    logHostedPagesInfo(trace, 'debug_detail_loaded', {
      userId: user.id,
      hostedPageId,
      found: Boolean(hostedPage),
    })
  } catch (error) {
    logHostedPagesError(trace, 'debug_detail_failed', error, { userId: user.id, hostedPageId })
    hostedPage = null
  }
  return { user, profile, hostedPage }
}

// Loads context-link management data for a hosted page.
export async function getContextLinkManagementContext(hostedPageId: string) {
  const { user } = await requireProPlanOrRedirect()
  return getContextLinkManagementContextForUser(user.id, hostedPageId)
}

// Loads context-link management data for a hosted page with a known user id.
export async function getContextLinkManagementContextForUser(userId: string, hostedPageId: string) {
  const trace = startHostedPagesTrace('getContextLinkManagementContext', { hostedPageId })

  if (!hostedPageId || !isValidHostedPageId(hostedPageId)) {
    logHostedPagesInfo(trace, 'invalid_hosted_page_id', { userId, hostedPageId })
    return { contextLinks: [], leadOptions: [] }
  }

  try {
    const [contextLinks, leadOptions] = await Promise.all([
      listContextLinksByHostedPage(userId, hostedPageId),
      listLeadContextOptions(20),
    ])
    logHostedPagesInfo(trace, 'context_management_loaded', {
      userId,
      hostedPageId,
      contextLinkCount: contextLinks.length,
      leadOptionCount: leadOptions.length,
    })

    return { contextLinks, leadOptions }
  } catch (error) {
    logHostedPagesError(trace, 'context_management_failed', error, { userId, hostedPageId })
    return { contextLinks: [], leadOptions: [] }
  }
}

// Public (published) hosted page loader.
// This is intentionally unauthenticated so the page can be shared publicly.
export async function getPublishedHostedPageBySlug(slug: string) {
  const trace = startHostedPagesTrace('getPublishedHostedPageBySlug', { slug })
  if (!slug) {
    logHostedPagesInfo(trace, 'missing_slug')
    return null
  }

  try {
    const hostedPage = await fetchPublishedHostedPageBySlug(slug)
    logHostedPagesInfo(trace, 'published_page_loaded', {
      slug,
      found: Boolean(hostedPage),
    })
    return hostedPage
  } catch (error) {
    logHostedPagesError(trace, 'published_page_load_failed', error, { slug })
    return null
  }
}

// Resolves legacy slug aliases to the latest published slug for redirect compatibility.
export async function getPublishedHostedPageRedirectSlugByAlias(slug: string) {
  const trace = startHostedPagesTrace('getPublishedHostedPageRedirectSlugByAlias', { slug })
  if (!slug) {
    logHostedPagesInfo(trace, 'missing_slug')
    return null
  }

  try {
    const redirectedSlug = await resolvePublishedHostedPageSlugAlias(slug)
    logHostedPagesInfo(trace, 'published_alias_resolved', {
      slug,
      found: Boolean(redirectedSlug),
      redirectedSlug,
    })
    return redirectedSlug
  } catch (error) {
    logHostedPagesError(trace, 'published_alias_resolve_failed', error, { slug })
    return null
  }
}

// Public resolver for context links: validates link + landing state and tracks click counts.
export async function resolveContextLinkRedirectPath(slug: string) {
  const trace = startHostedPagesTrace('resolveContextLinkRedirectPath', { slug })
  if (!slug) {
    logHostedPagesInfo(trace, 'missing_slug')
    return null
  }

  let resolved = null
  try {
    resolved = await resolveActiveContextLinkBySlug(slug)
  } catch (error) {
    logHostedPagesError(trace, 'context_link_resolve_failed', error, { slug })
    return null
  }
  if (!resolved) {
    logHostedPagesInfo(trace, 'context_link_not_found', { slug })
    return null
  }

  try {
    await incrementContextLinkClickCount(resolved.contextLinkId)
  } catch (error) {
    // Click analytics failure should not block user redirect.
    logHostedPagesError(trace, 'context_click_increment_failed', error, {
      slug,
      contextLinkId: resolved.contextLinkId,
    })
  }

  logHostedPagesInfo(trace, 'context_link_resolved', {
    slug,
    contextLinkId: resolved.contextLinkId,
    hostedPageSlug: resolved.hostedPageSlug,
  })
  return `/p/${resolved.hostedPageSlug}`
}

// Public resolver for legacy context-link aliases.
export async function resolveContextLinkAliasPath(slug: string) {
  const trace = startHostedPagesTrace('resolveContextLinkAliasPath', { slug })
  if (!slug) {
    logHostedPagesInfo(trace, 'missing_slug')
    return null
  }

  try {
    const redirectedSlug = await resolveActiveContextLinkSlugAlias(slug)
    logHostedPagesInfo(trace, 'context_link_alias_resolved', {
      slug,
      found: Boolean(redirectedSlug),
      redirectedSlug,
    })
    return redirectedSlug ? `/c/${redirectedSlug}` : null
  } catch (error) {
    logHostedPagesError(trace, 'context_link_alias_resolve_failed', error, { slug })
    return null
  }
}
