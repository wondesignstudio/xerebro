import { createServerSupabaseClient } from '@/repositories/supabase/server'
import { createAdminSupabaseClient } from '@/repositories/supabase/admin'
import type { HostedPageCreateInput, HostedPageUpdateInput } from '@/domain/hostedPage'
import { toHostedPage, type HostedPageRow } from '@/repositories/hostedPages/hostedPageMapper'

export type HostedPageDebugSnapshot = {
  id: string
  userId: string
  slug: string
  isPublished: boolean
  createdAt: string | null
  source: 'rls' | 'admin'
}

export type HostedPageDebugResult = {
  sessionUserId: string | null
  hostedPageId: string
  rls: HostedPageDebugSnapshot | null
  admin: HostedPageDebugSnapshot | null
  rlsError?: string | null
  adminError?: string | null
}

type HostedPageSlugAliasRow = {
  hosted_page_id: string
}

type HostedPagePublishRow = {
  slug: string
}

type UserEmailRow = {
  id: string
  email: string | null
}

function toDebugSnapshot(row: HostedPageRow, source: HostedPageDebugSnapshot['source']): HostedPageDebugSnapshot {
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    isPublished: row.is_published ?? false,
    createdAt: row.created_at,
    source,
  }
}

function normalizeEmail(email: string | null | undefined) {
  return email ? email.trim().toLowerCase() : null
}

// Loads all hosted pages for a user (latest updated first).
export async function listHostedPagesByUser(userId: string) {
  const normalizedUserId = userId.trim().toLowerCase()
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('hosted_pages')
    .select('*')
    .eq('user_id', normalizedUserId)
    .order('updated_at', { ascending: false })

  if (error) {
    throw new Error('Failed to load hosted pages.')
  }

  return (data ?? []).map((row) => toHostedPage(row as HostedPageRow))
}

// Fetches a single hosted page by id for the owner.
export async function fetchHostedPageById(
  userId: string,
  hostedPageId: string,
  currentUserEmail?: string | null,
) {
  const normalizedUserId = userId.trim().toLowerCase()
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('hosted_pages')
    .select('*')
    .eq('id', hostedPageId)
    .eq('user_id', normalizedUserId)
    .maybeSingle<HostedPageRow>()

  if (error) {
    throw new Error('Failed to load hosted page.')
  }

  if (data) {
    return toHostedPage(data)
  }

  // Fallback for environments where SSR auth cookies are not forwarded.
  const admin = createAdminSupabaseClient()
  const { data: adminData, error: adminError } = await admin
    .from('hosted_pages')
    .select('*')
    .eq('id', hostedPageId)
    .maybeSingle<HostedPageRow>()

  if (adminError) {
    throw new Error('Failed to load hosted page.')
  }

  if (!adminData) {
    return null
  }

  const rowUserId = String(adminData.user_id).trim().toLowerCase()
  if (rowUserId !== normalizedUserId) {
    const normalizedCurrentUserEmail = normalizeEmail(currentUserEmail)
    if (!normalizedCurrentUserEmail) {
      return null
    }

    // Recover ownership only when both profile rows share the same verified email.
    // This keeps access scoped to the same person when auth user IDs drift.
    const { data: profileRows, error: profileError } = await admin
      .from('users')
      .select('id, email')
      .in('id', [normalizedUserId, rowUserId]) as { data: UserEmailRow[] | null; error: { message?: string } | null }

    if (profileError || !profileRows || profileRows.length < 2) {
      return null
    }

    const currentProfile = profileRows.find((row) => String(row.id).trim().toLowerCase() === normalizedUserId)
    const ownerProfile = profileRows.find((row) => String(row.id).trim().toLowerCase() === rowUserId)

    if (!currentProfile || !ownerProfile) {
      return null
    }

    const currentProfileEmail = normalizeEmail(currentProfile.email)
    const ownerProfileEmail = normalizeEmail(ownerProfile.email)

    if (
      currentProfileEmail !== normalizedCurrentUserEmail
      || ownerProfileEmail !== normalizedCurrentUserEmail
    ) {
      return null
    }

    const { data: relinkedRow, error: relinkError } = await admin
      .from('hosted_pages')
      .update({
        user_id: normalizedUserId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', hostedPageId)
      .eq('user_id', rowUserId)
      .select('*')
      .maybeSingle<HostedPageRow>()

    if (relinkError || !relinkedRow) {
      return null
    }

    return toHostedPage(relinkedRow)
  }

  return toHostedPage(adminData)
}

// Debug helper: loads both RLS-scoped and admin-scoped views for comparison.
export async function debugHostedPageAccess(userId: string | null, hostedPageId: string): Promise<HostedPageDebugResult> {
  const normalizedUserId = userId ? userId.trim().toLowerCase() : null
  const supabase = await createServerSupabaseClient()

  if (!normalizedUserId) {
    // Without a session user id we cannot safely check ownership; avoid leaking admin data.
    return {
      sessionUserId: null,
      hostedPageId,
      rls: null,
      admin: null,
      rlsError: null,
      adminError: null,
    }
  }

  let rlsData: HostedPageRow | null = null
  let rlsError: { message?: string } | null = null

  const rlsResponse = await supabase
    .from('hosted_pages')
    .select('*')
    .eq('id', hostedPageId)
    .eq('user_id', normalizedUserId)
    .maybeSingle<HostedPageRow>()

  rlsData = rlsResponse.data ?? null
  rlsError = rlsResponse.error

  const admin = createAdminSupabaseClient()
  const { data: adminData, error: adminError } = await admin
    .from('hosted_pages')
    .select('*')
    .eq('id', hostedPageId)
    .eq('user_id', normalizedUserId)
    .maybeSingle<HostedPageRow>()

  return {
    sessionUserId: normalizedUserId,
    hostedPageId,
    rls: rlsData ? toDebugSnapshot(rlsData, 'rls') : null,
    admin: adminData ? toDebugSnapshot(adminData, 'admin') : null,
    rlsError: rlsError?.message ?? null,
    adminError: adminError?.message ?? null,
  }
}

// Creates a new hosted page for a user.
export async function createHostedPage(input: HostedPageCreateInput) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('hosted_pages')
    .insert({
      user_id: input.userId,
      slug: input.slug,
      layout_config: input.layoutConfig ?? {},
      theme_color: input.themeColor ?? null,
      og_image_url: input.ogImageUrl ?? null,
      is_published: input.isPublished ?? false,
    })
    .select('*')
    .single<HostedPageRow>()

  if (error) {
    throw error
  }

  return toHostedPage(data)
}

// Updates fields on an existing hosted page.
export async function updateHostedPage(input: HostedPageUpdateInput) {
  const supabase = await createServerSupabaseClient()
  const updates: Partial<HostedPageRow> = {
    updated_at: new Date().toISOString(),
  }

  if (input.slug !== undefined) {
    updates.slug = input.slug
  }

  if (input.layoutConfig !== undefined) {
    updates.layout_config = input.layoutConfig ?? {}
  }

  if (input.themeColor !== undefined) {
    updates.theme_color = input.themeColor
  }

  if (input.ogImageUrl !== undefined) {
    updates.og_image_url = input.ogImageUrl
  }

  if (input.isPublished !== undefined) {
    updates.is_published = input.isPublished
  }

  const { data, error } = await supabase
    .from('hosted_pages')
    .update(updates)
    .eq('id', input.id)
    .eq('user_id', input.userId)
    .select('*')
    .maybeSingle<HostedPageRow>()

  if (error) {
    throw error
  }

  return data ? toHostedPage(data) : null
}

// Deletes a hosted page owned by the user.
export async function deleteHostedPage(userId: string, hostedPageId: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('hosted_pages')
    .delete()
    .eq('id', hostedPageId)
    .eq('user_id', userId)

  if (error) {
    throw new Error('Failed to delete hosted page.')
  }
}

// Public read: fetch a published hosted page by slug.
// Uses the admin client to avoid RLS issues while still enforcing `is_published = true`.
export async function fetchPublishedHostedPageBySlug(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!normalizedSlug) {
    return null
  }

  const admin = createAdminSupabaseClient()
  const { data, error } = await admin
    .from('hosted_pages')
    .select('*')
    .eq('slug', normalizedSlug)
    .eq('is_published', true)
    .maybeSingle<HostedPageRow>()

  if (error) {
    throw new Error('Failed to load hosted page.')
  }

  return data ? toHostedPage(data) : null
}

// Public read: resolves a legacy slug alias to the latest published hosted page slug.
export async function resolvePublishedHostedPageSlugAlias(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!normalizedSlug) {
    return null
  }

  const admin = createAdminSupabaseClient()
  const { data: aliasRow, error: aliasError } = await admin
    .from('hosted_page_slug_aliases')
    .select('hosted_page_id')
    .eq('old_slug', normalizedSlug)
    .maybeSingle<HostedPageSlugAliasRow>()

  if (aliasError) {
    throw new Error('Failed to resolve hosted page slug alias.')
  }

  if (!aliasRow) {
    return null
  }

  const { data: hostedPageRow, error: hostedPageError } = await admin
    .from('hosted_pages')
    .select('slug')
    .eq('id', aliasRow.hosted_page_id)
    .eq('is_published', true)
    .maybeSingle<HostedPagePublishRow>()

  if (hostedPageError) {
    throw new Error('Failed to resolve published hosted page by alias.')
  }

  return hostedPageRow?.slug ?? null
}
