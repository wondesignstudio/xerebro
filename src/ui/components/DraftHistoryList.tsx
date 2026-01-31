import type { LeadDraftVersion } from '@/repositories/leads/leadDraftRepository'

type DraftHistoryListProps = {
  leadId: string
  versions: LeadDraftVersion[]
  onRestore: (formData: FormData) => Promise<void>
}

const PREVIEW_LENGTH = 28

function toRelativeTime(createdAt: string) {
  const now = Date.now()
  const created = new Date(createdAt).getTime()
  const diffMs = now - created

  if (diffMs < 60 * 1000) {
    return '방금 전'
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000))

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`
  }

  const diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 24) {
    return `${diffHours}시간 전`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}일 전`
}

function toPreviewText(text: string) {
  if (text.length <= PREVIEW_LENGTH) {
    return text
  }

  return `${text.slice(0, PREVIEW_LENGTH)}...`
}

export default function DraftHistoryList({ leadId, versions, onRestore }: DraftHistoryListProps) {
  if (versions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-400">
        아직 히스토리가 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {versions.map((version) => (
        <div
          key={version.id}
          className="flex flex-col gap-2 rounded-lg border border-slate-200 px-3 py-3 text-sm md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-xs text-slate-400">{toRelativeTime(version.createdAt)}</p>
            <p className="mt-1 text-sm text-slate-700">
              {toPreviewText(version.draftMessage)}
            </p>
          </div>
          <form action={onRestore}>
            <input type="hidden" name="leadId" value={leadId} />
            <input type="hidden" name="versionId" value={version.id} />
            <button
              type="submit"
              className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
            >
              복원
            </button>
          </form>
        </div>
      ))}
    </div>
  )
}
