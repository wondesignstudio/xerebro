# Plan v0.7

Date: 2026-01-30
Owner: Codex
Scope: REQ-01 Daily Lead Curation (list/detail + credit deduction)

## Steps
1. Add plan/progress logs.
2. Add lead domain model and repository queries.
3. Add leads viewmodel (list, detail, view action with ledger deduction).
4. Add leads UI with split view and view action wiring.
5. Run lint/test and update progress log.

## Notes
- Only status='new' leads, ordered by ai_urgency_score desc, limit 5.
- Lead view deducts 1 credit and logs transaction via ledger RPC.
- Lead status is not changed on view.
