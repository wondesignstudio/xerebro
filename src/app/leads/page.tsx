import {
  applyAiEditAction,
  copyLeadAction,
  reportLeadAction,
  requestLeadNotificationAction,
  restoreDraftVersionAction,
  undoAiEditAction,
  viewLeadAction,
} from '@/viewmodels/leads/actions'
import { getDailyLeads, getLeadDraftContext, getLeadNotificationStatus } from '@/viewmodels/leads/queries'
import AiDraftEditor from '@/ui/components/AiDraftEditor'
import CopyDraftButton from '@/ui/components/CopyDraftButton'
import DraftHistoryList from '@/ui/components/DraftHistoryList'
import ReportLeadModal from '@/ui/components/ReportLeadModal'

type LeadsPageProps = {
  searchParams?: {
    lead?: string
    error?: string
    reported?: string
    edited?: string
    undo?: string
    restored?: string
    notify?: string
  }
}

const errorMessages: Record<string, string> = {
  missing_lead: '리드를 선택해 주세요.',
  not_found: '해당 리드를 찾을 수 없습니다.',
  insufficient_credits: '크레딧이 부족합니다. 내 지갑을 확인해 주세요.',
  deduct_failed: '크레딧 차감에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  missing_report_fields: '신고 사유를 선택해 주세요.',
  already_reported: '이미 신고한 리드입니다.',
  reward_failed: '보상 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  missing_prompt: 'AI 요청 문구를 입력해 주세요.',
  missing_draft: '초안이 없어 AI 편집을 진행할 수 없습니다.',
  ai_failed: 'AI 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  undo_unavailable: '되돌릴 이전 버전이 없습니다.',
  notify_failed: '알림 신청에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  history_not_found: '선택한 히스토리를 찾을 수 없습니다.',
}

const statusBadgeStyles: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-amber-50 text-amber-700 border-amber-200',
  reported: 'bg-rose-50 text-rose-700 border-rose-200',
  converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

function LeadStatusBadge({ status }: { status: string }) {
  const styles = statusBadgeStyles[status] ?? 'bg-slate-50 text-slate-600 border-slate-200'

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${styles}`}
    >
      {status.toUpperCase()}
    </span>
  )
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const leadId = searchParams?.lead
  const errorKey = searchParams?.error
  const reported = searchParams?.reported === '1'
  const edited = searchParams?.edited === '1'
  const undo = searchParams?.undo === '1'
  const restored = searchParams?.restored === '1'
  const notified = searchParams?.notify === '1'
  const leads = await getDailyLeads()
  const { lead: selectedLead, canUndo, history } = leadId
    ? await getLeadDraftContext(leadId)
    : { lead: null, canUndo: false, history: [] }
  const notificationStatus = leads.length === 0 ? await getLeadNotificationStatus() : null
  const isNotificationPending = notificationStatus?.status === 'pending'

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6">
          <p className="text-sm font-semibold text-slate-500">Lead Discovery</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">오늘의 추천 리드</h1>
          <p className="mt-2 text-sm text-slate-500">
            신규 리드 중 AI 점수 상위 5건을 제공합니다.
          </p>
        </header>

        {errorKey && errorMessages[errorKey] ? (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {errorMessages[errorKey]}
          </div>
        ) : null}

        {reported ? (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            신고가 접수되었습니다. 무료 크레딧 1개가 보상되었습니다.
          </div>
        ) : null}

        {edited ? (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            AI가 초안을 업데이트했습니다.
          </div>
        ) : null}

        {undo ? (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            이전 버전으로 되돌렸습니다.
          </div>
        ) : null}

        {restored ? (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            선택한 버전으로 복원했습니다.
          </div>
        ) : null}

        {notified ? (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            알림 신청이 완료되었습니다. 이메일로 알려드릴게요.
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700">리드 목록</h2>
            <div className="mt-4 space-y-3">
              {leads.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  <p className="font-semibold text-slate-700">탐색 중입니다</p>
                  <p className="mt-2">
                    리드를 찾는 중입니다. 완료되면 이메일로 알려드릴게요.
                  </p>
                  <div className="mt-4">
                    {isNotificationPending ? (
                      <button
                        type="button"
                        disabled
                        className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-400"
                      >
                        알림 신청 완료
                      </button>
                    ) : (
                      <form action={requestLeadNotificationAction}>
                        <button
                          type="submit"
                          className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                        >
                          알림 신청하기 (이메일)
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ) : (
                leads.map((lead) => (
                  <div
                    key={lead.id}
                    className={`rounded-lg border px-3 py-3 text-sm ${
                      lead.id === leadId ? 'border-blue-500 bg-blue-50/40' : 'border-slate-200'
                    }`}
                  >
                    <p className="font-semibold text-slate-800">
                      {lead.contentSummary || '요약 정보 없음'}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>
                        채널: {lead.sourceChannel ?? '미상'} · 점수:{' '}
                        {lead.aiUrgencyScore ?? '-'}
                      </span>
                      <LeadStatusBadge status={lead.status} />
                    </div>
                    <form action={viewLeadAction.bind(null, lead.id)} className="mt-3">
                      <button
                        type="submit"
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        열람하기 (크레딧 -1)
                      </button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            {selectedLead ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">리드 상세</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    채널: {selectedLead.sourceChannel ?? '미상'} · 점수:{' '}
                    {selectedLead.aiUrgencyScore ?? '-'}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {selectedLead.contentSummary ?? '리드 요약 정보가 없습니다.'}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-slate-700">메시지 초안</h3>
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
                    {selectedLead.draftMessage ?? '초안이 아직 준비되지 않았습니다.'}
                  </p>
                  <div className="mt-4">
                    <AiDraftEditor
                      leadId={selectedLead.id}
                      canUndo={canUndo}
                      applyAction={applyAiEditAction}
                      undoAction={undoAiEditAction}
                    />
                  </div>
                  <div className="mt-4">
                    <CopyDraftButton
                      leadId={selectedLead.id}
                      draftMessage={selectedLead.draftMessage}
                      contentSummary={selectedLead.contentSummary}
                      originalUrl={selectedLead.originalUrl}
                      onCopied={copyLeadAction}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700">히스토리</h3>
                    <span className="text-xs text-slate-400">최근 5개</span>
                  </div>
                  <div className="mt-3">
                    <DraftHistoryList
                      leadId={selectedLead.id}
                      versions={history}
                      onRestore={restoreDraftVersionAction}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    AI Intent: {selectedLead.aiIntent ?? '미분류'}
                  </div>
                  <ReportLeadModal leadId={selectedLead.id} action={reportLeadAction} />
                </div>

                <div className="text-sm text-slate-500">
                  원본 링크:{' '}
                  {selectedLead.originalUrl ? (
                    <a
                      href={selectedLead.originalUrl}
                      className="text-blue-600 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      열기
                    </a>
                  ) : (
                    '미제공'
                  )}
                </div>

                <div className="rounded-lg border border-slate-100 px-4 py-3 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>리드 상태:</span>
                    <LeadStatusBadge status={selectedLead.status} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center py-20 text-center text-sm text-slate-400">
                리드를 선택하면 상세 정보가 표시됩니다.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
