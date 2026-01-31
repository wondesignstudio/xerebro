'use client'

import { useFormStatus } from 'react-dom'

type AiDraftEditorProps = {
  leadId: string
  canUndo: boolean
  applyAction: (formData: FormData) => Promise<void>
  undoAction: (formData: FormData) => Promise<void>
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? '처리 중...' : label}
    </button>
  )
}

export default function AiDraftEditor({ leadId, canUndo, applyAction, undoAction }: AiDraftEditorProps) {
  return (
    <div className="space-y-4">
      <form action={applyAction} className="space-y-3">
        <input type="hidden" name="leadId" value={leadId} />
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="prompt">
            AI에게 요청하기
          </label>
          <textarea
            id="prompt"
            name="prompt"
            required
            rows={3}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="예: 더 정중하게, 짧게 줄여줘"
          />
        </div>
        <SubmitButton label="AI 수정 요청" />
      </form>

      <form action={undoAction}>
        <input type="hidden" name="leadId" value={leadId} />
        <button
          type="submit"
          disabled={!canUndo}
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
        >
          이전 버전으로 되돌리기
        </button>
      </form>
    </div>
  )
}
