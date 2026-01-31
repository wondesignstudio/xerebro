'use server'

import { redirect } from 'next/navigation'
import { formatTransactionDescription } from '@/domain/transaction'
import { requestAiDraftUpdate } from '@/repositories/ai/aiDraftRepository'
import { ledgerRewardCredits } from '@/repositories/ledger/ledgerRepository'
import {
  hasDraftHistory,
  insertDraftVersion,
  listDraftVersions,
  updateLeadDraftMessage,
} from '@/repositories/leads/leadDraftRepository'
import { fetchDraftVersionById } from '@/repositories/leads/leadDraftRepository'
import { upsertLeadNotification } from '@/repositories/leads/leadNotificationRepository'
import { updateLeadStatusOnCopy } from '@/repositories/leads/leadStatusRepository'
import { ensureWallet } from '@/repositories/wallets/walletRepository'
import { fetchLeadById } from '@/repositories/leads/leadRepository'
import { deductCreditsAction } from '@/viewmodels/transactions/actions'
import { requireAuthUserWithConsentOrRedirect } from '@/viewmodels/auth/guards'

// Handles lead view: validates lead, deducts credits, then navigates to detail.
export async function viewLeadAction(leadId: string) {
  const { user } = await requireAuthUserWithConsentOrRedirect()

  if (!leadId) {
    redirect('/leads?error=missing_lead')
  }

  const lead = await fetchLeadById(leadId)

  if (!lead) {
    redirect('/leads?error=not_found')
  }

  // Ensure wallet exists before calling the ledger RPC.
  await ensureWallet(user.id)

  try {
    await deductCreditsAction({
      amount: 1,
      type: 'lead_view',
      relatedLeadId: leadId,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to deduct credits.'

    if (message.toLowerCase().includes('insufficient')) {
      redirect('/leads?error=insufficient_credits')
    }

    redirect('/leads?error=deduct_failed')
  }

  redirect(`/leads?lead=${leadId}`)
}

// Reports a lead and grants an instant reward credit.
export async function reportLeadAction(formData: FormData) {
  const { user } = await requireAuthUserWithConsentOrRedirect()

  const leadId = String(formData.get('leadId') ?? '')
  const reasonCode = String(formData.get('reasonCode') ?? '')
  const reasonDetail = String(formData.get('reasonDetail') ?? '')

  if (!leadId || !reasonCode) {
    redirect('/leads?error=missing_report_fields')
  }

  // Ensure lead exists before attempting reward.
  const lead = await fetchLeadById(leadId)
  if (!lead) {
    redirect('/leads?error=not_found')
  }

  // Ensure wallet exists to satisfy the reward RPC.
  await ensureWallet(user.id)

  const description = formatTransactionDescription({
    type: 'report_reward',
    leadId,
  })

  try {
    await ledgerRewardCredits({
      userId: user.id,
      leadId,
      reasonCode,
      reasonDetail: reasonDetail ? reasonDetail.trim() : null,
      description,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reward credits.'

    const normalizedMessage = message.toLowerCase()

    if (normalizedMessage.includes('already') || normalizedMessage.includes('duplicate')) {
      redirect('/leads?error=already_reported')
    }

    redirect('/leads?error=reward_failed')
  }

  redirect('/leads?reported=1')
}

// Applies an AI-driven edit to the draft message and stores history.
export async function applyAiEditAction(formData: FormData) {
  const { user } = await requireAuthUserWithConsentOrRedirect()

  const leadId = String(formData.get('leadId') ?? '')
  const prompt = String(formData.get('prompt') ?? '').trim()

  if (!leadId || !prompt) {
    redirect(leadId ? `/leads?lead=${leadId}&error=missing_prompt` : '/leads?error=missing_prompt')
  }

  const lead = await fetchLeadById(leadId)

  if (!lead) {
    redirect('/leads?error=not_found')
  }

  const currentDraft = lead.draftMessage ?? lead.contentSummary ?? ''

  if (!currentDraft) {
    redirect(`/leads?lead=${leadId}&error=missing_draft`)
  }

  // Store the initial draft as baseline if no history exists yet.
  if (!(await hasDraftHistory(leadId))) {
    await insertDraftVersion({ leadId, userId: user.id, draftMessage: currentDraft })
  }

  let nextDraft = ''

  try {
    nextDraft = await requestAiDraftUpdate({ prompt, draftMessage: currentDraft })
  } catch {
    redirect(`/leads?lead=${leadId}&error=ai_failed`)
  }

  await updateLeadDraftMessage(leadId, nextDraft)
  await insertDraftVersion({ leadId, userId: user.id, draftMessage: nextDraft })

  redirect(`/leads?lead=${leadId}&edited=1`)
}

// Restores the previous draft version (one-step undo).
export async function undoAiEditAction(formData: FormData) {
  const { user } = await requireAuthUserWithConsentOrRedirect()

  const leadId = String(formData.get('leadId') ?? '')

  if (!leadId) {
    redirect('/leads?error=missing_lead')
  }

  const versions = await listDraftVersions(leadId, 2)

  if (versions.length < 2) {
    redirect(`/leads?lead=${leadId}&error=undo_unavailable`)
  }

  const previousVersion = versions[1]
  const lead = await fetchLeadById(leadId)

  if (!lead || lead.draftMessage === previousVersion.draftMessage) {
    redirect(`/leads?lead=${leadId}&error=undo_unavailable`)
  }

  await updateLeadDraftMessage(leadId, previousVersion.draftMessage)
  await insertDraftVersion({ leadId, userId: user.id, draftMessage: previousVersion.draftMessage })

  redirect(`/leads?lead=${leadId}&undo=1`)
}

// Restores a specific draft version without creating a new history entry.
export async function restoreDraftVersionAction(formData: FormData) {
  const { user } = await requireAuthUserWithConsentOrRedirect()

  const leadId = String(formData.get('leadId') ?? '')
  const versionId = String(formData.get('versionId') ?? '')

  if (!leadId || !versionId) {
    redirect('/leads?error=missing_lead')
  }

  const version = await fetchDraftVersionById({
    leadId,
    userId: user.id,
    versionId,
  })

  if (!version) {
    redirect(`/leads?lead=${leadId}&error=history_not_found`)
  }

  await updateLeadDraftMessage(leadId, version.draftMessage)

  redirect(`/leads?lead=${leadId}&restored=1`)
}

// Updates lead status after user copies the message.
export type CopyLeadResult =
  | { ok: true }
  | { ok: false; error: 'missing_lead' | 'not_found' }

// Updates lead status after user copies the message.
export async function copyLeadAction(formData: FormData): Promise<CopyLeadResult> {
  await requireAuthUserWithConsentOrRedirect()
  const leadId = String(formData.get('leadId') ?? '')

  if (!leadId) {
    return { ok: false, error: 'missing_lead' }
  }

  const lead = await fetchLeadById(leadId)

  if (!lead) {
    return { ok: false, error: 'not_found' }
  }

  await updateLeadStatusOnCopy(leadId)

  return { ok: true }
}

// Records a notification request for lead discovery completion.
export async function requestLeadNotificationAction() {
  const { user } = await requireAuthUserWithConsentOrRedirect()

  try {
    await upsertLeadNotification(user.id, 'initial_search')
  } catch {
    redirect('/leads?error=notify_failed')
  }

  redirect('/leads?notify=1')
}
