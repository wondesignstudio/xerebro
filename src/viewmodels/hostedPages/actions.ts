'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  isContextLinkSlugLengthValid,
  generateContextLinkSlug,
  isValidContextLinkId,
  normalizeContextLinkSlug,
} from '@/domain/contextLink'
import {
  generateHostedPageSlug,
  isHostedPageSlugLengthValid,
  normalizeHostedPageSlug,
} from '@/domain/hostedPage'
import {
  createContextLink,
  deleteContextLink,
  updateContextLink,
} from '@/repositories/contextLinks/contextLinkRepository'
import {
  createHostedPage,
  deleteHostedPage as deleteHostedPageRepository,
  updateHostedPage,
} from '@/repositories/hostedPages/hostedPageRepository'
import { requireProPlanOrRedirect } from '@/viewmodels/auth/guards'
import {
  logHostedPagesError,
  logHostedPagesInfo,
  startHostedPagesTrace,
  type HostedPagesTrace,
} from '@/viewmodels/hostedPages/trace'
import {
  buildRedirectPathWithParam,
  resolveHostedPageUpdateRedirectPath,
} from '@/viewmodels/hostedPages/redirectUtils'

const MAX_SLUG_ATTEMPTS = 5
const MAX_CONTEXT_SLUG_ATTEMPTS = 5
const HOSTED_PAGES_LIST_PATH = '/hosted-pages'

function parseOptionalText(value: FormDataEntryValue | null) {
  if (!value) {
    return null
  }

  const trimmed = String(value).trim()
  return trimmed.length > 0 ? trimmed : null
}

function parseBoolean(value: FormDataEntryValue | null) {
  if (value === null) {
    return undefined
  }

  return String(value).toLowerCase() === 'true'
}

function isUniqueViolation(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error
    ? String((error as { code?: string }).code)
    : ''

  return code === '23505'
}

function getHostedPageDetailPath(hostedPageId: string) {
  return `/hosted-pages/${hostedPageId}`
}

function redirectContextLinkError(hostedPageId: string, error: string) {
  redirect(`${getHostedPageDetailPath(hostedPageId)}?error=${error}`)
}

async function createWithAutoSlug(userId: string, payload: {
  layoutConfig?: Record<string, unknown> | null
  themeColor?: string | null
  ogImageUrl?: string | null
  isPublished?: boolean
}, trace?: HostedPagesTrace) {
  let lastError: unknown = null

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const slug = generateHostedPageSlug()

    try {
      return await createHostedPage({
        userId,
        slug,
        layoutConfig: payload.layoutConfig ?? {},
        themeColor: payload.themeColor ?? null,
        ogImageUrl: payload.ogImageUrl ?? null,
        isPublished: payload.isPublished ?? false,
      })
    } catch (error) {
      lastError = error

      if (trace && isUniqueViolation(error)) {
        logHostedPagesInfo(trace, 'auto_slug_conflict', { attempt: attempt + 1, slug })
      }

      if (!isUniqueViolation(error)) {
        throw error
      }
    }
  }

  throw lastError ?? new Error('Failed to generate a unique slug.')
}

async function createContextLinkWithAutoSlug(payload: {
  userId: string
  leadId: string
  hostedPageId: string
  targetMessage?: string | null
  isActive?: boolean
}, trace?: HostedPagesTrace) {
  let lastError: unknown = null

  for (let attempt = 0; attempt < MAX_CONTEXT_SLUG_ATTEMPTS; attempt += 1) {
    const slug = generateContextLinkSlug()

    try {
      return await createContextLink({
        userId: payload.userId,
        leadId: payload.leadId,
        hostedPageId: payload.hostedPageId,
        slug,
        targetMessage: payload.targetMessage ?? null,
        isActive: payload.isActive ?? true,
      })
    } catch (error) {
      lastError = error

      if (trace && isUniqueViolation(error)) {
        logHostedPagesInfo(trace, 'auto_context_slug_conflict', { attempt: attempt + 1, slug })
      }

      if (!isUniqueViolation(error)) {
        throw error
      }
    }
  }

  throw lastError ?? new Error('Failed to generate a unique context slug.')
}

// Creates a hosted page (auto-generates slug when not provided).
export async function createHostedPageAction(formData: FormData) {
  const trace = startHostedPagesTrace('createHostedPageAction')
  const { user } = await requireProPlanOrRedirect()

  const requestedSlug = parseOptionalText(formData.get('slug'))
  const themeColor = parseOptionalText(formData.get('themeColor'))
  const ogImageUrl = parseOptionalText(formData.get('ogImageUrl'))
  const isPublished = parseBoolean(formData.get('isPublished'))
  logHostedPagesInfo(trace, 'validated_input', {
    userId: user.id,
    requestedSlug,
    hasLayoutConfig: Boolean(parseOptionalText(formData.get('layoutConfig'))),
    isPublished: isPublished ?? false,
  })

  let layoutConfig: Record<string, unknown> | null = null
  const layoutConfigRaw = parseOptionalText(formData.get('layoutConfig'))

  if (layoutConfigRaw) {
    try {
      layoutConfig = JSON.parse(layoutConfigRaw) as Record<string, unknown>
    } catch (error) {
      logHostedPagesError(trace, 'invalid_layout_json', error, { userId: user.id })
      redirect('/hosted-pages?error=invalid_layout')
    }
  }

  let createdId: string | null = null

  if (requestedSlug) {
    const normalized = normalizeHostedPageSlug(requestedSlug)

    if (!normalized) {
      logHostedPagesInfo(trace, 'invalid_slug', { userId: user.id, requestedSlug })
      redirect('/hosted-pages?error=invalid_slug')
    }

    if (!isHostedPageSlugLengthValid(normalized)) {
      logHostedPagesInfo(trace, 'slug_too_long', { userId: user.id, requestedSlug, normalized })
      redirect('/hosted-pages?error=slug_too_long')
    }

    try {
      const created = await createHostedPage({
        userId: user.id,
        slug: normalized,
        layoutConfig: layoutConfig ?? {},
        themeColor,
        ogImageUrl,
        isPublished: isPublished ?? false,
      })
      createdId = created.id
      logHostedPagesInfo(trace, 'created_with_requested_slug', {
        userId: user.id,
        hostedPageId: created.id,
        slug: created.slug,
      })
    } catch (error) {
      if (isUniqueViolation(error)) {
        logHostedPagesInfo(trace, 'requested_slug_conflict', { userId: user.id, requestedSlug })
        redirect('/hosted-pages?error=slug_taken')
      }

      logHostedPagesError(trace, 'create_failed_with_requested_slug', error, { userId: user.id })
      redirect('/hosted-pages?error=create_failed')
    }
  } else {
    try {
      const created = await createWithAutoSlug(user.id, {
        layoutConfig,
        themeColor,
        ogImageUrl,
        isPublished,
      }, trace)
      createdId = created.id
      logHostedPagesInfo(trace, 'created_with_auto_slug', {
        userId: user.id,
        hostedPageId: created.id,
        slug: created.slug,
      })
    } catch (error) {
      logHostedPagesError(trace, 'create_failed_with_auto_slug', error, { userId: user.id })
      redirect('/hosted-pages?error=create_failed')
    }
  }

  revalidatePath('/hosted-pages')
  if (createdId) {
    logHostedPagesInfo(trace, 'redirect_to_detail', { userId: user.id, hostedPageId: createdId })
    revalidatePath(`/hosted-pages/${createdId}`)
    redirect(`/hosted-pages/${createdId}?created=1`)
  }
  logHostedPagesInfo(trace, 'redirect_to_list_created', { userId: user.id })
  redirect('/hosted-pages?created=1')
}

// Updates an existing hosted page.
export async function updateHostedPageAction(formData: FormData) {
  const trace = startHostedPagesTrace('updateHostedPageAction')
  const { user } = await requireProPlanOrRedirect()

  const hostedPageId = String(formData.get('hostedPageId') ?? '').trim()
  const redirectPath = resolveHostedPageUpdateRedirectPath(
    parseOptionalText(formData.get('redirectTo')),
    hostedPageId,
  )

  if (!hostedPageId) {
    logHostedPagesInfo(trace, 'missing_hosted_page_id', { userId: user.id })
    redirect(buildRedirectPathWithParam(redirectPath, 'error', 'missing_id'))
  }

  const slugInput = parseOptionalText(formData.get('slug'))
  const themeColor = parseOptionalText(formData.get('themeColor'))
  const ogImageUrl = parseOptionalText(formData.get('ogImageUrl'))
  const isPublished = parseBoolean(formData.get('isPublished'))

  let slug: string | undefined
  if (slugInput) {
    const normalized = normalizeHostedPageSlug(slugInput)

    if (!normalized) {
      logHostedPagesInfo(trace, 'invalid_slug', { userId: user.id, hostedPageId, slugInput })
      redirect(buildRedirectPathWithParam(redirectPath, 'error', 'invalid_slug'))
    }

    if (!isHostedPageSlugLengthValid(normalized)) {
      logHostedPagesInfo(trace, 'slug_too_long', { userId: user.id, hostedPageId, slugInput, normalized })
      redirect(buildRedirectPathWithParam(redirectPath, 'error', 'slug_too_long'))
    }

    slug = normalized
  }

  let layoutConfig: Record<string, unknown> | null | undefined
  const layoutConfigRaw = parseOptionalText(formData.get('layoutConfig'))

  if (layoutConfigRaw !== null) {
    try {
      layoutConfig = JSON.parse(layoutConfigRaw) as Record<string, unknown>
    } catch (error) {
      logHostedPagesError(trace, 'invalid_layout_json', error, { userId: user.id, hostedPageId })
      redirect(buildRedirectPathWithParam(redirectPath, 'error', 'invalid_layout'))
    }
  }

  try {
    const updated = await updateHostedPage({
      id: hostedPageId,
      userId: user.id,
      slug,
      layoutConfig,
      themeColor,
      ogImageUrl,
      isPublished,
    })

    if (!updated) {
      logHostedPagesInfo(trace, 'hosted_page_not_found', { userId: user.id, hostedPageId })
      redirect(buildRedirectPathWithParam(redirectPath, 'error', 'not_found'))
    }
    logHostedPagesInfo(trace, 'hosted_page_updated', {
      userId: user.id,
      hostedPageId,
      slug: updated.slug,
      isPublished: updated.isPublished,
    })
  } catch (error) {
    if (isUniqueViolation(error)) {
      logHostedPagesInfo(trace, 'slug_conflict_on_update', { userId: user.id, hostedPageId, slug })
      redirect(buildRedirectPathWithParam(redirectPath, 'error', 'slug_taken'))
    }

    logHostedPagesError(trace, 'update_failed', error, { userId: user.id, hostedPageId })
    redirect(buildRedirectPathWithParam(redirectPath, 'error', 'update_failed'))
  }

  revalidatePath(HOSTED_PAGES_LIST_PATH)
  revalidatePath(`/hosted-pages/${hostedPageId}`)
  logHostedPagesInfo(trace, 'redirect_after_update', { userId: user.id, hostedPageId, redirectPath })
  redirect(buildRedirectPathWithParam(redirectPath, 'updated', '1'))
}

// Deletes a hosted page owned by the current user.
export async function deleteHostedPageAction(formData: FormData) {
  const trace = startHostedPagesTrace('deleteHostedPageAction')
  const { user } = await requireProPlanOrRedirect()
  const hostedPageId = String(formData.get('hostedPageId') ?? '').trim()

  if (!hostedPageId) {
    logHostedPagesInfo(trace, 'missing_hosted_page_id', { userId: user.id })
    redirect('/hosted-pages?error=missing_id')
  }

  try {
    await deleteHostedPageRepository(user.id, hostedPageId)
    logHostedPagesInfo(trace, 'hosted_page_deleted', { userId: user.id, hostedPageId })
  } catch (error) {
    logHostedPagesError(trace, 'delete_failed', error, { userId: user.id, hostedPageId })
    redirect('/hosted-pages?error=delete_failed')
  }

  revalidatePath('/hosted-pages')
  logHostedPagesInfo(trace, 'redirect_to_list_deleted', { userId: user.id, hostedPageId })
  redirect('/hosted-pages?deleted=1')
}

// Creates a context link and connects it to a lead + hosted page.
export async function createContextLinkAction(formData: FormData) {
  const trace = startHostedPagesTrace('createContextLinkAction')
  const { user } = await requireProPlanOrRedirect()

  const hostedPageId = String(formData.get('hostedPageId') ?? '').trim()
  const leadId = String(formData.get('leadId') ?? '').trim()
  const targetMessage = parseOptionalText(formData.get('targetMessage'))
  const requestedSlug = parseOptionalText(formData.get('slug'))

  if (!hostedPageId) {
    logHostedPagesInfo(trace, 'missing_hosted_page_id', { userId: user.id })
    redirect('/hosted-pages?error=missing_id')
  }

  if (!leadId) {
    logHostedPagesInfo(trace, 'missing_lead_id', { userId: user.id, hostedPageId })
    redirectContextLinkError(hostedPageId, 'missing_lead')
  }

  try {
    if (requestedSlug) {
      const normalizedSlug = normalizeContextLinkSlug(requestedSlug)

      if (!normalizedSlug) {
        logHostedPagesInfo(trace, 'invalid_context_slug', {
          userId: user.id,
          hostedPageId,
          requestedSlug,
        })
        redirectContextLinkError(hostedPageId, 'invalid_context_slug')
      }

      if (!isContextLinkSlugLengthValid(normalizedSlug)) {
        logHostedPagesInfo(trace, 'context_slug_too_long', {
          userId: user.id,
          hostedPageId,
          requestedSlug,
          normalizedSlug,
        })
        redirectContextLinkError(hostedPageId, 'context_slug_too_long')
      }

      await createContextLink({
        userId: user.id,
        leadId,
        hostedPageId,
        slug: normalizedSlug,
        targetMessage,
        isActive: true,
      })
      logHostedPagesInfo(trace, 'context_link_created_with_requested_slug', {
        userId: user.id,
        hostedPageId,
        leadId,
        slug: normalizedSlug,
      })
    } else {
      await createContextLinkWithAutoSlug({
        userId: user.id,
        leadId,
        hostedPageId,
        targetMessage,
        isActive: true,
      }, trace)
      logHostedPagesInfo(trace, 'context_link_created_with_auto_slug', {
        userId: user.id,
        hostedPageId,
        leadId,
      })
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      logHostedPagesInfo(trace, 'context_slug_conflict', { userId: user.id, hostedPageId, requestedSlug })
      redirectContextLinkError(hostedPageId, 'context_slug_taken')
    }

    logHostedPagesError(trace, 'context_create_failed', error, {
      userId: user.id,
      hostedPageId,
      leadId,
    })
    redirectContextLinkError(hostedPageId, 'context_create_failed')
  }

  revalidatePath('/hosted-pages')
  revalidatePath(getHostedPageDetailPath(hostedPageId))
  logHostedPagesInfo(trace, 'redirect_to_detail_context_created', { userId: user.id, hostedPageId })
  redirect(`${getHostedPageDetailPath(hostedPageId)}?context_created=1`)
}

// Toggles active state for a context link.
export async function toggleContextLinkAction(formData: FormData) {
  const trace = startHostedPagesTrace('toggleContextLinkAction')
  const { user } = await requireProPlanOrRedirect()

  const hostedPageId = String(formData.get('hostedPageId') ?? '').trim()
  const contextLinkId = String(formData.get('contextLinkId') ?? '').trim()
  const isActive = parseBoolean(formData.get('isActive'))

  if (!hostedPageId) {
    logHostedPagesInfo(trace, 'missing_hosted_page_id', { userId: user.id })
    redirect('/hosted-pages?error=missing_id')
  }

  if (!contextLinkId || !isValidContextLinkId(contextLinkId)) {
    logHostedPagesInfo(trace, 'invalid_context_link_id', { userId: user.id, hostedPageId, contextLinkId })
    redirectContextLinkError(hostedPageId, 'invalid_context_link')
  }

  if (isActive === undefined) {
    logHostedPagesInfo(trace, 'invalid_context_active_state', { userId: user.id, hostedPageId, contextLinkId })
    redirectContextLinkError(hostedPageId, 'invalid_context_state')
  }

  try {
    const updated = await updateContextLink({
      id: contextLinkId,
      userId: user.id,
      hostedPageId,
      isActive,
    })

    if (!updated) {
      logHostedPagesInfo(trace, 'context_link_not_found', { userId: user.id, hostedPageId, contextLinkId })
      redirectContextLinkError(hostedPageId, 'context_not_found')
    }
    logHostedPagesInfo(trace, 'context_link_toggled', {
      userId: user.id,
      hostedPageId,
      contextLinkId,
      isActive,
    })
  } catch (error) {
    logHostedPagesError(trace, 'context_update_failed', error, {
      userId: user.id,
      hostedPageId,
      contextLinkId,
      isActive,
    })
    redirectContextLinkError(hostedPageId, 'context_update_failed')
  }

  revalidatePath('/hosted-pages')
  revalidatePath(getHostedPageDetailPath(hostedPageId))
  logHostedPagesInfo(trace, 'redirect_to_detail_context_updated', { userId: user.id, hostedPageId })
  redirect(`${getHostedPageDetailPath(hostedPageId)}?context_updated=1`)
}

// Deletes a context link owned by the current user.
export async function deleteContextLinkAction(formData: FormData) {
  const trace = startHostedPagesTrace('deleteContextLinkAction')
  const { user } = await requireProPlanOrRedirect()

  const hostedPageId = String(formData.get('hostedPageId') ?? '').trim()
  const contextLinkId = String(formData.get('contextLinkId') ?? '').trim()

  if (!hostedPageId) {
    logHostedPagesInfo(trace, 'missing_hosted_page_id', { userId: user.id })
    redirect('/hosted-pages?error=missing_id')
  }

  if (!contextLinkId || !isValidContextLinkId(contextLinkId)) {
    logHostedPagesInfo(trace, 'invalid_context_link_id', { userId: user.id, hostedPageId, contextLinkId })
    redirectContextLinkError(hostedPageId, 'invalid_context_link')
  }

  try {
    await deleteContextLink(user.id, hostedPageId, contextLinkId)
    logHostedPagesInfo(trace, 'context_link_deleted', { userId: user.id, hostedPageId, contextLinkId })
  } catch (error) {
    logHostedPagesError(trace, 'context_delete_failed', error, {
      userId: user.id,
      hostedPageId,
      contextLinkId,
    })
    redirectContextLinkError(hostedPageId, 'context_delete_failed')
  }

  revalidatePath('/hosted-pages')
  revalidatePath(getHostedPageDetailPath(hostedPageId))
  logHostedPagesInfo(trace, 'redirect_to_detail_context_deleted', { userId: user.id, hostedPageId })
  redirect(`${getHostedPageDetailPath(hostedPageId)}?context_deleted=1`)
}
