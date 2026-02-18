import type { ContextLinkCreateInput, ContextLinkUpdateInput } from '@/domain/contextLink'
import { createServerSupabaseClient } from '@/repositories/supabase/server'
import { createAdminSupabaseClient } from '@/repositories/supabase/admin'
import { toContextLink, type ContextLinkRow } from '@/repositories/contextLinks/contextLinkMapper'

type ContextLinkPublicRow = {
  id: string
  hosted_pages?: { slug: string; is_published: boolean | null } | { slug: string; is_published: boolean | null }[] | null
}

type ContextLinkSlugAliasRow = {
  context_link_id: string
}

type ContextLinkAliasResolutionRow = {
  slug: string
  hosted_pages?: { is_published: boolean | null } | { is_published: boolean | null }[] | null
}

export async function listContextLinksByHostedPage(userId: string, hostedPageId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('context_links')
    .select('*')
    .eq('user_id', userId)
    .eq('hosted_page_id', hostedPageId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to load context links.')
  }

  return (data ?? []).map((row) => toContextLink(row as ContextLinkRow))
}

export async function createContextLink(input: ContextLinkCreateInput) {
  const supabase = await createServerSupabaseClient()
  const { data: ownedHostedPage, error: hostedPageError } = await supabase
    .from('hosted_pages')
    .select('id')
    .eq('id', input.hostedPageId)
    .eq('user_id', input.userId)
    .maybeSingle()

  if (hostedPageError) {
    throw new Error('Failed to validate hosted page.')
  }

  if (!ownedHostedPage) {
    throw new Error('Hosted page not found.')
  }

  const { data, error } = await supabase
    .from('context_links')
    .insert({
      user_id: input.userId,
      lead_id: input.leadId,
      hosted_page_id: input.hostedPageId,
      slug: input.slug,
      target_message: input.targetMessage ?? null,
      is_active: input.isActive ?? true,
      click_count: 0,
    })
    .select('*')
    .single<ContextLinkRow>()

  if (error) {
    throw error
  }

  return toContextLink(data)
}

export async function updateContextLink(input: ContextLinkUpdateInput) {
  const supabase = await createServerSupabaseClient()
  const updates: Partial<ContextLinkRow> = {
    updated_at: new Date().toISOString(),
  }

  if (input.leadId !== undefined) {
    updates.lead_id = input.leadId
  }

  if (input.slug !== undefined) {
    updates.slug = input.slug
  }

  if (input.targetMessage !== undefined) {
    updates.target_message = input.targetMessage
  }

  if (input.isActive !== undefined) {
    updates.is_active = input.isActive
  }

  const { data, error } = await supabase
    .from('context_links')
    .update(updates)
    .eq('id', input.id)
    .eq('user_id', input.userId)
    .eq('hosted_page_id', input.hostedPageId)
    .select('*')
    .maybeSingle<ContextLinkRow>()

  if (error) {
    throw error
  }

  return data ? toContextLink(data) : null
}

export async function deleteContextLink(userId: string, hostedPageId: string, contextLinkId: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('context_links')
    .delete()
    .eq('id', contextLinkId)
    .eq('user_id', userId)
    .eq('hosted_page_id', hostedPageId)

  if (error) {
    throw new Error('Failed to delete context link.')
  }
}

export type ContextLinkPublicResolution = {
  contextLinkId: string
  hostedPageSlug: string
}

export async function resolveActiveContextLinkBySlug(slug: string): Promise<ContextLinkPublicResolution | null> {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!normalizedSlug) {
    return null
  }

  const admin = createAdminSupabaseClient()
  const { data, error } = await admin
    .from('context_links')
    .select('id, hosted_pages!inner(slug, is_published)')
    .eq('slug', normalizedSlug)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle<ContextLinkPublicRow>()

  if (error) {
    throw new Error('Failed to resolve context link.')
  }

  if (!data) {
    return null
  }

  const hostedPages = data.hosted_pages
  const hostedPage = Array.isArray(hostedPages) ? hostedPages[0] : hostedPages

  if (!hostedPage || hostedPage.is_published !== true) {
    return null
  }

  return {
    contextLinkId: data.id,
    hostedPageSlug: hostedPage.slug,
  }
}

export async function resolveActiveContextLinkSlugAlias(slug: string): Promise<string | null> {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!normalizedSlug) {
    return null
  }

  const admin = createAdminSupabaseClient()
  const { data: aliasRow, error: aliasError } = await admin
    .from('context_link_slug_aliases')
    .select('context_link_id')
    .eq('old_slug', normalizedSlug)
    .maybeSingle<ContextLinkSlugAliasRow>()

  if (aliasError) {
    throw new Error('Failed to resolve context link alias.')
  }

  if (!aliasRow) {
    return null
  }

  const { data: contextLinkRow, error: contextLinkError } = await admin
    .from('context_links')
    .select('slug, hosted_pages!inner(is_published)')
    .eq('id', aliasRow.context_link_id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle<ContextLinkAliasResolutionRow>()

  if (contextLinkError) {
    throw new Error('Failed to resolve context link alias target.')
  }

  if (!contextLinkRow) {
    return null
  }

  const hostedPages = contextLinkRow.hosted_pages
  const hostedPage = Array.isArray(hostedPages) ? hostedPages[0] : hostedPages

  if (!hostedPage || hostedPage.is_published !== true) {
    return null
  }

  return contextLinkRow.slug
}

export async function incrementContextLinkClickCount(contextLinkId: string) {
  const admin = createAdminSupabaseClient()
  const { error } = await admin.rpc('increment_context_link_click_count', {
    p_context_link_id: contextLinkId,
  })

  if (error) {
    throw new Error('Failed to update context link click count.')
  }
}
