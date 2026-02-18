# Plan v0.10

Date: 2026-01-30
Owner: Codex
Scope: REQ-02 AI Conversational Editor (draft_message + undo)

## Steps
1. Add plan/progress logs.
2. Add DB migrations for draft_message and lead_draft_versions.
3. Add OpenAI API route (Responses API, gpt-4o-mini).
4. Add repositories/viewmodels for draft update + undo.
5. Add UI for draft display + chat input + undo.
6. Run lint/test and update progress log.

## Notes
- Non-streaming responses (spinner + full update).
- History stored in DB; UI exposes only 1-step undo.
- Safety guardrails in system prompt.
